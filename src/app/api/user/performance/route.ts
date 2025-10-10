import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { db } = await connectToDatabase()
    
    const { action, data } = await request.json()
    
    switch (action) {
      case 'track_interaction':
        return await trackUserInteraction(db, decoded.userId, data)
      case 'performance_metrics':
        return await recordPerformanceMetrics(db, decoded.userId, data)
      case 'session_analytics':
        return await updateSessionAnalytics(db, decoded.userId, data)
      case 'mobile_optimization':
        return await optimizeForMobile(db, decoded.userId, data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { db } = await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') || 'overview'
    
    const performanceData = await getPerformanceMetrics(db, decoded.userId, metric)
    
    return NextResponse.json(performanceData)

  } catch (error) {
    console.error('Performance API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function trackUserInteraction(db: any, userId: string, data: any) {
  const interactions = db.collection('user_interactions')
  
  const interaction = {
    userId: new ObjectId(userId),
    type: data.type, // 'click', 'scroll', 'focus', 'blur', 'keypress'
    element: data.element,
    timestamp: new Date(),
    sessionId: data.sessionId,
    metadata: data.metadata || {}
  }

  await interactions.insertOne(interaction)
  
  // Update user engagement metrics
  const users = db.collection('users')
  await users.updateOne(
    { _id: new ObjectId(userId) },
    {
      $inc: { 'engagement.totalInteractions': 1 },
      $set: { 'engagement.lastActivity': new Date() }
    }
  )

  return NextResponse.json({ success: true })
}

async function recordPerformanceMetrics(db: any, userId: string, data: any) {
  const performance = db.collection('performance_metrics')
  
  const metrics = {
    userId: new ObjectId(userId),
    timestamp: new Date(),
    loadTime: data.loadTime,
    renderTime: data.renderTime,
    interactionLatency: data.interactionLatency,
    memoryUsage: data.memoryUsage,
    batteryLevel: data.batteryLevel,
    networkType: data.networkType,
    deviceType: data.deviceType,
    screenSize: data.screenSize,
    userAgent: data.userAgent
  }

  await performance.insertOne(metrics)

  return NextResponse.json({ success: true })
}

async function updateSessionAnalytics(db: any, userId: string, data: any) {
  const sessions = db.collection('user_sessions')
  
  const sessionUpdate = {
    duration: data.duration,
    testsCompleted: data.testsCompleted,
    averageAccuracy: data.averageAccuracy,
    averageSpeed: data.averageSpeed,
    difficultyProgression: data.difficultyProgression,
    engagementScore: calculateEngagementScore(data),
    endedAt: new Date()
  }

  await sessions.updateOne(
    { 
      userId: new ObjectId(userId), 
      sessionId: data.sessionId 
    },
    { 
      $set: sessionUpdate,
      $inc: { updateCount: 1 }
    },
    { upsert: true }
  )

  return NextResponse.json({ success: true })
}

async function optimizeForMobile(db: any, userId: string, data: any) {
  const mobileSettings = db.collection('mobile_settings')
  
  const settings = {
    userId: new ObjectId(userId),
    touchOptimization: data.touchOptimization || true,
    fontSize: data.fontSize || 'medium',
    buttonSize: data.buttonSize || 'large',
    gestureControls: data.gestureControls || true,
    hapticFeedback: data.hapticFeedback || true,
    autoRotation: data.autoRotation || false,
    landscapeMode: data.landscapeMode || false,
    updatedAt: new Date()
  }

  await mobileSettings.updateOne(
    { userId: new ObjectId(userId) },
    { $set: settings },
    { upsert: true }
  )

  return NextResponse.json({ success: true })
}

async function getPerformanceMetrics(db: any, userId: string, metric: string) {
  const userObjectId = new ObjectId(userId)
  
  switch (metric) {
    case 'overview':
      return await getOverviewMetrics(db, userObjectId)
    case 'interactions':
      return await getInteractionMetrics(db, userObjectId)
    case 'performance':
      return await getPerformanceStats(db, userObjectId)
    case 'mobile':
      return await getMobileOptimization(db, userObjectId)
    default:
      return { error: 'Invalid metric type' }
  }
}

async function getOverviewMetrics(db: any, userId: ObjectId) {
  const [interactions, performance, sessions] = await Promise.all([
    db.collection('user_interactions').countDocuments({ userId }),
    db.collection('performance_metrics').find({ userId }).sort({ timestamp: -1 }).limit(10).toArray(),
    db.collection('user_sessions').find({ userId }).sort({ endedAt: -1 }).limit(5).toArray()
  ])

  const avgLoadTime = performance.length > 0 
    ? performance.reduce((sum: number, p: any) => sum + (p.loadTime || 0), 0) / performance.length 
    : 0

  const avgEngagement = sessions.length > 0
    ? sessions.reduce((sum: number, s: any) => sum + (s.engagementScore || 0), 0) / sessions.length
    : 0

  return {
    totalInteractions: interactions,
    averageLoadTime: Math.round(avgLoadTime),
    averageEngagement: Math.round(avgEngagement * 100) / 100,
    recentSessions: sessions.length,
    performanceTrend: calculatePerformanceTrend(performance)
  }
}

async function getInteractionMetrics(db: any, userId: ObjectId) {
  const interactions = await db.collection('user_interactions')
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray()

  const interactionTypes: Record<string, number> = {}
  const hourlyActivity = Array(24).fill(0)
  
  interactions.forEach((interaction: any) => {
    const type = interaction.type
    const hour = new Date(interaction.timestamp).getHours()
    
    interactionTypes[type] = (interactionTypes[type] || 0) + 1
    hourlyActivity[hour]++
  })

  return {
    totalInteractions: interactions.length,
    interactionTypes,
    hourlyActivity,
    peakActivity: hourlyActivity.indexOf(Math.max(...hourlyActivity)),
    recentInteractions: interactions.slice(0, 20)
  }
}

async function getPerformanceStats(db: any, userId: ObjectId) {
  const performance = await db.collection('performance_metrics')
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray()

  if (performance.length === 0) {
    return { message: 'No performance data available' }
  }

  const loadTimes = performance.map((p: any) => p.loadTime || 0).filter((t: number) => t > 0)
  const renderTimes = performance.map((p: any) => p.renderTime || 0).filter((t: number) => t > 0)
  const memoryUsage = performance.map((p: any) => p.memoryUsage || 0).filter((m: number) => m > 0)
  
  return {
    averageLoadTime: loadTimes.length > 0 ? loadTimes.reduce((a: number, b: number) => a + b, 0) / loadTimes.length : 0,
    averageRenderTime: renderTimes.length > 0 ? renderTimes.reduce((a: number, b: number) => a + b, 0) / renderTimes.length : 0,
    averageMemoryUsage: memoryUsage.length > 0 ? memoryUsage.reduce((a: number, b: number) => a + b, 0) / memoryUsage.length : 0,
    deviceTypes: getDeviceTypeDistribution(performance),
    networkTypes: getNetworkTypeDistribution(performance),
    performanceGrade: calculatePerformanceGrade(loadTimes, renderTimes)
  }
}

async function getMobileOptimization(db: any, userId: ObjectId) {
  const settings = await db.collection('mobile_settings')
    .findOne({ userId })

  const interactions = await db.collection('user_interactions')
    .find({ 
      userId,
      'metadata.isMobile': true 
    })
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray()

  const mobilePerformance = await db.collection('performance_metrics')
    .find({ 
      userId,
      deviceType: { $regex: /mobile|tablet/i }
    })
    .sort({ timestamp: -1 })
    .limit(20)
    .toArray()

  return {
    settings: settings || getDefaultMobileSettings(),
    mobileInteractions: interactions.length,
    mobilePerformance: mobilePerformance.length > 0 ? {
      averageLoadTime: mobilePerformance.reduce((sum: number, p: any) => sum + (p.loadTime || 0), 0) / mobilePerformance.length,
      batteryImpact: calculateBatteryImpact(mobilePerformance),
      networkEfficiency: calculateNetworkEfficiency(mobilePerformance)
    } : null,
    recommendations: generateMobileRecommendations(settings, interactions, mobilePerformance)
  }
}

// Helper functions
function calculateEngagementScore(data: any) {
  let score = 0
  
  // Base score from test completion
  score += data.testsCompleted * 10
  
  // Bonus for accuracy
  if (data.averageAccuracy > 90) score += 20
  else if (data.averageAccuracy > 80) score += 10
  else if (data.averageAccuracy > 70) score += 5
  
  // Bonus for session duration (optimal is 15-30 minutes)
  const duration = data.duration / 60000 // convert to minutes
  if (duration >= 15 && duration <= 30) score += 15
  else if (duration >= 10 && duration <= 45) score += 10
  else if (duration >= 5) score += 5
  
  // Bonus for difficulty progression
  if (data.difficultyProgression > 0) score += data.difficultyProgression * 5
  
  return Math.min(score / 100, 1) // Normalize to 0-1
}

function calculatePerformanceTrend(performance: any[]) {
  if (performance.length < 2) return 'stable'
  
  const recent = performance.slice(0, 3).reduce((sum: number, p: any) => sum + (p.loadTime || 0), 0) / 3
  const older = performance.slice(-3).reduce((sum: number, p: any) => sum + (p.loadTime || 0), 0) / 3
  
  const change = (recent - older) / older
  
  if (change < -0.1) return 'improving'
  if (change > 0.1) return 'declining'
  return 'stable'
}

function getDeviceTypeDistribution(performance: any[]) {
  const distribution: Record<string, number> = {}
  performance.forEach((p: any) => {
    const type = p.deviceType || 'unknown'
    distribution[type] = (distribution[type] || 0) + 1
  })
  return distribution
}

function getNetworkTypeDistribution(performance: any[]) {
  const distribution: Record<string, number> = {}
  performance.forEach((p: any) => {
    const type = p.networkType || 'unknown'
    distribution[type] = (distribution[type] || 0) + 1
  })
  return distribution
}

function calculatePerformanceGrade(loadTimes: number[], renderTimes: number[]) {
  const avgLoad = loadTimes.length > 0 ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length : 0
  const avgRender = renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0
  
  const totalTime = avgLoad + avgRender
  
  if (totalTime < 1000) return 'A+'
  if (totalTime < 2000) return 'A'
  if (totalTime < 3000) return 'B'
  if (totalTime < 4000) return 'C'
  return 'D'
}

function getDefaultMobileSettings() {
  return {
    touchOptimization: true,
    fontSize: 'medium',
    buttonSize: 'large',
    gestureControls: true,
    hapticFeedback: true,
    autoRotation: false,
    landscapeMode: false
  }
}

function calculateBatteryImpact(performance: any[]) {
  const batteryData = performance.filter((p: any) => p.batteryLevel !== undefined)
  if (batteryData.length < 2) return 'unknown'
  
  const avgBatteryDrain = batteryData.reduce((sum: number, p: any, index: number) => {
    if (index === 0) return 0
    return sum + Math.max(0, batteryData[index - 1].batteryLevel - p.batteryLevel)
  }, 0) / (batteryData.length - 1)
  
  if (avgBatteryDrain < 1) return 'low'
  if (avgBatteryDrain < 3) return 'medium'
  return 'high'
}

function calculateNetworkEfficiency(performance: any[]) {
  const networkData = performance.filter((p: any) => p.networkType)
  if (networkData.length === 0) return 'unknown'
  
  const wifiCount = networkData.filter((p: any) => p.networkType === 'wifi').length
  const cellularCount = networkData.filter((p: any) => p.networkType.includes('cellular') || p.networkType.includes('4g') || p.networkType.includes('5g')).length
  
  if (wifiCount > cellularCount) return 'optimal'
  if (cellularCount > wifiCount * 2) return 'suboptimal'
  return 'good'
}

function generateMobileRecommendations(settings: any, interactions: any[], performance: any[]) {
  const recommendations: string[] = []
  
  if (!settings?.touchOptimization) {
    recommendations.push('Enable touch optimization for better mobile experience')
  }
  
  if (settings?.fontSize === 'small') {
    recommendations.push('Consider increasing font size for better readability')
  }
  
  if (interactions.length > 0 && interactions.filter((i: any) => i.type === 'scroll').length > interactions.length * 0.5) {
    recommendations.push('Reduce scrolling by optimizing layout for your screen size')
  }
  
  if (performance.length > 0) {
    const avgLoadTime = performance.reduce((sum: number, p: any) => sum + (p.loadTime || 0), 0) / performance.length
    if (avgLoadTime > 3000) {
      recommendations.push('Optimize network usage - consider using WiFi when possible')
    }
  }
  
  return recommendations
}
