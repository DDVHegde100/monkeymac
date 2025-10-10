import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../../../lib/mongodb'

interface Insight {
  type: string
  title: string
  message: string
  icon: string
  priority: string
}

interface Recommendation {
  type: string
  title: string
  description: string
  action: string
  url: string
  priority: string
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { db } = await connectToDatabase()
    
    const tests = db.collection('test_results')
    const users = db.collection('users')
    
    // Get user's test performance
    const userTests = await tests.find({ 
      userId: new ObjectId(decoded.userId) 
    }).sort({ createdAt: -1 }).toArray()

    // Generate personalized insights
    const insights = await generatePersonalizedInsights(userTests, db, decoded.userId)
    
    // Get motivational content
    const motivation = await getMotivationalContent(userTests, db)
    
    // Get recommendations
    const recommendations = await getSmartRecommendations(userTests, db, decoded.userId)

    return NextResponse.json({
      insights,
      motivation,
      recommendations,
      testCount: userTests.length
    })

  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generatePersonalizedInsights(userTests: any[], db: any, userId: string) {
  const insights: Insight[] = []

  if (userTests.length === 0) {
    return [{
      type: 'welcome',
      title: 'Welcome to MonkeyMac! 🎉',
      message: 'Take your first test to start tracking your mental math progress!',
      icon: '🚀',
      priority: 'high'
    }]
  }

  // Performance trend analysis
  const recentTests = userTests.slice(0, 10)
  const scores = recentTests.map(t => t.score || 0)
  const accuracies = recentTests.map(t => t.accuracy || 0)
  
  if (scores.length >= 3) {
    const recentAvg = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    const olderAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / 3
    
    if (recentAvg > olderAvg * 1.1) {
      insights.push({
        type: 'improvement',
        title: 'You\'re on fire! 🔥',
        message: `Your recent performance has improved by ${((recentAvg - olderAvg) / olderAvg * 100).toFixed(1)}%!`,
        icon: '📈',
        priority: 'high'
      })
    } else if (recentAvg < olderAvg * 0.9) {
      insights.push({
        type: 'encouragement',
        title: 'Every champion has off days 💪',
        message: 'Take a short break and come back stronger. You\'ve got this!',
        icon: '🌟',
        priority: 'medium'
      })
    }
  }

  // Streak analysis
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysSinceLastTest = Math.floor((today.getTime() - new Date(userTests[0].createdAt).getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceLastTest === 0) {
    // Check for daily streak
    const streak = calculateDailyStreak(userTests)
    if (streak >= 3) {
      insights.push({
        type: 'streak',
        title: `${streak} day streak! 🎯`,
        message: 'Consistency is key to improvement. Keep it up!',
        icon: '🔥',
        priority: 'high'
      })
    }
  } else if (daysSinceLastTest === 1) {
    insights.push({
      type: 'comeback',
      title: 'Welcome back! 👋',
      message: 'Ready to continue your mental math journey?',
      icon: '🎪',
      priority: 'medium'
    })
  } else if (daysSinceLastTest > 7) {
    insights.push({
      type: 'return',
      title: 'Long time no see! 🎭',
      message: 'Your brain is ready for some math exercise. Let\'s get back to it!',
      icon: '🧠',
      priority: 'medium'
    })
  }

  // Performance patterns
  const timePatterns = analyzeTimePatterns(userTests)
  if (timePatterns.bestTimeOfDay) {
    insights.push({
      type: 'pattern',
      title: `You're sharpest ${timePatterns.bestTimeOfDay}! ⏰`,
      message: `Your average score is ${timePatterns.bestScore.toFixed(1)} during this time.`,
      icon: '🎯',
      priority: 'low'
    })
  }

  // Difficulty progression insight
  const difficultyProgression = analyzeDifficultyProgression(userTests)
  if (difficultyProgression.readyForNext) {
    insights.push({
      type: 'progression',
      title: `Ready for ${difficultyProgression.nextLevel}? 🚀`,
      message: `You've mastered ${difficultyProgression.currentLevel} with ${difficultyProgression.accuracy?.toFixed(1) || 0}% accuracy!`,
      icon: '⬆️',
      priority: 'high'
    })
  }

  return insights
}

async function getMotivationalContent(userTests: any[], db: any) {
  const totalTests = userTests.length
  const totalProblems = userTests.reduce((sum, test) => sum + (test.totalProblems || 0), 0)
  const totalCorrect = userTests.reduce((sum, test) => sum + (test.correctAnswers || 0), 0)
  
  const motivationalQuotes = [
    "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding. - William Paul Thurston",
    "The only way to learn mathematics is to do mathematics. - Paul Halmos",
    "Pure mathematics is, in its way, the poetry of logical ideas. - Albert Einstein",
    "Mathematics is the music of reason. - James Joseph Sylvester",
    "In mathematics, you don't understand things. You just get used to them. - John von Neumann",
    "Mathematics is the art of giving the same name to different things. - Henri Poincaré",
    "The essence of mathematics is not to make simple things complicated, but to make complicated things simple. - S. Gudder"
  ]

  const achievements: string[] = []
  
  if (totalTests >= 100) {
    achievements.push("Century Club Member! 💯")
  } else if (totalTests >= 50) {
    achievements.push("Half Century Achiever! 🎯")
  } else if (totalTests >= 10) {
    achievements.push("Dedicated Practitioner! 💪")
  }

  if (totalProblems >= 1000) {
    achievements.push("Thousand Problem Solver! 🏆")
  } else if (totalProblems >= 500) {
    achievements.push("Problem Crushing Machine! ⚡")
  }

  if (totalCorrect >= 500) {
    achievements.push("Accuracy Master! 🎪")
  }

  return {
    quote: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    achievements,
    stats: {
      totalTests,
      totalProblems,
      totalCorrect,
      overallAccuracy: totalProblems > 0 ? (totalCorrect / totalProblems * 100).toFixed(1) : 0
    }
  }
}

async function getSmartRecommendations(userTests: any[], db: any, userId: string) {
  const recommendations: Recommendation[] = []

  if (userTests.length === 0) {
    return [{
      type: 'getting-started',
      title: 'Take Your First Test',
      description: 'Start with Easy mode to get familiar with the interface',
      action: 'Start Easy Test',
      url: '/test?difficulty=easy',
      priority: 'high'
    }]
  }

  // Analyze weak areas
  const weakAreas = analyzeWeakAreas(userTests)
  
  if (weakAreas.operation) {
    recommendations.push({
      type: 'skill-improvement',
      title: `Improve ${weakAreas.operation} Skills`,
      description: `Your ${weakAreas.operation} accuracy is ${weakAreas.accuracy?.toFixed(1) || 0}%. Practice makes perfect!`,
      action: 'Practice Now',
      url: '/test?focus=' + (weakAreas.operation?.toLowerCase() || ''),
      priority: 'high'
    })
  }

  if (weakAreas.difficulty) {
    recommendations.push({
      type: 'difficulty-challenge',
      title: `Challenge Yourself with ${weakAreas.difficulty}`,
      description: `You've shown great progress. Time to level up!`,
      action: 'Try ' + weakAreas.difficulty,
      url: '/test?difficulty=' + (weakAreas.difficulty?.toLowerCase() || ''),
      priority: 'medium'
    })
  }

  // Session recommendations
  const lastTest = userTests[0]
  const timeSinceLastTest = (new Date().getTime() - new Date(lastTest.createdAt).getTime()) / (1000 * 60 * 60)
  
  if (timeSinceLastTest < 1) {
    recommendations.push({
      type: 'session-management',
      title: 'Take a Short Break',
      description: 'You\'ve been practicing recently. A 15-minute break can help consolidate learning.',
      action: 'View Progress',
      url: '/analytics',
      priority: 'low'
    })
  } else if (timeSinceLastTest > 24) {
    recommendations.push({
      type: 'comeback',
      title: 'Daily Practice Session',
      description: 'Consistent daily practice leads to the best improvements!',
      action: 'Start Session',
      url: '/test',
      priority: 'medium'
    })
  }

  // Goal-based recommendations
  const recentScores = userTests.slice(0, 5).map(t => t.score || 0)
  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  
  if (avgScore < 20) {
    recommendations.push({
      type: 'goal-setting',
      title: 'Set a Goal: Reach 25 PPM',
      description: 'Focus on accuracy first, then gradually increase speed.',
      action: 'Practice Basics',
      url: '/test?difficulty=easy&duration=60',
      priority: 'high'
    })
  } else if (avgScore < 40) {
    recommendations.push({
      type: 'goal-setting',
      title: 'Set a Goal: Reach 50 PPM',
      description: 'You\'re making great progress! Try slightly harder problems.',
      action: 'Level Up',
      url: '/test?difficulty=medium',
      priority: 'medium'
    })
  }

  return recommendations
}

// Helper functions
function calculateDailyStreak(tests: any[]) {
  const dates = tests.map(t => new Date(t.createdAt).toDateString())
  const uniqueDates = [...new Set(dates)].sort()
  
  let streak = 1
  const today = new Date().toDateString()
  
  if (uniqueDates[0] !== today) return 0
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i-1])
    const currDate = new Date(uniqueDates[i])
    const diffTime = prevDate.getTime() - currDate.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function analyzeTimePatterns(tests: any[]) {
  const timeGroups = {
    'in the morning': { tests: [], scores: [] },
    'in the afternoon': { tests: [], scores: [] },
    'in the evening': { tests: [], scores: [] },
    'at night': { tests: [], scores: [] }
  }
  
  tests.forEach(test => {
    const hour = new Date(test.createdAt).getHours()
    const score = test.score || 0
    
    if (hour >= 6 && hour < 12) {
      timeGroups['in the morning'].tests.push(test)
      timeGroups['in the morning'].scores.push(score)
    } else if (hour >= 12 && hour < 17) {
      timeGroups['in the afternoon'].tests.push(test)
      timeGroups['in the afternoon'].scores.push(score)
    } else if (hour >= 17 && hour < 22) {
      timeGroups['in the evening'].tests.push(test)
      timeGroups['in the evening'].scores.push(score)
    } else {
      timeGroups['at night'].tests.push(test)
      timeGroups['at night'].scores.push(score)
    }
  })
  
  let bestTimeOfDay = null
  let bestScore = 0
  
  Object.entries(timeGroups).forEach(([time, data]) => {
    if (data.scores.length >= 3) {
      const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      if (avgScore > bestScore) {
        bestScore = avgScore
        bestTimeOfDay = time
      }
    }
  })
  
  return { bestTimeOfDay, bestScore }
}

function analyzeDifficultyProgression(tests: any[]) {
  const difficultyOrder = ['easy', 'medium', 'hard', 'abstract']
  const difficultyStats = {}
  
  tests.forEach(test => {
    const diff = test.difficulty || 'easy'
    if (!difficultyStats[diff]) {
      difficultyStats[diff] = { tests: 0, totalAccuracy: 0 }
    }
    difficultyStats[diff].tests++
    difficultyStats[diff].totalAccuracy += test.accuracy || 0
  })
  
  for (let i = 0; i < difficultyOrder.length - 1; i++) {
    const current = difficultyOrder[i]
    const next = difficultyOrder[i + 1]
    
    if (difficultyStats[current] && difficultyStats[current].tests >= 5) {
      const avgAccuracy = difficultyStats[current].totalAccuracy / difficultyStats[current].tests
      if (avgAccuracy >= 85 && (!difficultyStats[next] || difficultyStats[next].tests < 3)) {
        return {
          readyForNext: true,
          currentLevel: current,
          nextLevel: next,
          accuracy: avgAccuracy
        }
      }
    }
  }
  
  return { readyForNext: false }
}

function analyzeWeakAreas(tests: any[]) {
  // This would analyze operation-specific performance if we tracked it
  // For now, return difficulty-based analysis
  const difficulties = ['easy', 'medium', 'hard', 'abstract']
  const diffStats = {}
  
  tests.forEach(test => {
    const diff = test.difficulty || 'easy'
    if (!diffStats[diff]) {
      diffStats[diff] = { total: 0, accuracy: 0 }
    }
    diffStats[diff].total++
    diffStats[diff].accuracy += test.accuracy || 0
  })
  
  let weakestDifficulty = null
  let lowestAccuracy = 100
  
  Object.entries(diffStats).forEach(([diff, stats]: [string, any]) => {
    if (stats.total >= 3) {
      const avgAccuracy = stats.accuracy / stats.total
      if (avgAccuracy < lowestAccuracy) {
        lowestAccuracy = avgAccuracy
        weakestDifficulty = diff
      }
    }
  })
  
  return {
    difficulty: weakestDifficulty,
    accuracy: lowestAccuracy,
    operation: null as string | null // Would need to track operations to implement this
  }
}
