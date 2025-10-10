'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Analytics {
  difficultyBreakdown: Record<string, any>
  progressionTrends: Record<string, any>
  weaknessAnalysis: Record<string, any>
  operationAnalysis: Record<string, any>
  timePatterns: any
  difficultyProgression: Record<string, any>
  insights: any[]
  recommendations: any[]
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'difficulties' | 'operations' | 'patterns' | 'insights'>('overview')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/user/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      } else if (response.status === 401) {
        router.push('/test')
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-red-400'
      case 'abstract': return 'text-purple-400'
      default: return 'text-text-primary'
    }
  }

  const getDifficultyBgColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900/20 border-green-600'
      case 'medium': return 'bg-yellow-900/20 border-yellow-600'
      case 'hard': return 'bg-red-900/20 border-red-600'
      case 'abstract': return 'bg-purple-900/20 border-purple-600'
      default: return 'bg-bg-secondary border-gray-700'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20'
      case 'low': return 'text-green-400 bg-green-900/20'
      default: return 'text-text-primary bg-bg-secondary'
    }
  }

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-xl text-accent">Analyzing your performance...</div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="test-container p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Analytics</h1>
          <p className="text-text-secondary mb-8">Unable to load analytics data</p>
          <button
            onClick={() => router.push('/stats')}
            className="btn-primary px-8 py-3"
          >
            Back to Stats
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="test-container p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-text-primary">Performance Analytics</h1>
            <button
              onClick={() => router.push('/stats')}
              className="btn-secondary px-6 py-3"
            >
              Back to Stats
            </button>
          </div>
          <p className="text-text-secondary">
            Deep insights into your mathematical performance and learning patterns
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', count: analytics.insights.length },
            { id: 'difficulties', label: 'Difficulties', count: Object.keys(analytics.difficultyBreakdown).length },
            { id: 'operations', label: 'Operations', count: Object.keys(analytics.operationAnalysis).length },
            { id: 'patterns', label: 'Time Patterns', count: 0 },
            { id: 'insights', label: 'Recommendations', count: analytics.recommendations.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-accent text-bg-primary' 
                  : 'bg-bg-secondary text-text-primary hover:bg-bg-secondary/80'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Insights */}
            <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Key Insights</h2>
              {analytics.insights.length > 0 ? (
                <div className="space-y-3">
                  {analytics.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded border-l-4 ${
                        insight.impact === 'positive' 
                          ? 'bg-green-900/20 border-green-400 text-green-100'
                          : 'bg-red-900/20 border-red-400 text-red-100'
                      }`}
                    >
                      <div className="font-semibold capitalize">{insight.type}</div>
                      <div>{insight.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary">Take more tests to generate personalized insights.</p>
              )}
            </div>

            {/* Difficulty Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(analytics.difficultyBreakdown).map(([difficulty, data]: [string, any]) => (
                <div key={difficulty} className={`rounded-lg p-6 border ${getDifficultyBgColor(difficulty)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold capitalize ${getDifficultyColor(difficulty)}`}>{difficulty}</h3>
                    <span className="text-2xl">{getTrendIcon(data.recentPerformance?.trend || 'stable')}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Tests:</span>
                      <span className="text-text-primary font-semibold">{data.totalTests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Avg Score:</span>
                      <span className="text-text-primary font-semibold">{data.averageScore.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Accuracy:</span>
                      <span className="text-correct font-semibold">{data.averageAccuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Consistency:</span>
                      <span className="text-accent font-semibold">{data.consistency.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Recommendations */}
            <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Top Recommendations</h2>
              {analytics.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex items-start gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary mb-1">{rec.title}</h3>
                      <p className="text-text-secondary text-sm mb-2">{rec.description}</p>
                      <div className="text-xs text-text-secondary">
                        Difficulty: <span className={`capitalize ${getDifficultyColor(rec.difficulty)}`}>{rec.difficulty}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'difficulties' && (
          <div className="space-y-6">
            {Object.entries(analytics.difficultyBreakdown).map(([difficulty, data]: [string, any]) => (
              <div key={difficulty} className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold capitalize ${getDifficultyColor(difficulty)}`}>
                    {difficulty} Difficulty
                  </h2>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">{data.averageScore.toFixed(1)}</div>
                    <div className="text-text-secondary text-sm">Average Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-text-secondary text-sm">Total Tests</div>
                    <div className="text-xl font-bold text-text-primary">{data.totalTests}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Best Score</div>
                    <div className="text-xl font-bold text-accent">{data.bestScore}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Accuracy</div>
                    <div className="text-xl font-bold text-correct">{data.averageAccuracy.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Consistency</div>
                    <div className="text-xl font-bold text-accent">{data.consistency.toFixed(1)}%</div>
                  </div>
                </div>

                {data.improvement !== 0 && (
                  <div className={`p-4 rounded ${data.improvement > 0 ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{data.improvement > 0 ? '📈' : '📉'}</span>
                      <span className={`font-semibold ${data.improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.abs(data.improvement).toFixed(1)}% {data.improvement > 0 ? 'improvement' : 'decline'} over time
                      </span>
                    </div>
                  </div>
                )}

                {/* Progression Analysis */}
                {analytics.difficultyProgression[difficulty] && (
                  <div className="mt-4 p-4 bg-bg-primary rounded border border-gray-600">
                    <h3 className="font-semibold text-text-primary mb-2">Readiness Assessment</h3>
                    <div className="text-sm text-text-secondary">
                      {analytics.difficultyProgression[difficulty].readinessForNext?.ready ? (
                        <div className="text-green-400">
                          ✅ Ready for {analytics.difficultyProgression[difficulty].readinessForNext.nextDifficulty} difficulty!
                        </div>
                      ) : (
                        <div>
                          <div className="text-yellow-400 mb-2">
                            🎯 {analytics.difficultyProgression[difficulty].readinessForNext?.reason}
                          </div>
                          {analytics.difficultyProgression[difficulty].readinessForNext?.requirements && (
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>Score: {analytics.difficultyProgression[difficulty].readinessForNext.requirements.currentScore.toFixed(1)}/{analytics.difficultyProgression[difficulty].readinessForNext.requirements.targetScore}</div>
                              <div>Accuracy: {analytics.difficultyProgression[difficulty].readinessForNext.requirements.currentAccuracy.toFixed(1)}%/{analytics.difficultyProgression[difficulty].readinessForNext.requirements.targetAccuracy}%</div>
                              <div>Consistency: {analytics.difficultyProgression[difficulty].readinessForNext.requirements.currentConsistency.toFixed(1)}%/{analytics.difficultyProgression[difficulty].readinessForNext.requirements.targetConsistency}%</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(analytics.operationAnalysis).map(([operation, data]: [string, any]) => (
              <div key={operation} className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-text-primary capitalize">{operation}</h3>
                  <div className={`px-3 py-1 rounded text-sm font-semibold ${
                    data.strengh === 'strength' 
                      ? 'bg-green-900/20 text-green-400' 
                      : 'bg-red-900/20 text-red-400'
                  }`}>
                    {data.strengh === 'strength' ? '💪 Strength' : '🎯 Focus Area'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-text-secondary text-sm">Tests</div>
                    <div className="text-lg font-bold text-text-primary">{data.totalTests}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Avg Score</div>
                    <div className="text-lg font-bold text-accent">{data.averageScore.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Accuracy</div>
                    <div className="text-lg font-bold text-correct">{data.averageAccuracy.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Improvement</div>
                    <div className={`text-lg font-bold ${data.improvement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {data.improvement > 0 ? '+' : ''}{data.improvement.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {/* Best Performance Times */}
            <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Peak Performance Times</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Best Hours</h3>
                  <div className="space-y-2">
                    {analytics.timePatterns.bestHours?.map((hour: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-bg-primary rounded">
                        <span className="text-text-primary">
                          {hour.hour}:00 - {hour.hour + 1}:00
                        </span>
                        <div className="text-right">
                          <div className="text-accent font-semibold">{hour.averageScore.toFixed(1)}</div>
                          <div className="text-text-secondary text-xs">{hour.testsCount} tests</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Best Days</h3>
                  <div className="space-y-2">
                    {analytics.timePatterns.bestDays?.map((day: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-bg-primary rounded">
                        <span className="text-text-primary">{day.day}</span>
                        <div className="text-right">
                          <div className="text-accent font-semibold">{day.averageScore.toFixed(1)}</div>
                          <div className="text-text-secondary text-xs">{day.testsCount} tests</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <div className="flex items-start gap-4">
                  <div className={`px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text-primary mb-2">{rec.title}</h3>
                    <p className="text-text-secondary mb-4">{rec.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-sm text-text-secondary mb-1">
                        Target: <span className={`capitalize ${getDifficultyColor(rec.difficulty)}`}>{rec.difficulty}</span> difficulty
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-text-primary mb-2">Action Steps:</h4>
                      <ul className="list-disc list-inside space-y-1 text-text-secondary">
                        {rec.actions.map((action: string, actionIndex: number) => (
                          <li key={actionIndex}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {analytics.recommendations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Excellent Performance!</h3>
                <p className="text-text-secondary">
                  You&apos;re performing well across all areas. Keep up the great work!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
