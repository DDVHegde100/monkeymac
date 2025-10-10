import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../../../lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { db } = await connectToDatabase()
    
    const tests = db.collection('test_results')

    // Get URL parameters for pagination and filtering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const difficulty = searchParams.get('difficulty')
    const duration = searchParams.get('duration')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    const query: any = { userId: new ObjectId(decoded.userId) }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty
    }
    
    if (duration && duration !== 'all') {
      query.duration = parseInt(duration)
    }
    
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) query.createdAt.$gte = new Date(startDate)
      if (endDate) query.createdAt.$lte = new Date(endDate)
    }

    // Get total count for pagination
    const totalTests = await tests.countDocuments(query)
    
    // Get paginated results
    const userTests = await tests
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Calculate session statistics
    const sessions = groupTestsIntoSessions(userTests)
    
    // Get test trends (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentTests = await tests
      .find({ 
        userId: new ObjectId(decoded.userId),
        createdAt: { $gte: thirtyDaysAgo }
      })
      .sort({ createdAt: 1 })
      .toArray()

    const dailyStats = calculateDailyStats(recentTests)

    return NextResponse.json({
      tests: userTests.map(test => ({
        _id: test._id,
        score: test.score,
        accuracy: test.accuracy,
        correctAnswers: test.correctAnswers,
        totalProblems: test.totalProblems,
        difficulty: test.difficulty,
        duration: test.duration,
        problemsPerMinute: test.problemsPerMinute,
        createdAt: test.createdAt,
        restartCount: test.restartCount || 0,
        timeSpent: test.timeSpent || test.duration,
        operations: test.operations || []
      })),
      sessions,
      dailyStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTests / limit),
        totalTests,
        hasNext: page * limit < totalTests,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Test history API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

interface Session {
  id: string
  startTime: Date
  endTime: Date
  tests: any[]
  totalTests: number
  totalProblems: number
  totalCorrect: number
  averageAccuracy: number
  averageScore: number
  difficulties: string[]
  durations: number[]
}

function groupTestsIntoSessions(tests: any[]) {
  const sessions: Session[] = []
  let currentSession: Session | null = null
  const SESSION_GAP_MINUTES = 30 // If gap between tests > 30 minutes, new session

  for (const test of tests) {
    const testTime = new Date(test.createdAt)
    
    if (!currentSession || 
        (currentSession.endTime && 
         (testTime.getTime() - currentSession.endTime.getTime()) > SESSION_GAP_MINUTES * 60 * 1000)) {
      // Start new session
      currentSession = {
        id: `session_${Date.now()}_${Math.random()}`,
        startTime: testTime,
        endTime: testTime,
        tests: [test],
        totalTests: 1,
        totalProblems: test.totalProblems || 0,
        totalCorrect: test.correctAnswers || 0,
        averageAccuracy: test.accuracy || 0,
        averageScore: test.score || 0,
        difficulties: [test.difficulty],
        durations: [test.duration]
      }
      sessions.push(currentSession)
    } else {
      // Add to current session
      currentSession.endTime = testTime
      currentSession.tests.push(test)
      currentSession.totalTests++
      currentSession.totalProblems += test.totalProblems || 0
      currentSession.totalCorrect += test.correctAnswers || 0
      
      // Recalculate averages
      const sessionTests = currentSession.tests
      currentSession.averageAccuracy = sessionTests.reduce((sum, t) => sum + (t.accuracy || 0), 0) / sessionTests.length
      currentSession.averageScore = sessionTests.reduce((sum, t) => sum + (t.score || 0), 0) / sessionTests.length
      
      // Track unique difficulties and durations
      if (!currentSession.difficulties.includes(test.difficulty)) {
        currentSession.difficulties.push(test.difficulty)
      }
      if (!currentSession.durations.includes(test.duration)) {
        currentSession.durations.push(test.duration)
      }
    }
  }

  return sessions.map(session => ({
    ...session,
    duration: session.endTime.getTime() - session.startTime.getTime(),
    sessionAccuracy: session.totalProblems > 0 ? (session.totalCorrect / session.totalProblems) * 100 : 0
  }))
}

function calculateDailyStats(tests: any[]) {
  const dailyMap = new Map()
  
  tests.forEach(test => {
    const dateKey = new Date(test.createdAt).toISOString().split('T')[0]
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        testsCount: 0,
        totalProblems: 0,
        totalCorrect: 0,
        totalScore: 0,
        bestScore: 0,
        averageAccuracy: 0,
        difficulties: new Set(),
        durations: new Set()
      })
    }
    
    const dayStats = dailyMap.get(dateKey)
    dayStats.testsCount++
    dayStats.totalProblems += test.totalProblems || 0
    dayStats.totalCorrect += test.correctAnswers || 0
    dayStats.totalScore += test.score || 0
    dayStats.bestScore = Math.max(dayStats.bestScore, test.score || 0)
    dayStats.difficulties.add(test.difficulty)
    dayStats.durations.add(test.duration)
  })
  
  return Array.from(dailyMap.values()).map(day => ({
    ...day,
    averageScore: day.testsCount > 0 ? day.totalScore / day.testsCount : 0,
    averageAccuracy: day.totalProblems > 0 ? (day.totalCorrect / day.totalProblems) * 100 : 0,
    difficulties: Array.from(day.difficulties),
    durations: Array.from(day.durations)
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
