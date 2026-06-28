import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../../../lib/mongodb'
import { getRankTitle, normalizeUserStats } from '../../../../lib/userStats'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { db } = await connectToDatabase()
    
    const users = db.collection('users')
    const tests = db.collection('test_results')

    // Get user data
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all test results for this user
    const userTests = await tests.find({ userId: new ObjectId(decoded.userId) }).sort({ createdAt: -1 }).toArray()

    // Calculate comprehensive stats
    const totalTests = userTests.length
    const totalProblems = userTests.reduce((sum, test) => sum + (test.totalProblems || 0), 0)
    const totalCorrect = userTests.reduce((sum, test) => sum + (test.correctAnswers || 0), 0)
    const totalTimeSpent = userTests.reduce((sum, test) => sum + (test.duration || 0), 0)
    
    const scores = userTests.map(test => test.score || 0).filter(score => score > 0)
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    
    const accuracy = totalProblems > 0 ? (totalCorrect / totalProblems) * 100 : 0
    const averagePPM = totalTimeSpent > 0 ? Math.round((totalProblems / (totalTimeSpent / 60))) : 0

    // Calculate weekly stats
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const testsThisWeek = userTests.filter(test => 
      new Date(test.createdAt) >= oneWeekAgo
    ).length

    // Calculate streaks (simplified - would need daily test tracking for accurate streaks)
    const currentStreak = 0 // Placeholder
    const longestStreak = 0 // Placeholder

    // Find favorite operation (placeholder)
    const favoriteOperation = 'Addition'

    // Recent tests for display
    const recentTests = userTests.slice(0, 10).map(test => ({
      id: test._id.toString(),
      score: test.score || 0,
      accuracy: test.totalProblems > 0 ? ((test.correctAnswers || 0) / test.totalProblems) * 100 : 0,
      duration: test.duration || 0,
      problems: test.totalProblems || 0,
      date: test.createdAt || new Date().toISOString()
    }))

    // Get records data
    const records = user.records || {}
    const competitive = normalizeUserStats(user.stats)
    
    const stats = {
      totalTests,
      bestScore: Math.round(bestScore),
      averageScore: Math.round(averageScore),
      totalProblems,
      accuracy,
      totalTimeSpent,
      averagePPM,
      testsThisWeek,
      currentStreak,
      longestStreak,
      favoriteOperation,
      recentTests,
      records,
      elo: competitive.elo,
      multiplayerWins: competitive.multiplayerWins,
      multiplayerLosses: competitive.multiplayerLosses,
      multiplayerGames: competitive.multiplayerGames,
      rankTitle: getRankTitle(competitive.elo),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
