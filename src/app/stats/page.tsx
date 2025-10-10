'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserStats {
  totalTests: number
  bestScore: number
  averageScore: number
  totalProblems: number
  accuracy: number
  totalTimeSpent: number
  averagePPM: number
  testsThisWeek: number
  currentStreak: number
  longestStreak: number
  favoriteOperation: string
  testsRestarted: number
  recentTests: Array<{
    id: string
    score: number
    accuracy: number
    duration: number
    problems: number
    date: string
  }>
}

interface User {
  id: string
  firstName: string
  username: string
  phone: string
}

export default function StatsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    checkAuthAndLoadStats()
  }, [])

  const checkAuthAndLoadStats = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        router.push('/test')
        return
      }
      
      const authData = await authResponse.json()
      setUser(authData.user)

      // Load user stats
      const statsResponse = await fetch('/api/user/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const StatCard = ({ title, value, subtitle, icon }: { title: string, value: string | number, subtitle?: string, icon: string }) => (
    <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700 hover:border-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent">{value}</div>
          {subtitle && <div className="text-xs text-text-secondary opacity-75">{subtitle}</div>}
        </div>
      </div>
      <div className="text-text-primary font-medium">{title}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-4xl animate-bounce">📊</div>
          <div className="text-xl text-accent">Loading your stats...</div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="test-container min-h-screen bg-bg-primary">
      {/* Navigation */}
      <div className="flex justify-between items-center p-6 bg-bg-secondary border-b border-gray-700">
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => router.push('/test')}
            className="text-2xl font-bold text-accent hover:text-yellow-400 transition-colors"
          >
            MonkeyMac
          </button>
          <nav className="flex space-x-6">
            <button 
              onClick={() => router.push('/test')}
              className="text-text-primary hover:text-accent transition-colors"
            >
              Test
            </button>
            <span className="text-accent font-medium">Stats</span>
            <button 
              onClick={() => router.push('/settings')}
              className="text-text-primary hover:text-accent transition-colors"
            >
              Settings
            </button>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <span className="text-text-secondary">
              Welcome back, <span className="text-accent font-medium">{user.firstName}</span>!
            </span>
          )}
          <button 
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' })
                .then(() => router.push('/test'))
            }}
            className="btn-secondary py-1 px-4 text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-2">Your Statistics</h1>
            <p className="text-text-secondary">Track your mental math progress and achievements</p>
          </div>

          {stats ? (
            <div className="space-y-8">
              {/* Core Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Average PPM" 
                  value={stats.averagePPM || 0} 
                  subtitle="problems per minute"
                  icon="⚡"
                />
                <StatCard 
                  title="Tests Taken" 
                  value={stats.totalTests} 
                  icon="🎯"
                />
                <StatCard 
                  title="Tests Restarted" 
                  value={stats.testsRestarted || 0} 
                  icon="🔄"
                />
              </div>

              {/* Overview Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Best Score" 
                  value={stats.bestScore} 
                  subtitle="problems/min"
                  icon="🏆"
                />
                <StatCard 
                  title="Average Accuracy" 
                  value={`${stats.accuracy.toFixed(1)}%`} 
                  icon="✅"
                />
                <StatCard 
                  title="Total Problems" 
                  value={stats.totalProblems.toLocaleString()} 
                  icon="📝"
                />
                <StatCard 
                  title="Time Spent Training" 
                  value={formatTime(stats.totalTimeSpent || 0)} 
                  icon="⏱️"
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Average Score" 
                  value={Math.round(stats.averageScore)} 
                  subtitle="problems per minute"
                  icon="📊"
                />
                <StatCard 
                  title="Current Streak" 
                  value={stats.currentStreak || 0} 
                  subtitle="days"
                  icon="🔥"
                />
                <StatCard 
                  title="Completion Rate" 
                  value={stats.totalTests > 0 ? `${Math.round(((stats.totalTests - (stats.testsRestarted || 0)) / stats.totalTests) * 100)}%` : '0%'} 
                  subtitle="tests finished"
                  icon="✅"
                />
              </div>

              {/* Weekly Progress */}
              <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center">
                  <span className="mr-3">📈</span>
                  This Week's Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    title="Tests This Week" 
                    value={stats.testsThisWeek || 0} 
                    icon="📊"
                  />
                  <StatCard 
                    title="Longest Streak" 
                    value={stats.longestStreak || 0} 
                    subtitle="days"
                    icon="🌟"
                  />
                  <StatCard 
                    title="Favorite Operation" 
                    value={stats.favoriteOperation || 'Addition'} 
                    icon="➕"
                  />
                </div>
              </div>

              {/* Recent Tests */}
              {stats.recentTests && stats.recentTests.length > 0 && (
                <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                  <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center">
                    <span className="mr-3">📋</span>
                    Recent Tests
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="pb-2 text-text-secondary">Date</th>
                          <th className="pb-2 text-text-secondary">Score</th>
                          <th className="pb-2 text-text-secondary">Accuracy</th>
                          <th className="pb-2 text-text-secondary">Problems</th>
                          <th className="pb-2 text-text-secondary">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentTests.slice(0, 5).map((test, index) => (
                          <tr key={test.id} className="border-b border-gray-700/50">
                            <td className="py-2 text-text-primary">{new Date(test.date).toLocaleDateString()}</td>
                            <td className="py-2 text-accent font-medium">{test.score}</td>
                            <td className="py-2 text-text-primary">{test.accuracy.toFixed(1)}%</td>
                            <td className="py-2 text-text-primary">{test.problems}</td>
                            <td className="py-2 text-text-primary">{formatTime(test.duration)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="text-center py-8">
                <button 
                  onClick={() => router.push('/test')}
                  className="btn-primary text-lg px-8 py-3"
                >
                  Start New Test
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">No Stats Yet</h2>
              <p className="text-text-secondary mb-6">Take your first test to start tracking your progress!</p>
              <button 
                onClick={() => router.push('/test')}
                className="btn-primary px-6 py-3"
              >
                Take Your First Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
