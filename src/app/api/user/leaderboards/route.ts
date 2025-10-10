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
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'overall'
    const timeframe = searchParams.get('timeframe') || 'all-time'
    const difficulty = searchParams.get('difficulty') || 'all'
    const limit = parseInt(searchParams.get('limit') || '100')

    // Get leaderboards based on category
    const leaderboards = await generateLeaderboards(db, category, timeframe, difficulty, limit)
    
    // Get user's ranking in each leaderboard
    const userRankings = await getUserRankings(db, decoded.userId, category, timeframe, difficulty)
    
    // Get achievements data
    const achievements = await getAchievements(db, decoded.userId)

    return NextResponse.json({
      leaderboards,
      userRankings,
      achievements
    })

  } catch (error) {
    console.error('Leaderboards API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateLeaderboards(db: any, category: string, timeframe: string, difficulty: string, limit: number) {
  const users = db.collection('users')
  const tests = db.collection('test_results')

  // Build time filter
  let timeFilter = {}
  if (timeframe !== 'all-time') {
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(0)
    }
    
    timeFilter = { createdAt: { $gte: startDate } }
  }

  // Build difficulty filter
  let difficultyFilter = {}
  if (difficulty !== 'all') {
    difficultyFilter = { difficulty }
  }

  const matchStage = {
    ...timeFilter,
    ...difficultyFilter
  }

  const leaderboards: Record<string, any[]> = {}

  if (category === 'overall' || category === 'best-score') {
    // Best Single Score Leaderboard
    leaderboards.bestScore = await tests.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
          testCount: { $sum: 1 },
          bestScoreDate: { $first: '$createdAt' },
          averageAccuracy: { $avg: '$accuracy' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          bestScore: 1,
          testCount: 1,
          bestScoreDate: 1,
          averageAccuracy: { $round: ['$averageAccuracy', 1] }
        }
      },
      { $sort: { bestScore: -1 } },
      { $limit: limit }
    ]).toArray()
  }

  if (category === 'overall' || category === 'average-score') {
    // Average Score Leaderboard
    leaderboards.averageScore = await tests.aggregate([
      { $match: { ...matchStage, score: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$userId',
          averageScore: { $avg: '$score' },
          testCount: { $sum: 1 },
          totalProblems: { $sum: '$totalProblems' },
          totalCorrect: { $sum: '$correctAnswers' }
        }
      },
      { $match: { testCount: { $gte: 5 } } }, // Minimum 5 tests for ranking
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          averageScore: { $round: ['$averageScore', 1] },
          testCount: 1,
          totalProblems: 1,
          totalCorrect: 1,
          overallAccuracy: { 
            $round: [{ $multiply: [{ $divide: ['$totalCorrect', '$totalProblems'] }, 100] }, 1] 
          }
        }
      },
      { $sort: { averageScore: -1 } },
      { $limit: limit }
    ]).toArray()
  }

  if (category === 'overall' || category === 'accuracy') {
    // Accuracy Leaderboard
    leaderboards.accuracy = await tests.aggregate([
      { $match: { ...matchStage, accuracy: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$userId',
          averageAccuracy: { $avg: '$accuracy' },
          testCount: { $sum: 1 },
          totalProblems: { $sum: '$totalProblems' },
          totalCorrect: { $sum: '$correctAnswers' }
        }
      },
      { $match: { testCount: { $gte: 10 } } }, // Minimum 10 tests for accuracy ranking
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          averageAccuracy: { $round: ['$averageAccuracy', 1] },
          testCount: 1,
          totalProblems: 1,
          totalCorrect: 1
        }
      },
      { $sort: { averageAccuracy: -1 } },
      { $limit: limit }
    ]).toArray()
  }

  if (category === 'overall' || category === 'speed') {
    // Speed (PPM) Leaderboard
    leaderboards.speed = await tests.aggregate([
      { $match: { ...matchStage, problemsPerMinute: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$userId',
          averagePPM: { $avg: '$problemsPerMinute' },
          bestPPM: { $max: '$problemsPerMinute' },
          testCount: { $sum: 1 }
        }
      },
      { $match: { testCount: { $gte: 5 } } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          averagePPM: { $round: ['$averagePPM', 1] },
          bestPPM: { $round: ['$bestPPM', 1] },
          testCount: 1
        }
      },
      { $sort: { averagePPM: -1 } },
      { $limit: limit }
    ]).toArray()
  }

  if (category === 'overall' || category === 'consistency') {
    // Consistency Leaderboard (based on low standard deviation)
    leaderboards.consistency = await tests.aggregate([
      { $match: { ...matchStage, score: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$userId',
          scores: { $push: '$score' },
          averageScore: { $avg: '$score' },
          testCount: { $sum: 1 }
        }
      },
      { $match: { testCount: { $gte: 10 } } },
      {
        $addFields: {
          variance: {
            $avg: {
              $map: {
                input: '$scores',
                as: 'score',
                in: { $pow: [{ $subtract: ['$$score', '$averageScore'] }, 2] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          standardDeviation: { $sqrt: '$variance' },
          consistencyScore: {
            $multiply: [
              { $subtract: [100, { $divide: [{ $sqrt: '$variance' }, '$averageScore'] }] },
              { $divide: ['$averageScore', 100] } // Weight by performance
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          consistencyScore: { $round: ['$consistencyScore', 1] },
          averageScore: { $round: ['$averageScore', 1] },
          standardDeviation: { $round: ['$standardDeviation', 1] },
          testCount: 1
        }
      },
      { $sort: { consistencyScore: -1 } },
      { $limit: limit }
    ]).toArray()
  }

  if (category === 'overall' || category === 'total-tests') {
    // Most Active Users Leaderboard
    leaderboards.totalTests = await tests.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalTests: { $sum: 1 },
          totalProblems: { $sum: '$totalProblems' },
          averageScore: { $avg: '$score' },
          firstTestDate: { $min: '$createdAt' },
          lastTestDate: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          totalTests: 1,
          totalProblems: 1,
          averageScore: { $round: ['$averageScore', 1] },
          firstTestDate: 1,
          lastTestDate: 1,
          daysActive: {
            $ceil: {
              $divide: [
                { $subtract: ['$lastTestDate', '$firstTestDate'] },
                86400000 // milliseconds in a day
              ]
            }
          }
        }
      },
      { $sort: { totalTests: -1 } },
      { $limit: limit }
    ]).toArray()
  }

  return leaderboards
}

async function getUserRankings(db: any, userId: string, category: string, timeframe: string, difficulty: string) {
  // Get user's position in each leaderboard
  const userObjectId = new ObjectId(userId)
  const rankings: Record<string, any> = {}

  // This is a simplified version - in a real implementation, you'd calculate exact rankings
  const tests = db.collection('test_results')
  
  let timeFilter = {}
  if (timeframe !== 'all-time') {
    const now = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(0)
    }
    
    timeFilter = { createdAt: { $gte: startDate } }
  }

  let difficultyFilter = {}
  if (difficulty !== 'all') {
    difficultyFilter = { difficulty }
  }

  const userTests = await tests.find({
    userId: userObjectId,
    ...timeFilter,
    ...difficultyFilter
  }).toArray()

  if (userTests.length > 0) {
    const scores = userTests.map((t: any) => t.score || 0)
    const accuracies = userTests.map((t: any) => t.accuracy || 0)
    const ppms = userTests.map((t: any) => t.problemsPerMinute || 0)

    rankings.bestScore = {
      value: Math.max(...scores),
      rank: null, // Would need to calculate against all users
      outOf: null
    }

    rankings.averageScore = {
      value: scores.reduce((a: number, b: number) => a + b, 0) / scores.length,
      rank: null,
      outOf: null
    }

    rankings.accuracy = {
      value: accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length,
      rank: null,
      outOf: null
    }

    rankings.speed = {
      value: ppms.reduce((a: number, b: number) => a + b, 0) / ppms.length,
      rank: null,
      outOf: null
    }

    rankings.totalTests = {
      value: userTests.length,
      rank: null,
      outOf: null
    }
  }

  return rankings
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: (tests: any[]) => boolean
  unlocked?: boolean
  unlockedAt?: Date | null
}

