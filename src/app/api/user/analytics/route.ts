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

    // Get all test results for this user
    const userTests = await tests.find({ 
      userId: new ObjectId(decoded.userId) 
    }).sort({ createdAt: -1 }).toArray()

    if (userTests.length === 0) {
      return NextResponse.json({
        analytics: {
          difficultyBreakdown: {},
          progressionTrends: {},
          weaknessAnalysis: {},
          recommendations: [],
          insights: []
        }
      })
    }

    // Group tests by difficulty
    const difficultyGroups = groupByDifficulty(userTests)
    
    // Calculate difficulty-specific analytics
    const difficultyBreakdown = calculateDifficultyBreakdown(difficultyGroups)
    
    // Calculate progression trends
    const progressionTrends = calculateProgressionTrends(difficultyGroups)
    
    // Analyze weaknesses and strengths
    const weaknessAnalysis = analyzeWeaknesses(difficultyGroups)
    
    // Generate insights and recommendations
    const insights = generateInsights(difficultyBreakdown, progressionTrends, weaknessAnalysis)
    const recommendations = generateRecommendations(difficultyBreakdown, progressionTrends, weaknessAnalysis)

    // Calculate operation-specific performance
    const operationAnalysis = analyzeOperationPerformance(userTests)

    // Calculate time-based performance patterns
    const timePatterns = analyzeTimePatterns(userTests)

    // Difficulty progression analysis
    const difficultyProgression = analyzeDifficultyProgression(userTests)

    return NextResponse.json({
      analytics: {
        difficultyBreakdown,
        progressionTrends,
        weaknessAnalysis,
        operationAnalysis,
        timePatterns,
        difficultyProgression,
        insights,
        recommendations
      }
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function groupByDifficulty(tests: any[]) {
  return tests.reduce((groups, test) => {
    const difficulty = test.difficulty || 'unknown'
    if (!groups[difficulty]) {
      groups[difficulty] = []
    }
    groups[difficulty].push(test)
    return groups
  }, {} as Record<string, any[]>)
}

function calculateDifficultyBreakdown(difficultyGroups: Record<string, any[]>) {
  const breakdown: Record<string, any> = {}

  Object.entries(difficultyGroups).forEach(([difficulty, tests]) => {
    const scores = tests.map(t => t.score || 0)
    const accuracies = tests.map(t => t.accuracy || 0)
    const ppms = tests.map(t => t.problemsPerMinute || 0)
    
    breakdown[difficulty] = {
      totalTests: tests.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      bestScore: Math.max(...scores),
      worstScore: Math.min(...scores),
      averageAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
      averagePPM: ppms.reduce((a, b) => a + b, 0) / ppms.length,
      improvement: calculateImprovement(tests),
      consistency: calculateConsistency(scores),
      recentPerformance: calculateRecentPerformance(tests.slice(0, 5)),
      totalProblems: tests.reduce((sum, t) => sum + (t.totalProblems || 0), 0),
      totalCorrect: tests.reduce((sum, t) => sum + (t.correctAnswers || 0), 0)
    }
  })

  return breakdown
}

function calculateProgressionTrends(difficultyGroups: Record<string, any[]>) {
  const trends: Record<string, any> = {}

  Object.entries(difficultyGroups).forEach(([difficulty, tests]) => {
    const sortedTests = tests.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    
    trends[difficulty] = {
      scoreProgression: calculateTrendLine(sortedTests.map(t => t.score || 0)),
      accuracyProgression: calculateTrendLine(sortedTests.map(t => t.accuracy || 0)),
      ppmProgression: calculateTrendLine(sortedTests.map(t => t.problemsPerMinute || 0)),
      weeklyProgress: calculateWeeklyProgress(sortedTests),
      milestones: identifyMilestones(sortedTests)
    }
  })

  return trends
}

function analyzeWeaknesses(difficultyGroups: Record<string, any[]>) {
  const analysis: Record<string, any> = {}

  Object.entries(difficultyGroups).forEach(([difficulty, tests]) => {
    const recentTests = tests.slice(0, 10) // Last 10 tests
    
    analysis[difficulty] = {
      strugglingAreas: identifyStrugglingAreas(recentTests),
      errorPatterns: analyzeErrorPatterns(recentTests),
      timeManagement: analyzeTimeManagement(recentTests),
      consistencyIssues: identifyConsistencyIssues(recentTests),
      improvementOpportunities: identifyImprovementOpportunities(recentTests)
    }
  })

  return analysis
}

function analyzeOperationPerformance(tests: any[]) {
  const operations = ['addition', 'subtraction', 'multiplication', 'division']
  const analysis: Record<string, any> = {}

  operations.forEach(op => {
    const opTests = tests.filter(t => t.operations && t.operations.includes(op))
    if (opTests.length > 0) {
      const scores = opTests.map(t => t.score || 0)
      const accuracies = opTests.map(t => t.accuracy || 0)
      
      analysis[op] = {
        totalTests: opTests.length,
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        averageAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
        improvement: calculateImprovement(opTests),
        strengh: calculateOperationStrength(opTests, tests)
      }
    }
  })

  return analysis
}

function analyzeTimePatterns(tests: any[]) {
  const hourlyPerformance: Record<number, any> = {}
  const dayOfWeekPerformance: Record<string, any> = {}

  tests.forEach(test => {
    const date = new Date(test.createdAt)
    const hour = date.getHours()
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })

    // Hourly patterns
    if (!hourlyPerformance[hour]) {
      hourlyPerformance[hour] = { tests: [], scores: [], accuracies: [] }
    }
    hourlyPerformance[hour].tests.push(test)
    hourlyPerformance[hour].scores.push(test.score || 0)
    hourlyPerformance[hour].accuracies.push(test.accuracy || 0)

    // Day of week patterns
    if (!dayOfWeekPerformance[dayOfWeek]) {
      dayOfWeekPerformance[dayOfWeek] = { tests: [], scores: [], accuracies: [] }
    }
    dayOfWeekPerformance[dayOfWeek].tests.push(test)
    dayOfWeekPerformance[dayOfWeek].scores.push(test.score || 0)
    dayOfWeekPerformance[dayOfWeek].accuracies.push(test.accuracy || 0)
  })

  // Calculate averages
  Object.keys(hourlyPerformance).forEach(hour => {
    const data = hourlyPerformance[parseInt(hour)]
    data.averageScore = data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length
    data.averageAccuracy = data.accuracies.reduce((a: number, b: number) => a + b, 0) / data.accuracies.length
  })

  Object.keys(dayOfWeekPerformance).forEach(day => {
    const data = dayOfWeekPerformance[day]
    data.averageScore = data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length
    data.averageAccuracy = data.accuracies.reduce((a: number, b: number) => a + b, 0) / data.accuracies.length
  })

  return {
    bestHours: findBestPerformanceTimes(hourlyPerformance),
    bestDays: findBestPerformanceDays(dayOfWeekPerformance),
    patterns: {
      hourly: hourlyPerformance,
      dayOfWeek: dayOfWeekPerformance
    }
  }
}

