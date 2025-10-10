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
    
    const userId = new ObjectId(decoded.userId)
    const tests = db.collection('test_results')

    // Get all test results for detailed analysis
    const allTests = await tests.find({ userId }).sort({ createdAt: -1 }).toArray()

    if (allTests.length === 0) {
      return NextResponse.json({
        message: 'No test data available',
        operationStats: {},
        overallStats: {}
      })
    }

    // Calculate operation-specific statistics
    const operationStats = await calculateOperationStats(allTests)
    const overallStats = await calculateOverallStats(allTests)
    const timeAnalysis = await calculateTimeAnalysis(allTests)
    const difficultyBreakdown = await calculateDifficultyBreakdown(allTests)

    return NextResponse.json({
      operationStats,
      overallStats,
      timeAnalysis,
      difficultyBreakdown,
      totalTests: allTests.length
    })

  } catch (error) {
    console.error('Operation stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function calculateOperationStats(allTests: any[]) {
  const operationData: any = {
    addition: { totalProblems: 0, totalCorrect: 0, totalTime: 0, testCount: 0, avgAccuracy: 0, avgTimePerProblem: 0 },
    subtraction: { totalProblems: 0, totalCorrect: 0, totalTime: 0, testCount: 0, avgAccuracy: 0, avgTimePerProblem: 0 },
    multiplication: { totalProblems: 0, totalCorrect: 0, totalTime: 0, testCount: 0, avgAccuracy: 0, avgTimePerProblem: 0 },
    division: { totalProblems: 0, totalCorrect: 0, totalTime: 0, testCount: 0, avgAccuracy: 0, avgTimePerProblem: 0 }
  }

  // Process each test
  for (const test of allTests) {
    const operations = test.operations || ['addition', 'subtraction', 'multiplication', 'division']
    const problemsPerOperation = Math.ceil((test.totalProblems || 0) / operations.length)
    const correctPerOperation = Math.ceil((test.correctAnswers || 0) / operations.length)
    const timePerOperation = (test.timeSpent || test.duration || 0) / operations.length

    operations.forEach((op: string) => {
      if (operationData[op]) {
        operationData[op].totalProblems += problemsPerOperation
        operationData[op].totalCorrect += correctPerOperation  
        operationData[op].totalTime += timePerOperation
        operationData[op].testCount += 1
      }
    })
  }

  // Calculate averages
  Object.keys(operationData).forEach(op => {
    const data = operationData[op]
    if (data.totalProblems > 0) {
      data.avgAccuracy = (data.totalCorrect / data.totalProblems) * 100
      data.avgTimePerProblem = data.totalTime / data.totalProblems
    }
  })

  return operationData
}

async function calculateOverallStats(allTests: any[]) {
  const totalTests = allTests.length
  const totalProblems = allTests.reduce((sum, test) => sum + (test.totalProblems || 0), 0)
  const totalCorrect = allTests.reduce((sum, test) => sum + (test.correctAnswers || 0), 0)
  const totalTime = allTests.reduce((sum, test) => sum + (test.timeSpent || test.duration || 0), 0)

  const bestScore = Math.max(...allTests.map(test => test.score || 0))
  const avgScore = allTests.reduce((sum, test) => sum + (test.score || 0), 0) / totalTests
  const avgAccuracy = totalProblems > 0 ? (totalCorrect / totalProblems) * 100 : 0
  const avgTimePerProblem = totalProblems > 0 ? totalTime / totalProblems : 0
  const avgProblemsPerMinute = totalTime > 0 ? (totalProblems / (totalTime / 60)) : 0

  return {
    totalTests,
    totalProblems,
    totalCorrect,
    totalTime,
    bestScore,
    avgScore: Math.round(avgScore * 10) / 10,
    avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    avgTimePerProblem: Math.round(avgTimePerProblem * 100) / 100,
    avgProblemsPerMinute: Math.round(avgProblemsPerMinute * 10) / 10
  }
}

async function calculateTimeAnalysis(allTests: any[]) {
  const timeRanges = {
    '0-2s': 0,
    '2-4s': 0,
    '4-6s': 0,
    '6-10s': 0,
    '10s+': 0
  }

  allTests.forEach(test => {
    const avgTimePerProblem = (test.timeSpent || test.duration || 0) / (test.totalProblems || 1)
    
    if (avgTimePerProblem <= 2) timeRanges['0-2s']++
    else if (avgTimePerProblem <= 4) timeRanges['2-4s']++
    else if (avgTimePerProblem <= 6) timeRanges['4-6s']++
    else if (avgTimePerProblem <= 10) timeRanges['6-10s']++
    else timeRanges['10s+']++
  })

  return timeRanges
}

async function calculateDifficultyBreakdown(allTests: any[]) {
  const difficultyStats: any = {}

  allTests.forEach(test => {
    const difficulty = test.difficulty || 'unknown'
    if (!difficultyStats[difficulty]) {
      difficultyStats[difficulty] = {
        testCount: 0,
        totalProblems: 0,
        totalCorrect: 0,
        totalTime: 0,
        bestScore: 0,
        avgScore: 0,
        avgAccuracy: 0,
        avgTimePerProblem: 0
      }
    }

    const stats = difficultyStats[difficulty]
    stats.testCount++
    stats.totalProblems += test.totalProblems || 0
    stats.totalCorrect += test.correctAnswers || 0
    stats.totalTime += test.timeSpent || test.duration || 0
    stats.bestScore = Math.max(stats.bestScore, test.score || 0)
  })

  // Calculate averages
  Object.keys(difficultyStats).forEach(difficulty => {
    const stats = difficultyStats[difficulty]
    stats.avgScore = stats.testCount > 0 ? stats.totalProblems / stats.testCount : 0
    stats.avgAccuracy = stats.totalProblems > 0 ? (stats.totalCorrect / stats.totalProblems) * 100 : 0
    stats.avgTimePerProblem = stats.totalProblems > 0 ? stats.totalTime / stats.totalProblems : 0
    
    // Round for display
    stats.avgScore = Math.round(stats.avgScore * 10) / 10
    stats.avgAccuracy = Math.round(stats.avgAccuracy * 10) / 10
    stats.avgTimePerProblem = Math.round(stats.avgTimePerProblem * 100) / 100
  })

  return difficultyStats
}