async function getAchievements(db: any, userId: string) {
  const tests = db.collection('test_results')
  const userObjectId = new ObjectId(userId)
  
  const userTests = await tests.find({ userId: userObjectId }).sort({ createdAt: -1 }).toArray()
  
  const achievements: Achievement[] = []
  const unlockedAchievements: Achievement[] = []

  // Define all possible achievements
  const achievementDefinitions: Achievement[] = [
    // Test Count Achievements
    { id: 'first-test', name: 'Getting Started', description: 'Complete your first test', icon: '🎯', condition: (tests: any[]) => tests.length >= 1 },
    { id: 'test-10', name: 'Committed', description: 'Complete 10 tests', icon: '💪', condition: (tests: any[]) => tests.length >= 10 },
    { id: 'test-50', name: 'Dedicated', description: 'Complete 50 tests', icon: '🔥', condition: (tests: any[]) => tests.length >= 50 },
    { id: 'test-100', name: 'Centurion', description: 'Complete 100 tests', icon: '🏆', condition: (tests: any[]) => tests.length >= 100 },
    { id: 'test-500', name: 'Legendary', description: 'Complete 500 tests', icon: '👑', condition: (tests: any[]) => tests.length >= 500 },

    // Score Achievements
    { id: 'score-10', name: 'Double Digits', description: 'Score 10 or higher', icon: '📈', condition: (tests: any[]) => tests.some((t: any) => (t.score || 0) >= 10) },
    { id: 'score-25', name: 'Quarter Century', description: 'Score 25 or higher', icon: '🎯', condition: (tests: any[]) => tests.some((t: any) => (t.score || 0) >= 25) },
    { id: 'score-50', name: 'Half Century', description: 'Score 50 or higher', icon: '⚡', condition: (tests: any[]) => tests.some((t: any) => (t.score || 0) >= 50) },
    { id: 'score-75', name: 'Speed Demon', description: 'Score 75 or higher', icon: '🚀', condition: (tests: any[]) => tests.some((t: any) => (t.score || 0) >= 75) },
    { id: 'score-100', name: 'Century Maker', description: 'Score 100 or higher', icon: '💯', condition: (tests: any[]) => tests.some((t: any) => (t.score || 0) >= 100) },

    // Accuracy Achievements
    { id: 'perfect-accuracy', name: 'Perfectionist', description: 'Achieve 100% accuracy', icon: '🎯', condition: (tests: any[]) => tests.some((t: any) => (t.accuracy || 0) >= 100) },
    { id: 'high-accuracy', name: 'Sharpshooter', description: 'Achieve 95% accuracy or higher', icon: '🏹', condition: (tests: any[]) => tests.some((t: any) => (t.accuracy || 0) >= 95) },
    { id: 'consistent-accuracy', name: 'Consistent', description: 'Maintain 90%+ accuracy for 10 consecutive tests', icon: '🎪', condition: checkConsistentAccuracy },

    // Difficulty Achievements
    { id: 'try-all-difficulties', name: 'Explorer', description: 'Try all difficulty levels', icon: '🗺️', condition: checkAllDifficulties },
    { id: 'master-easy', name: 'Easy Master', description: 'Average 30+ score in Easy mode (10 tests)', icon: '🟢', condition: (tests: any[]) => checkDifficultyMastery(tests, 'easy', 30, 10) },
    { id: 'master-medium', name: 'Medium Master', description: 'Average 25+ score in Medium mode (10 tests)', icon: '🟡', condition: (tests: any[]) => checkDifficultyMastery(tests, 'medium', 25, 10) },
    { id: 'master-hard', name: 'Hard Master', description: 'Average 20+ score in Hard mode (10 tests)', icon: '🔴', condition: (tests: any[]) => checkDifficultyMastery(tests, 'hard', 20, 10) },
    { id: 'master-abstract', name: 'Abstract Master', description: 'Average 15+ score in Abstract mode (10 tests)', icon: '🟣', condition: (tests: any[]) => checkDifficultyMastery(tests, 'abstract', 15, 10) },

    // Streak Achievements
    { id: 'daily-streak-7', name: 'Week Warrior', description: 'Take a test for 7 consecutive days', icon: '📅', condition: (tests: any[]) => checkDailyStreak(tests, 7) },
    { id: 'daily-streak-30', name: 'Monthly Master', description: 'Take a test for 30 consecutive days', icon: '🗓️', condition: (tests: any[]) => checkDailyStreak(tests, 30) },

    // Special Achievements
    { id: 'speed-runner', name: 'Speed Runner', description: 'Complete 5 tests in one session', icon: '💨', condition: (tests: any[]) => checkSessionTests(tests, 5) },
    { id: 'night-owl', name: 'Night Owl', description: 'Take a test between midnight and 6 AM', icon: '🦉', condition: (tests: any[]) => checkNightOwl(tests) },
    { id: 'early-bird', name: 'Early Bird', description: 'Take a test between 5 AM and 7 AM', icon: '🐦', condition: (tests: any[]) => checkEarlyBird(tests) },
  ]

  // Check each achievement
  achievementDefinitions.forEach(achievement => {
    const unlocked = achievement.condition(userTests)
    
    achievements.push({
      ...achievement,
      unlocked,
      unlockedAt: unlocked ? findUnlockDate(userTests, achievement.id) : null
    })

    if (unlocked) {
      unlockedAchievements.push(achievement)
    }
  })

  return {
    achievements,
    unlockedAchievements,
    totalUnlocked: unlockedAchievements.length,
    totalPossible: achievementDefinitions.length,
    completionPercentage: Math.round((unlockedAchievements.length / achievementDefinitions.length) * 100)
  }
}

