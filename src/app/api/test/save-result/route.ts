import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '../../../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const testData = await request.json()

    const { db } = await connectToDatabase()
    const testResults = db.collection('test_results')
    const users = db.collection('users')

    // Validate test data
    const {
      score,
      totalProblems,
      correctAnswers,
      incorrectAnswers,
      duration,
      difficulty,
      operations,
      problems,
      averagePPM,
      accuracy,
      testType,
      isRestart = false
    } = testData

    if (!score || !totalProblems || !duration) {
      return NextResponse.json(
        { error: 'Missing required test data' },
        { status: 400 }
      )
    }

    // Save test result
    const testResult = await testResults.insertOne({
      userId: decoded.userId,
      score,
      totalProblems,
      correctAnswers,
      incorrectAnswers,
      duration,
      difficulty,
      operations,
      problems,
      averagePPM,
      accuracy,
      testType: testType || 'standard',
      isRestart,
      createdAt: new Date(),
      timestamp: Date.now()
    })

    // Update user stats
    const user = await users.findOne({ _id: decoded.userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate updated stats
    const currentStats = user.stats || {
      totalTests: 0,
      bestScore: 0,
      averageScore: 0,
      totalProblems: 0,
      accuracy: 0,
      totalTimeSpent: 0,
      testsRestarted: 0,
      averagePPM: 0
    }

    const newTotalTests = currentStats.totalTests + 1
    const newTotalProblems = currentStats.totalProblems + totalProblems
    const newTotalTimeSpent = currentStats.totalTimeSpent + duration
    const newBestScore = Math.max(currentStats.bestScore, score)
    const newTestsRestarted = currentStats.testsRestarted + (isRestart ? 1 : 0)

    // Calculate new averages
    const newAverageScore = ((currentStats.averageScore * currentStats.totalTests) + score) / newTotalTests
    const newAveragePPM = newTotalTimeSpent > 0 ? Math.round((newTotalProblems / (newTotalTimeSpent / 60))) : 0

    // Calculate overall accuracy
    const allUserTests = await testResults.find({ userId: decoded.userId }).toArray()
    const totalCorrectAll = allUserTests.reduce((sum, test) => sum + (test.correctAnswers || 0), 0) + correctAnswers
    const totalProblemsAll = allUserTests.reduce((sum, test) => sum + (test.totalProblems || 0), 0) + totalProblems
    const newAccuracy = totalProblemsAll > 0 ? (totalCorrectAll / totalProblemsAll) * 100 : 0

    // Update user stats
    await users.updateOne(
      { _id: decoded.userId },
      {
        $set: {
          'stats.totalTests': newTotalTests,
          'stats.bestScore': Math.round(newBestScore),
          'stats.averageScore': Math.round(newAverageScore),
          'stats.totalProblems': newTotalProblems,
          'stats.accuracy': Math.round(newAccuracy * 100) / 100,
          'stats.totalTimeSpent': newTotalTimeSpent,
          'stats.testsRestarted': newTestsRestarted,
          'stats.averagePPM': newAveragePPM,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      message: 'Test result saved successfully',
      testId: testResult.insertedId,
      stats: {
        totalTests: newTotalTests,
        bestScore: Math.round(newBestScore),
        averageScore: Math.round(newAverageScore),
        totalProblems: newTotalProblems,
        accuracy: Math.round(newAccuracy * 100) / 100,
        testsRestarted: newTestsRestarted,
        averagePPM: newAveragePPM
      }
    })
  } catch (error) {
    console.error('Save test result error:', error)
    return NextResponse.json({ error: 'Failed to save test result' }, { status: 500 })
  }
}
