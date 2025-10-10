'use client'

import { useState, useEffect, useCallback } from 'react'
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
  records: Record<string, Record<string, number>>
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

  const checkAuthAndLoadStats = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    checkAuthAndLoadStats()
  }, [checkAuthAndLoadStats])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const PPMBarChart = ({ recentTests }: { recentTests: any[] }) => {
    // Define PPM ranges
    const ranges = [
      { min: 0, max: 10, label: '0-10' },
      { min: 10, max: 20, label: '10-20' },
      { min: 20, max: 30, label: '20-30' },
      { min: 30, max: 40, label: '30-40' },
      { min: 40, max: 50, label: '40-50' },
      { min: 50, max: 60, label: '50-60' },
      { min: 60, max: 70, label: '60-70' },
      { min: 70, max: 80, label: '70-80' },
      { min: 80, max: 90, label: '80-90' },
      { min: 90, max: 100, label: '90-100' },
      { min: 100, max: Infinity, label: '100+' }
    ]

    // Calculate PPM for each test and categorize
    const distribution = ranges.map(range => ({
      ...range,
      count: 0,
      percentage: 0
    }))

    recentTests.forEach(test => {
      const ppm = test.duration > 0 ? Math.round((test.problems / (test.duration / 60))) : 0
      const rangeIndex = ranges.findIndex(r => ppm >= r.min && ppm < r.max)
      if (rangeIndex !== -1) {
        distribution[rangeIndex].count++
      }
    })

    // Calculate percentages
    const totalTests = recentTests.length
    distribution.forEach(range => {
      range.percentage = totalTests > 0 ? (range.count / totalTests) * 100 : 0
    })

    const maxCount = Math.max(...distribution.map(d => d.count), 1)

    return (
      <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
          <span className="mr-3">📊</span>
          PPM Distribution
        </h2>
        <div className="space-y-3">
          {distribution.map((range, index) => (
            <div key={range.label} className="flex items-center">
              <div className="w-12 text-sm text-text-secondary font-mono">
                {range.label}
              </div>
              <div className="flex-1 mx-4">
                <div className="relative h-6 bg-bg-primary rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                      range.count > 0 ? 'bg-gradient-to-r from-accent to-yellow-400' : 'bg-gray-600'
                    }`}
                    style={
                      {
                        width: `${Math.max((range.count / maxCount) * 100, range.count > 0 ? 8 : 0)}%`
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <span className="text-sm text-text-primary font-medium">{range.count}</span>
                <span className="text-xs text-text-secondary ml-1">
                  ({range.percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-xs text-text-secondary opacity-75">
          Based on your last {totalTests} test{totalTests !== 1 ? 's' : ''}
        </div>
      </div>
    )
  }

  const ProgressionLineChart = ({ recentTests }: { recentTests: any[] }) => {
    // Sort tests by date and take last 20 for better visualization
    const sortedTests = [...recentTests]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-20)

    if (sortedTests.length < 2) {
      return (
        <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center">
            <span className="mr-3">📈</span>
            Progression & Improvement
          </h2>
          <div className="text-center text-text-secondary py-8">
            <div className="text-4xl mb-2">📊</div>
            <p>Take more tests to see your progression chart!</p>
            <p className="text-sm opacity-75 mt-1">Need at least 2 tests to show trends</p>
          </div>
        </div>
      )
    }

    // Calculate metrics for each test
    const dataPoints = sortedTests.map((test, index) => {
      const ppm = test.duration > 0 ? Math.round((test.problems / (test.duration / 60))) : 0
      return {
        index: index + 1,
        ppm,
        accuracy: test.accuracy,
        date: new Date(test.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    })

    const maxPPM = Math.max(...dataPoints.map(d => d.ppm), 10)
    const minPPM = Math.min(...dataPoints.map(d => d.ppm), 0)
    const ppmRange = maxPPM - minPPM || 1

    // Calculate trend
    const firstPPM = dataPoints[0].ppm
    const lastPPM = dataPoints[dataPoints.length - 1].ppm
    const improvement = lastPPM - firstPPM
    const improvementPercent = firstPPM > 0 ? ((improvement / firstPPM) * 100) : 0

    // Generate SVG path for the line
    const generatePath = (points: any[], getValue: (p: any) => number, maxValue: number, minValue: number) => {
      const width = 600
      const height = 200
      const padding = 40
      
      const pathData = points.map((point, index) => {
        const x = padding + (index / (points.length - 1)) * (width - 2 * padding)
        const value = getValue(point)
        const y = height - padding - ((value - minValue) / (maxValue - minValue || 1)) * (height - 2 * padding)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      }).join(' ')

      return pathData
    }

    const ppmPath = generatePath(dataPoints, (p) => p.ppm, maxPPM, minPPM)

    return (
      <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-text-primary flex items-center">
            <span className="mr-3">📈</span>
            Progression & Improvement
          </h2>
          <div className="text-right">
            <div className={`text-lg font-bold ${improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {improvement >= 0 ? '+' : ''}{improvement} PPM
            </div>
            <div className={`text-sm ${improvementPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {improvementPercent >= 0 ? '+' : ''}{improvementPercent.toFixed(1)}% improvement
            </div>
          </div>
        </div>

        <div className="relative">
          <svg width="100%" height="250" viewBox="0 0 600 250" className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <g key={ratio}>
                <line
                  x1="40"
                  y1={210 - ratio * 160}
                  x2="560"
                  y2={210 - ratio * 160}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x="30"
                  y={215 - ratio * 160}
                  fill="#9CA3AF"
                  fontSize="10"
                  textAnchor="end"
                >
                  {Math.round(minPPM + ratio * ppmRange)}
                </text>
              </g>
            ))}

            {/* PPM Line */}
            <path
              d={ppmPath}
              fill="none"
              stroke="url(#ppmGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {dataPoints.map((point, index) => {
              const x = 40 + (index / (dataPoints.length - 1)) * 520
              const y = 210 - ((point.ppm - minPPM) / ppmRange) * 160
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#F59E0B"
                    stroke="#FEF3C7"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y="240"
                    fill="#9CA3AF"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {point.date}
                  </text>
                </g>
              )
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="ppmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="mt-4 flex justify-between text-sm text-text-secondary">
          <div>
            <span className="inline-block w-3 h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full mr-2"></span>
            Problems Per Minute (PPM)
          </div>
          <div>
            Last {dataPoints.length} tests • Best: {Math.max(...dataPoints.map(d => d.ppm))} PPM
          </div>
        </div>
      </div>
    )
  }

  const RecordsTable = ({ records }: { records: Record<string, Record<string, number>> }) => {
    const durations = ['15s', '30s', '60s', '120s']
    const difficulties = ['easy', 'medium', 'hard', 'abstract']
    
    const getDurationLabel = (duration: string) => {
      switch (duration) {
        case '15s': return '15 sec'
        case '30s': return '30 sec' 
        case '60s': return '1 min'
        case '120s': return '2 min'
        default: return duration
      }
    }

    const getDifficultyIcon = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return '🟢'
        case 'medium': return '🟡' 
        case 'hard': return '🔴'
        case 'abstract': return '🟣'
        default: return '⚪'
      }
    }

    return (
      <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center">
          <span className="mr-3">🏆</span>
          Personal Records
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left py-3 text-text-secondary font-medium">Duration</th>
                {difficulties.map(diff => (
                  <th key={diff} className="text-center py-3 text-text-secondary font-medium">
                    <div className="flex flex-col items-center">
                      <span>{getDifficultyIcon(diff)}</span>
                      <span className="text-xs capitalize">{diff}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {durations.map(duration => (
                <tr key={duration} className="border-b border-gray-700/50 hover:bg-bg-primary/20">
                  <td className="py-4 font-medium text-text-primary">
                    {getDurationLabel(duration)}
                  </td>
                  {difficulties.map(difficulty => {
                    const record = records[duration]?.[difficulty] || 0
                    return (
                      <td key={difficulty} className="py-4 text-center">
                        {record > 0 ? (
                          <div className="flex flex-col items-center">
                            <span className="text-lg font-bold text-accent">{record}</span>
                            <span className="text-xs text-text-secondary">PPM</span>
                          </div>
                        ) : (
                          <span className="text-text-secondary opacity-50">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center text-xs text-text-secondary opacity-75">
          Your best Problems Per Minute (PPM) for each time duration and difficulty combination
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) => (
    <div className="bg-bg-secondary rounded-lg p-4 border border-gray-700 hover:border-accent/30 transition-colors">
      <div className="text-right mb-2">
        <div className="text-xl font-bold text-accent">{value}</div>
        {subtitle && <div className="text-xs text-text-secondary opacity-75">{subtitle}</div>}
      </div>
      <div className="text-text-primary font-medium text-sm">{title}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center space-y-6">
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
            <div className="space-y-6">
              {/* Core Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Average PPM" 
                  value={stats.averagePPM || 0} 
                  subtitle="problems per minute"
                />
                <StatCard 
                  title="Tests Taken" 
                  value={stats.totalTests} 
                />
                <StatCard 
                  title="Tests Restarted" 
                  value={stats.testsRestarted || 0} 
                />
              </div>

              {/* Overview Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Best Score" 
                  value={stats.bestScore} 
                  subtitle="problems/min"
                />
                <StatCard 
                  title="Average Accuracy" 
                  value={`${stats.accuracy.toFixed(1)}%`} 
                />
                <StatCard 
                  title="Total Problems" 
                  value={stats.totalProblems.toLocaleString()} 
                />
                <StatCard 
                  title="Time Spent Training" 
                  value={formatTime(stats.totalTimeSpent || 0)} 
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Average Score" 
                  value={Math.round(stats.averageScore)} 
                  subtitle="problems per minute"
                />
                <StatCard 
                  title="Current Streak" 
                  value={stats.currentStreak || 0} 
                  subtitle="days"
                />
                <StatCard 
                  title="Completion Rate" 
                  value={stats.totalTests > 0 ? `${Math.round(((stats.totalTests - (stats.testsRestarted || 0)) / stats.totalTests) * 100)}%` : '0%'} 
                  subtitle="tests finished"
                />
              </div>

              {/* Weekly Progress */}
              <div className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-text-primary mb-4">
                  This Week&apos;s Progress
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard 
                    title="Tests This Week" 
                    value={stats.testsThisWeek || 0} 
                  />
                  <StatCard 
                    title="Longest Streak" 
                    value={stats.longestStreak || 0} 
                    subtitle="days"
                  />
                  <StatCard 
                    title="Favorite Operation" 
                    value={stats.favoriteOperation || 'Addition'} 
                  />
                </div>
              </div>

              {/* Personal Records */}
              <RecordsTable records={stats.records || {}} />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PPM Distribution Chart */}
                {stats.recentTests && stats.recentTests.length > 0 && (
                  <PPMBarChart recentTests={stats.recentTests} />
                )}

                {/* Progression Chart */}
                {stats.recentTests && stats.recentTests.length > 0 && (
                  <ProgressionLineChart recentTests={stats.recentTests} />
                )}
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
