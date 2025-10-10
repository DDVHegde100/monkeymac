'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface TestResult {
  _id: string
  score: number
  accuracy: number
  correctAnswers: number
  totalProblems: number
  difficulty: string
  duration: number
  problemsPerMinute: number
  createdAt: string
  restartCount: number
  timeSpent: number
  operations: string[]
}

interface Session {
  id: string
  startTime: string
  endTime: string
  tests: TestResult[]
  totalTests: number
  totalProblems: number
  totalCorrect: number
  averageAccuracy: number
  averageScore: number
  difficulties: string[]
  durations: number[]
  duration: number
  sessionAccuracy: number
}

interface DailyStats {
  date: string
  testsCount: number
  totalProblems: number
  totalCorrect: number
  averageScore: number
  bestScore: number
  averageAccuracy: number
  difficulties: string[]
  durations: number[]
}

interface TestHistoryData {
  tests: TestResult[]
  sessions: Session[]
  dailyStats: DailyStats[]
  pagination: {
    currentPage: number
    totalPages: number
    totalTests: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function TestHistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [historyData, setHistoryData] = useState<TestHistoryData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    difficulty: 'all',
    duration: 'all',
    startDate: '',
    endDate: ''
  })
  const [viewMode, setViewMode] = useState<'tests' | 'sessions' | 'daily'>('tests')

  useEffect(() => {
    loadTestHistory()
  }, [currentPage, filters])

  const loadTestHistory = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        difficulty: filters.difficulty,
        duration: filters.duration,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/api/user/test-history?${params}`)
      if (response.ok) {
        const data = await response.json()
        setHistoryData(data)
      } else if (response.status === 401) {
        router.push('/test')
      }
    } catch (error) {
      console.error('Failed to load test history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatDuration = (milliseconds: number) => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
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

  const resetFilters = () => {
    setFilters({
      difficulty: 'all',
      duration: 'all',
      startDate: '',
      endDate: ''
    })
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-xl text-accent">Loading test history...</div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!historyData) {
    return (
      <div className="test-container p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">Test History</h1>
          <p className="text-text-secondary mb-8">Unable to load test history</p>
          <button
            onClick={() => router.push('/test')}
            className="btn-primary px-8 py-3"
          >
            Back to Test
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
            <h1 className="text-4xl font-bold text-text-primary">Test History</h1>
            <button
              onClick={() => router.push('/stats')}
              className="btn-secondary px-6 py-3"
            >
              Back to Stats
            </button>
          </div>
          <p className="text-text-secondary">
            Detailed analysis of your {historyData.pagination.totalTests} completed tests
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('tests')}
            className={`px-4 py-2 rounded ${viewMode === 'tests' ? 'bg-accent text-bg-primary' : 'bg-bg-secondary text-text-primary'}`}
          >
            Individual Tests ({historyData.tests.length})
          </button>
          <button
            onClick={() => setViewMode('sessions')}
            className={`px-4 py-2 rounded ${viewMode === 'sessions' ? 'bg-accent text-bg-primary' : 'bg-bg-secondary text-text-primary'}`}
          >
            Sessions ({historyData.sessions.length})
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded ${viewMode === 'daily' ? 'bg-accent text-bg-primary' : 'bg-bg-secondary text-text-primary'}`}
          >
            Daily Summary ({historyData.dailyStats.length})
          </button>
        </div>

        {/* Filters */}
        <div className="bg-bg-secondary rounded-lg p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                aria-label="Filter by difficulty"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="abstract">Abstract</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-2">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                aria-label="Filter by duration"
              >
                <option value="all">All Durations</option>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="120">2 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                aria-label="Filter by start date"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                aria-label="Filter by end date"
              />
            </div>
          </div>
          <button
            onClick={resetFilters}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'tests' && (
          <div className="space-y-4">
            {historyData.tests.map((test) => (
              <div key={test._id} className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <div className="text-text-secondary text-sm">Score</div>
                    <div className="text-xl font-bold text-accent">{test.score}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Accuracy</div>
                    <div className="text-lg font-semibold text-correct">{test.accuracy.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Problems</div>
                    <div className="text-lg">{test.correctAnswers}/{test.totalProblems}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Difficulty</div>
                    <div className={`text-lg font-semibold capitalize ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Duration</div>
                    <div className="text-lg">{formatTime(test.duration)}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Date</div>
                    <div className="text-lg">{new Date(test.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {test.restartCount > 0 && (
                  <div className="mt-2 text-sm text-text-secondary">
                    Restarted {test.restartCount} time{test.restartCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'sessions' && (
          <div className="space-y-4">
            {historyData.sessions.map((session) => (
              <div key={session.id} className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      Session on {new Date(session.startTime).toLocaleDateString()}
                    </h3>
                    <p className="text-text-secondary">
                      {formatDuration(session.duration)} • {session.totalTests} tests • 
                      {session.difficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">{session.averageScore.toFixed(1)}</div>
                    <div className="text-text-secondary text-sm">Avg Score</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-text-secondary text-sm">Session Accuracy</div>
                    <div className="text-lg font-semibold text-correct">{session.sessionAccuracy.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Total Problems</div>
                    <div className="text-lg">{session.totalCorrect}/{session.totalProblems}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Start Time</div>
                    <div className="text-lg">{new Date(session.startTime).toLocaleTimeString()}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">End Time</div>
                    <div className="text-lg">{new Date(session.endTime).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'daily' && (
          <div className="space-y-4">
            {historyData.dailyStats.map((day) => (
              <div key={day.date} className="bg-bg-secondary rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <p className="text-text-secondary">
                      {day.testsCount} test{day.testsCount !== 1 ? 's' : ''} • 
                      {day.difficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-accent">{day.bestScore}</div>
                    <div className="text-text-secondary text-sm">Best Score</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-text-secondary text-sm">Average Score</div>
                    <div className="text-lg font-semibold text-text-primary">{day.averageScore.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Average Accuracy</div>
                    <div className="text-lg font-semibold text-correct">{day.averageAccuracy.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Total Problems</div>
                    <div className="text-lg">{day.totalCorrect}/{day.totalProblems}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary text-sm">Durations Practiced</div>
                    <div className="text-lg">{day.durations.map(d => formatTime(d)).join(', ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'tests' && historyData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!historyData.pagination.hasPrev}
              className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-text-primary">
              Page {historyData.pagination.currentPage} of {historyData.pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!historyData.pagination.hasNext}
              className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