function analyzeDifficultyProgression(tests: any[]) {
  const difficulties = ['easy', 'medium', 'hard', 'abstract']
  const progression: Record<string, any> = {}

  difficulties.forEach(difficulty => {
    const difficultyTests = tests.filter(t => t.difficulty === difficulty)
    if (difficultyTests.length > 0) {
      const sorted = difficultyTests.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      
      progression[difficulty] = {
        firstAttempt: sorted[0],
        latestAttempt: sorted[sorted.length - 1],
        totalAttempts: sorted.length,
        averageImprovement: calculateImprovement(sorted),
        readinessForNext: assessReadinessForNext(difficulty, sorted)
      }
    }
  })

  return progression
}

// Helper functions
function calculateImprovement(tests: any[]) {
  if (tests.length < 2) return 0
  const sorted = tests.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  const first5 = sorted.slice(0, 5)
  const last5 = sorted.slice(-5)
  
  const firstAvg = first5.reduce((sum, t) => sum + (t.score || 0), 0) / first5.length
  const lastAvg = last5.reduce((sum, t) => sum + (t.score || 0), 0) / last5.length
  
  return ((lastAvg - firstAvg) / firstAvg) * 100
}

function calculateConsistency(scores: number[]) {
  if (scores.length < 2) return 100
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  return Math.max(0, 100 - (stdDev / mean) * 100)
}

function calculateRecentPerformance(recentTests: any[]) {
  if (recentTests.length === 0) return { score: 0, accuracy: 0, trend: 'stable' }
  
  const scores = recentTests.map(t => t.score || 0)
  const accuracies = recentTests.map(t => t.accuracy || 0)
  
  return {
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    averageAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
    trend: calculateTrend(scores)
  }
}

