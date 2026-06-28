'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'

interface LeaderboardEntry {
  userId: string
  username: string
  email: string
  bestScore?: number
  averageScore?: number
  averageAccuracy?: number
  averagePPM?: number
  bestPPM?: number
  consistencyScore?: number
  standardDeviation?: number
  totalTests?: number
  totalProblems?: number
  testCount?: number
  overallAccuracy?: number
  daysActive?: number
  firstTestDate?: string
  lastTestDate?: string
  elo?: number
  multiplayerGames?: number
  multiplayerWins?: number
  multiplayerLosses?: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

interface LeaderboardsData {
  leaderboards: {
    bestScore?: LeaderboardEntry[]
    averageScore?: LeaderboardEntry[]
    accuracy?: LeaderboardEntry[]
    speed?: LeaderboardEntry[]
    consistency?: LeaderboardEntry[]
    totalTests?: LeaderboardEntry[]
    elo?: LeaderboardEntry[]
    multiplayerWins?: LeaderboardEntry[]
  }
  userRankings: {
    bestScore?: { value: number; rank: number | null; outOf: number | null }
    averageScore?: { value: number; rank: number | null; outOf: number | null }
    accuracy?: { value: number; rank: number | null; outOf: number | null }
    speed?: { value: number; rank: number | null; outOf: number | null }
    totalTests?: { value: number; rank: number | null; outOf: number | null }
    elo?: { value: number; rank: number | null; outOf: number | null }
    multiplayerWins?: { value: number; rank: number | null; outOf: number | null }
  }
  achievements: {
    achievements: Achievement[]
    unlockedAchievements: Achievement[]
    totalUnlocked: number
    totalPossible: number
    completionPercentage: number
  }
}

export default function LeaderboardsPage() {
  const [data, setData] = useState<LeaderboardsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'leaderboards' | 'achievements'>('leaderboards')
  const [category, setCategory] = useState('overall')
  const [timeframe, setTimeframe] = useState('all-time')
  const [difficulty, setDifficulty] = useState('all')
  const [selectedLeaderboard, setSelectedLeaderboard] = useState('bestScore')
  const router = useRouter()

  const fetchLeaderboards = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        category,
        timeframe,
        difficulty,
        limit: '50'
      })
      
      const response = await fetch(`/api/user/leaderboards?${params}`)
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch leaderboards')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboards()
  }, [category, timeframe, difficulty])

  const getRankSuffix = (rank: number) => {
    if (rank % 100 >= 11 && rank % 100 <= 13) {
      return 'th'
    }
    switch (rank % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const renderLeaderboard = (entries: LeaderboardEntry[], type: string) => {
    if (!entries || entries.length === 0) {
      return <div className="text-sub">No data available</div>
    }

    return (
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={entry.userId} className="bg-bg-secondary rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`text-lg font-bold w-8 text-center ${
                index === 0 ? 'text-yellow-500' : 
                index === 1 ? 'text-gray-400' : 
                index === 2 ? 'text-orange-600' : 
                'text-text'
              }`}>
                #{index + 1}
              </div>
              <div>
                <div className="font-semibold text-text">{entry.username}</div>
                <div className="text-sm text-sub">
                  {type === 'elo' || type === 'multiplayerWins'
                    ? `${entry.multiplayerGames ?? 0} races`
                    : `${entry.testCount ?? 0} tests`}
                </div>
              </div>
            </div>
            <div className="text-right">
              {type === 'bestScore' && (
                <div className="text-lg font-bold text-text">{entry.bestScore}</div>
              )}
              {type === 'averageScore' && (
                <>
                  <div className="text-lg font-bold text-text">{entry.averageScore}</div>
                  <div className="text-sm text-sub">{entry.overallAccuracy}% accuracy</div>
                </>
              )}
              {type === 'accuracy' && (
                <>
                  <div className="text-lg font-bold text-text">{entry.averageAccuracy}%</div>
                  <div className="text-sm text-sub">{entry.totalProblems} problems</div>
                </>
              )}
              {type === 'speed' && (
                <>
                  <div className="text-lg font-bold text-text">{entry.averagePPM} PPM</div>
                  <div className="text-sm text-sub">Best: {entry.bestPPM} PPM</div>
                </>
              )}
              {type === 'consistency' && (
                <>
                  <div className="text-lg font-bold text-text">{entry.consistencyScore}</div>
                  <div className="text-sm text-sub">σ: {entry.standardDeviation}</div>
                </>
              )}
              {type === 'totalTests' && (
                <>
                  <div className="text-lg font-bold text-text">{entry.totalTests}</div>
                  <div className="text-sm text-sub">{entry.daysActive} days active</div>
                </>
              )}
              {type === 'elo' && (
                <>
                  <div className="text-lg font-bold text-text">{entry.elo}</div>
                  <div className="text-sm text-sub">
                    {entry.multiplayerWins}W / {entry.multiplayerLosses}L
                  </div>
                </>
              )}
              {type === 'multiplayerWins' && (
                <>
                  <div className="text-lg font-bold text-text">{entry.multiplayerWins} wins</div>
                  <div className="text-sm text-sub">ELO {entry.elo}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderAchievements = () => {
    if (!data?.achievements) return null

    const { achievements, totalUnlocked, totalPossible, completionPercentage } = data.achievements

    return (
      <div className="space-y-6">
        <div className="bg-bg-secondary rounded-lg p-6">
          <h3 className="text-xl font-bold text-text mb-4">Achievement Progress</h3>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 bg-bg rounded-full h-3 relative overflow-hidden">
              <div 
                className="bg-main h-full rounded-full transition-all duration-300 absolute top-0 left-0"
                {...({ style: { width: `${completionPercentage}%` } } as any)}
              />
            </div>
            <div className="text-text font-semibold">
              {totalUnlocked}/{totalPossible} ({completionPercentage}%)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`rounded-lg p-4 border-2 transition-all ${
                achievement.unlocked
                  ? 'bg-bg-secondary border-main text-text'
                  : 'bg-bg border-sub text-sub opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{achievement.name}</h4>
                  <p className="text-sm mb-2">{achievement.description}</p>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <p className="text-xs opacity-75">
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-sub">Loading leaderboards...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-4">Leaderboards & Achievements</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('leaderboards')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'leaderboards'
                  ? 'bg-main text-bg'
                  : 'text-sub hover:text-text'
              }`}
            >
              Leaderboards
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-main text-bg'
                  : 'text-sub hover:text-text'
              }`}
            >
              Achievements
            </button>
          </div>

          {activeTab === 'leaderboards' && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label htmlFor="timeframe-select" className="block text-sm text-sub mb-1">Timeframe</label>
                  <select
                    id="timeframe-select"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-bg-secondary border border-sub rounded px-3 py-2 text-text"
                  >
                    <option value="all-time">All Time</option>
                    <option value="monthly">This Month</option>
                    <option value="weekly">This Week</option>
                    <option value="daily">Today</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty-select" className="block text-sm text-sub mb-1">Difficulty</label>
                  <select
                    id="difficulty-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-bg-secondary border border-sub rounded px-3 py-2 text-text"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="abstract">Abstract</option>
                  </select>
                </div>
              </div>

              {/* Leaderboard Selection */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'bestScore', label: 'Best Score' },
                  { key: 'averageScore', label: 'Average Score' },
                  { key: 'accuracy', label: 'Accuracy' },
                  { key: 'speed', label: 'Speed (PPM)' },
                  { key: 'consistency', label: 'Consistency' },
                  { key: 'totalTests', label: 'Most Active' },
                  { key: 'elo', label: 'Multiplayer ELO' },
                  { key: 'multiplayerWins', label: 'Multiplayer Wins' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLeaderboard(key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedLeaderboard === key
                        ? 'bg-main text-bg'
                        : 'bg-bg-secondary text-sub hover:text-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* User Rankings */}
              {data?.userRankings && (
                <div className="bg-bg-secondary rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-text mb-3">Your Rankings</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(data.userRankings).map(([key, ranking]) => (
                      <div key={key} className="text-center">
                        <div className="text-sm text-sub capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-lg font-bold text-text">
                          {typeof ranking.value === 'number' ? ranking.value.toFixed(1) : ranking.value}
                        </div>
                        {ranking.rank && (
                          <div className="text-xs text-sub">
                            #{ranking.rank}{getRankSuffix(ranking.rank)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Leaderboard */}
              <div className="bg-bg-secondary rounded-lg p-6">
                <h3 className="text-xl font-bold text-text mb-4">
                  {selectedLeaderboard === 'bestScore' && 'Best Score Leaderboard'}
                  {selectedLeaderboard === 'averageScore' && 'Average Score Leaderboard'}
                  {selectedLeaderboard === 'accuracy' && 'Accuracy Leaderboard'}
                  {selectedLeaderboard === 'speed' && 'Speed Leaderboard'}
                  {selectedLeaderboard === 'consistency' && 'Consistency Leaderboard'}
                  {selectedLeaderboard === 'totalTests' && 'Most Active Users'}
                  {selectedLeaderboard === 'elo' && 'Multiplayer ELO Leaderboard'}
                  {selectedLeaderboard === 'multiplayerWins' && 'Multiplayer Wins Leaderboard'}
                </h3>
                
                {data?.leaderboards && renderLeaderboard(
                  data.leaderboards[selectedLeaderboard as keyof typeof data.leaderboards] || [],
                  selectedLeaderboard
                )}
              </div>
            </>
          )}

          {activeTab === 'achievements' && renderAchievements()}
        </div>
      </div>
    </div>
  )
}
