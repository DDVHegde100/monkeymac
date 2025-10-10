'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

interface MotivationalContent {
  quote: string
  achievements: string[]
  stats: {
    totalTests: number
    totalProblems: number
    totalCorrect: number
    overallAccuracy: string
  }
}

interface InsightsData {
  insights: Insight[]
  motivation: MotivationalContent
  recommendations: Recommendation[]
  testCount: number
}

export default function SmartDashboard() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/user/insights')
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch insights')
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [router])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-blue-500 bg-blue-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  const handleRecommendationClick = (url: string) => {
    router.push(url)
  }

  if (loading) {
    return (
      <div className="bg-bg-secondary rounded-lg p-6 border border-sub">
        <div className="animate-pulse">
          <div className="h-6 bg-sub rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-sub rounded w-full"></div>
            <div className="h-4 bg-sub rounded w-3/4"></div>
            <div className="h-4 bg-sub rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-400">Error loading insights: {error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Personal Insights */}
      {data.insights.length > 0 && (
        <div className="bg-bg-secondary rounded-lg p-6 border border-sub">
          <h3 className="text-xl font-bold text-text mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Personal Insights
          </h3>
          <div className="space-y-3">
            {data.insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border-l-4 ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold text-text mb-1">{insight.title}</h4>
                    <p className="text-sub text-sm">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="bg-bg-secondary rounded-lg p-6 border border-sub">
          <h3 className="text-xl font-bold text-text mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Smart Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-bg rounded-lg p-4 border border-sub hover:border-main transition-colors cursor-pointer"
                onClick={() => handleRecommendationClick(rec.url)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text">{rec.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sub text-sm mb-3">{rec.description}</p>
                <button className="text-main hover:text-main-darker text-sm font-medium">
                  {rec.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Content */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-sub">
        <h3 className="text-xl font-bold text-text mb-4 flex items-center">
          <span className="mr-2">🌟</span>
          Daily Motivation
        </h3>
        
        {/* Quote */}
        <div className="bg-bg rounded-lg p-4 border border-sub mb-4">
          <blockquote className="text-text italic text-center">
            &ldquo;{data.motivation.quote}&rdquo;
          </blockquote>
        </div>

        {/* Achievements */}
        {data.motivation.achievements.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-text mb-2">Your Achievements</h4>
            <div className="flex flex-wrap gap-2">
              {data.motivation.achievements.map((achievement, index) => (
                <span
                  key={index}
                  className="bg-main/20 text-main px-3 py-1 rounded-full text-sm font-medium"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-main">{data.motivation.stats.totalTests}</div>
            <div className="text-xs text-sub">Tests Taken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-main">{data.motivation.stats.totalProblems}</div>
            <div className="text-xs text-sub">Problems Solved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-main">{data.motivation.stats.totalCorrect}</div>
            <div className="text-xs text-sub">Correct Answers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-main">{data.motivation.stats.overallAccuracy}%</div>
            <div className="text-xs text-sub">Overall Accuracy</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-bg-secondary rounded-lg p-6 border border-sub">
        <h3 className="text-xl font-bold text-text mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => router.push('/test')}
            className="bg-main hover:bg-main-darker text-bg px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Start Test
          </button>
          <button
            onClick={() => router.push('/analytics')}
            className="bg-bg border border-sub hover:border-main text-text px-4 py-3 rounded-lg font-medium transition-colors"
          >
            View Analytics
          </button>
          <button
            onClick={() => router.push('/history')}
            className="bg-bg border border-sub hover:border-main text-text px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Test History
          </button>
          <button
            onClick={() => router.push('/leaderboards')}
            className="bg-bg border border-sub hover:border-main text-text px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Leaderboards
          </button>
        </div>
      </div>
    </div>
  )
}