function calculateTrendLine(values: number[]) {
  if (values.length < 2) return { slope: 0, trend: 'stable' }
  
  const n = values.length
  const sumX = (n * (n - 1)) / 2
  const sumY = values.reduce((a, b) => a + b, 0)
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  
  return {
    slope,
    trend: slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable'
  }
}

function calculateWeeklyProgress(tests: any[]) {
  // Group tests by week and calculate progress
  const weeklyData: Record<string, any[]> = {}
  
  tests.forEach(test => {
    const date = new Date(test.createdAt)
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeklyData[weekKey]) weeklyData[weekKey] = []
    weeklyData[weekKey].push(test)
  })
  
  return Object.entries(weeklyData).map(([week, weekTests]) => ({
    week,
    testsCount: weekTests.length,
    averageScore: weekTests.reduce((sum, t) => sum + (t.score || 0), 0) / weekTests.length,
    averageAccuracy: weekTests.reduce((sum, t) => sum + (t.accuracy || 0), 0) / weekTests.length
  }))
}

function identifyMilestones(tests: any[]) {
  const milestones: any[] = []
  const scores = tests.map(t => t.score || 0)
  
  // Personal best
  const bestScore = Math.max(...scores)
  const bestTest = tests.find(t => t.score === bestScore)
  if (bestTest) {
    milestones.push({
      type: 'personal_best',
      value: bestScore,
      date: bestTest.createdAt,
      description: `Achieved personal best score of ${bestScore}`
    })
  }
  
  // Consistency milestones (e.g., 5 tests in a row above average)
  // Add more milestone logic here
  
  return milestones
}

function identifyStrugglingAreas(tests: any[]) {
  const areas: any[] = []
  
  // Low accuracy
  const avgAccuracy = tests.reduce((sum, t) => sum + (t.accuracy || 0), 0) / tests.length
  if (avgAccuracy < 70) {
    areas.push({
      area: 'accuracy',
      severity: avgAccuracy < 50 ? 'high' : 'medium',
      description: `Average accuracy of ${avgAccuracy.toFixed(1)}% needs improvement`
    })
  }
  
  // Inconsistent performance
  const scores = tests.map(t => t.score || 0)
  const consistency = calculateConsistency(scores)
  if (consistency < 70) {
    areas.push({
      area: 'consistency',
      severity: consistency < 50 ? 'high' : 'medium',
      description: `Performance consistency of ${consistency.toFixed(1)}% could be better`
    })
  }
  
  return areas
}

function analyzeErrorPatterns(tests: any[]) {
  // Analyze common error patterns
  return {
    frequentErrors: [],
    timeRelatedErrors: [],
    difficultySpikes: []
  }
}

function analyzeTimeManagement(tests: any[]) {
  const timePerProblem = tests.map(t => {
    const problems = t.totalProblems || 1
    const time = t.duration || 0
    return time / problems
  })
  
  const avgTimePerProblem = timePerProblem.reduce((a, b) => a + b, 0) / timePerProblem.length
  
  return {
    averageTimePerProblem: avgTimePerProblem,
    efficiency: avgTimePerProblem < 3 ? 'high' : avgTimePerProblem < 5 ? 'medium' : 'low',
    recommendations: avgTimePerProblem > 5 ? ['Focus on speed training', 'Practice mental math shortcuts'] : []
  }
}

function identifyConsistencyIssues(tests: any[]) {
  const scores = tests.map(t => t.score || 0)
  const consistency = calculateConsistency(scores)
  
  return {
    consistencyScore: consistency,
    issues: consistency < 70 ? ['High score variance', 'Unpredictable performance'] : [],
    improvements: consistency < 70 ? ['Regular practice schedule', 'Focus on fundamentals'] : []
  }
}

function identifyImprovementOpportunities(tests: any[]) {
  const opportunities: any[] = []
  
  // Check for plateaus
  const recentScores = tests.slice(0, 5).map(t => t.score || 0)
  const scoreVariance = calculateConsistency(recentScores)
  
  if (scoreVariance > 90) { // Very consistent but potentially plateaued
    opportunities.push({
      type: 'plateau',
      description: 'Consider increasing difficulty or trying new operations',
      priority: 'medium'
    })
  }
  
  return opportunities
}

function calculateOperationStrength(opTests: any[], allTests: any[]) {
  const opAvg = opTests.reduce((sum, t) => sum + (t.score || 0), 0) / opTests.length
  const overallAvg = allTests.reduce((sum, t) => sum + (t.score || 0), 0) / allTests.length
  
  return opAvg > overallAvg ? 'strength' : 'weakness'
}