// Helper functions for achievement conditions
function checkConsistentAccuracy(tests: any[]) {
  if (tests.length < 10) return false
  
  for (let i = 0; i <= tests.length - 10; i++) {
    const batch = tests.slice(i, i + 10)
    const allHighAccuracy = batch.every((t: any) => (t.accuracy || 0) >= 90)
    if (allHighAccuracy) return true
  }
  return false
}

function checkAllDifficulties(tests: any[]) {
  const difficulties = new Set(tests.map((t: any) => t.difficulty))
  const difficultyArray = Array.from(difficulties)
  return difficultyArray.includes('easy') && difficultyArray.includes('medium') && difficultyArray.includes('hard') && difficultyArray.includes('abstract')
}

function checkDifficultyMastery(tests: any[], difficulty: string, targetScore: number, minTests: number) {
  const difficultyTests = tests.filter((t: any) => t.difficulty === difficulty)
  if (difficultyTests.length < minTests) return false
  
  const averageScore = difficultyTests.reduce((sum: number, t: any) => sum + (t.score || 0), 0) / difficultyTests.length
  return averageScore >= targetScore
}

function checkDailyStreak(tests: any[], targetDays: number) {
  if (tests.length === 0) return false
  
  const testDates = tests.map((t: any) => new Date(t.createdAt).toDateString())
  const uniqueDatesSet = new Set(testDates)
  const uniqueDates = Array.from(uniqueDatesSet).sort()
  
  let currentStreak = 1
  let maxStreak = 1
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1])
    const currDate = new Date(uniqueDates[i])
    const diffTime = currDate.getTime() - prevDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    
    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return maxStreak >= targetDays
}