function findBestPerformanceTimes(hourlyData: Record<number, any>) {
  const hours = Object.keys(hourlyData).map(h => parseInt(h))
  hours.sort((a, b) => hourlyData[b].averageScore - hourlyData[a].averageScore)
  
  return hours.slice(0, 3).map(hour => ({
    hour,
    averageScore: hourlyData[hour].averageScore,
    testsCount: hourlyData[hour].tests.length
  }))
}

function findBestPerformanceDays(dayData: Record<string, any>) {
  const days = Object.keys(dayData)
  days.sort((a, b) => dayData[b].averageScore - dayData[a].averageScore)
  
  return days.slice(0, 3).map(day => ({
    day,
    averageScore: dayData[day].averageScore,
    testsCount: dayData[day].tests.length
  }))
}

function calculateTrend(values: number[]) {
  if (values.length < 2) return 'stable'
  const recent = values.slice(-3)
  const earlier = values.slice(0, -3)
  
  if (earlier.length === 0) return 'stable'
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
  
  const improvement = (recentAvg - earlierAvg) / earlierAvg
  
  return improvement > 0.05 ? 'improving' : improvement < -0.05 ? 'declining' : 'stable'
}

function assessReadinessForNext(currentDifficulty: string, tests: any[]) {
  const difficulties = ['easy', 'medium', 'hard', 'abstract']
  const currentIndex = difficulties.indexOf(currentDifficulty)
  
  if (currentIndex === difficulties.length - 1) return { ready: false, reason: 'Already at highest difficulty' }
  
  const recentTests = tests.slice(-10)
  const avgScore = recentTests.reduce((sum, t) => sum + (t.score || 0), 0) / recentTests.length
  const avgAccuracy = recentTests.reduce((sum, t) => sum + (t.accuracy || 0), 0) / recentTests.length
  
  const ready = avgScore > 30 && avgAccuracy > 80 && calculateConsistency(recentTests.map(t => t.score || 0)) > 70
  
  return {
    ready,
    nextDifficulty: difficulties[currentIndex + 1],
    reason: ready ? 'Strong consistent performance' : 'Need more practice at current level',
    requirements: {
      targetScore: 30,
      targetAccuracy: 80,
      targetConsistency: 70,
      currentScore: avgScore,
      currentAccuracy: avgAccuracy,
      currentConsistency: calculateConsistency(recentTests.map(t => t.score || 0))
    }
  }
}

function generateInsights(breakdown: any, trends: any, weaknesses: any) {
  const insights: any[] = []
  
  // Difficulty-specific insights
  Object.entries(breakdown).forEach(([difficulty, data]: [string, any]) => {
    if (data.improvement > 20) {
      insights.push({
        type: 'improvement',
        difficulty,
        message: `Excellent ${data.improvement.toFixed(1)}% improvement in ${difficulty} difficulty!`,
        impact: 'positive'
      })
    }
    
    if (data.consistency > 85) {
      insights.push({
        type: 'consistency',
        difficulty,
        message: `Very consistent performance in ${difficulty} mode (${data.consistency.toFixed(1)}%)`,
        impact: 'positive'
      })
    }
  })
  
  return insights
}

function generateRecommendations(breakdown: any, trends: any, weaknesses: any) {
  const recommendations: any[] = []
  
  // Analyze each difficulty
  Object.entries(breakdown).forEach(([difficulty, data]: [string, any]) => {
    if (data.averageAccuracy < 70) {
      recommendations.push({
        type: 'practice',
        difficulty,
        priority: 'high',
        title: `Improve ${difficulty} accuracy`,
        description: `Focus on accuracy over speed in ${difficulty} mode. Current accuracy: ${data.averageAccuracy.toFixed(1)}%`,
        actions: [
          'Take your time with each problem',
          'Double-check calculations',
          'Practice basic facts',
          'Use shorter test durations initially'
        ]
      })
    }
    
    if (data.consistency < 60) {
      recommendations.push({
        type: 'consistency',
        difficulty,
        priority: 'medium',
        title: `Build ${difficulty} consistency`,
        description: `Work on maintaining steady performance in ${difficulty} mode`,
        actions: [
          'Maintain regular practice schedule',
          'Focus on fundamentals',
          'Avoid distractions during tests',
          'Set realistic daily goals'
        ]
      })
    }
  })
  
  return recommendations
}