function checkSessionTests(tests: any[], targetCount: number) {
  if (tests.length < targetCount) return false
  
  // Group tests by session (within 30 minutes of each other)
  const sessions: any[][] = []
  let currentSession: any[] = [tests[0]]
  
  for (let i = 1; i < tests.length; i++) {
    const prevTime = new Date(tests[i - 1].createdAt).getTime()
    const currTime = new Date(tests[i].createdAt).getTime()
    const diffMinutes = (currTime - prevTime) / (1000 * 60)
    
    if (diffMinutes <= 30) {
      currentSession.push(tests[i])
    } else {
      sessions.push(currentSession)
      currentSession = [tests[i]]
    }
  }
  sessions.push(currentSession)
  
  return sessions.some(session => session.length >= targetCount)
}

function checkNightOwl(tests: any[]) {
  return tests.some((t: any) => {
    const hour = new Date(t.createdAt).getHours()
    return hour >= 0 && hour < 6
  })
}

function checkEarlyBird(tests: any[]) {
  return tests.some((t: any) => {
    const hour = new Date(t.createdAt).getHours()
    return hour >= 5 && hour < 7
  })
}

function findUnlockDate(tests: any[], achievementId: string) {
  // This would determine when the achievement was first unlocked
  // For simplicity, we'll return the date of the first test that would unlock it
  if (tests.length > 0) {
    return tests[tests.length - 1].createdAt // Most recent test date
  }
  return new Date()
}
