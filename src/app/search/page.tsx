'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '../hooks/useDebounce'

interface SearchResult {
  _id: string
  score: number
  accuracy: number
  correctAnswers: number
  totalProblems: number
  difficulty: string
  duration: number
  problemsPerMinute: number
  operations: string[]
  createdAt: string
  restartCount: number
  timeSpent: number
}

interface FilterOptions {
  difficulties: string[]
  durations: number[]
  operations: string[]
  scoreRange: { min: number, max: number }
  accuracyRange: { min: number, max: number }
  dateRange: { min: string, max: string }
}

interface SearchStats {
  totalTests: number
  averageScore: number
  averageAccuracy: number
  bestScore: number
  worstScore: number
  difficultyDistribution: Record<string, number>
  durationDistribution: Record<string, number>
}

interface SearchData {
  results: SearchResult[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  filterOptions: FilterOptions
  searchStats: SearchStats
  appliedFilters: any
}

export default function SearchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchData, setSearchData] = useState<SearchData | null>(null)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    difficulty: 'all',
    duration: 'all',
    operation: 'all',
    scoreMin: '',
    scoreMax: '',
    accuracyMin: '',
    accuracyMax: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    performSearch()
  }, [debouncedQuery, filters])

  const performSearch = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        query: debouncedQuery,
        ...filters,
        limit: '50',
        offset: '0'
      })

      // Remove empty filters
      const keysToDelete: string[] = []
      params.forEach((value, key) => {
        if (!value || value === 'all' || value === '') {
          keysToDelete.push(key)
        }
      })
      keysToDelete.forEach(key => params.delete(key))

      const response = await fetch(`/api/user/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchData(data)
      } else if (response.status === 401) {
        router.push('/test')
      } else {
        console.error('Search request failed:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, filters, router])

  const resetFilters = () => {
    setQuery('')
    setFilters({
      difficulty: 'all',
      duration: 'all',
      operation: 'all',
      scoreMin: '',
      scoreMax: '',
      accuracyMin: '',
      accuracyMax: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
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

  if (loading && !searchData) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-xl text-accent">Loading search...</div>
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
    <div className="test-container p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-text-primary">Advanced Search</h1>
            <button
              onClick={() => router.push('/stats')}
              className="btn-secondary px-6 py-3"
            >
              Back to Stats
            </button>
          </div>
          <p className="text-text-secondary">
            Search and filter through your test results with advanced criteria
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-bg-secondary rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by difficulty, operations, or any keyword..."
                className="w-full p-3 rounded bg-bg-primary text-text-primary border border-gray-600 focus:border-accent focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-6 py-3 rounded font-semibold transition-colors ${
                showAdvancedFilters 
                  ? 'bg-accent text-bg-primary' 
                  : 'bg-bg-primary text-text-primary border border-gray-600 hover:border-accent'
              }`}
            >
              Advanced Filters
            </button>
            <button
              onClick={resetFilters}
              className="btn-secondary px-6 py-3"
            >
              Reset
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && searchData && (
            <div className="border-t border-gray-600 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                    aria-label="Filter by difficulty"
                  >
                    <option value="all">All Difficulties</option>
                    {searchData.filterOptions.difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                    aria-label="Filter by duration"
                  >
                    <option value="all">All Durations</option>
                    {searchData.filterOptions.durations.map(dur => (
                      <option key={dur} value={dur}>{formatTime(dur)}</option>
                    ))}
                  </select>
                </div>

                {/* Operation Filter */}
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Operation</label>
                  <select
                    value={filters.operation}
                    onChange={(e) => setFilters(prev => ({ ...prev, operation: e.target.value }))}
                    className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                    aria-label="Filter by operation"
                  >
                    <option value="all">All Operations</option>
                    {searchData.filterOptions.operations.map(op => (
                      <option key={op} value={op}>{op.charAt(0).toUpperCase() + op.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-text-secondary text-sm mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                    aria-label="Sort results by"
                  >
                    <option value="createdAt">Date</option>
                    <option value="score">Score</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="problemsPerMinute">Speed (PPM)</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
              </div>

              {/* Range Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Score Range ({searchData.filterOptions.scoreRange.min} - {searchData.filterOptions.scoreRange.max})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.scoreMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, scoreMin: e.target.value }))}
                      placeholder="Min"
                      className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                      min={searchData.filterOptions.scoreRange.min}
                      max={searchData.filterOptions.scoreRange.max}
                      aria-label="Minimum score"
                    />
                    <input
                      type="number"
                      value={filters.scoreMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, scoreMax: e.target.value }))}
                      placeholder="Max"
                      className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                      min={searchData.filterOptions.scoreRange.min}
                      max={searchData.filterOptions.scoreRange.max}
                      aria-label="Maximum score"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    Accuracy Range ({searchData.filterOptions.accuracyRange.min}% - {searchData.filterOptions.accuracyRange.max}%)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.accuracyMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, accuracyMin: e.target.value }))}
                      placeholder="Min %"
                      className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                      min={0}
                      max={100}
                    />
                    <input
                      type="number"
                      value={filters.accuracyMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, accuracyMax: e.target.value }))}
                      placeholder="Max %"
                      className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2 rounded bg-bg-primary text-text-primary border border-gray-600"
                  />
                </div>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-4">
                <label className="text-text-secondary text-sm">Sort Order:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sortOrder: 'desc' }))}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.sortOrder === 'desc' 
                        ? 'bg-accent text-bg-primary' 
                        : 'bg-bg-primary text-text-primary border border-gray-600'
                    }`}
                  >
                    Descending
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, sortOrder: 'asc' }))}
                    className={`px-3 py-1 rounded text-sm ${
                      filters.sortOrder === 'asc' 
                        ? 'bg-accent text-bg-primary' 
                        : 'bg-bg-primary text-text-primary border border-gray-600'
                    }`}
                  >
                    Ascending
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Stats */}
        {searchData && searchData.searchStats.totalTests > 0 && (
          <div className="bg-bg-secondary rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold text-text-primary mb-4">Search Results Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-text-secondary text-sm">Total Tests</div>
                <div className="text-2xl font-bold text-accent">{searchData.searchStats.totalTests}</div>
              </div>
              <div>
                <div className="text-text-secondary text-sm">Average Score</div>
                <div className="text-2xl font-bold text-text-primary">{searchData.searchStats.averageScore.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-text-secondary text-sm">Average Accuracy</div>
                <div className="text-2xl font-bold text-correct">{searchData.searchStats.averageAccuracy.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-text-secondary text-sm">Best Score</div>
                <div className="text-2xl font-bold text-accent">{searchData.searchStats.bestScore}</div>
              </div>
              <div>
                <div className="text-text-secondary text-sm">Worst Score</div>
                <div className="text-2xl font-bold text-text-primary">{searchData.searchStats.worstScore}</div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-semibold text-text-primary mb-3">Difficulty Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(searchData.searchStats.difficultyDistribution).map(([difficulty, count]) => (
                    <div key={difficulty} className="flex justify-between items-center">
                      <span className={`capitalize ${getDifficultyColor(difficulty)}`}>{difficulty}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-bg-primary rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full" 
                            style={{ width: `${(count / searchData.searchStats.totalTests) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-text-primary text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-text-primary mb-3">Duration Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(searchData.searchStats.durationDistribution).map(([duration, count]) => (
                    <div key={duration} className="flex justify-between items-center">
                      <span className="text-text-primary">{formatTime(parseInt(duration))}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-bg-primary rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full" 
                            style={{ width: `${(count / searchData.searchStats.totalTests) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-text-primary text-sm w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {searchData && (
          <div className="space-y-4">
            {searchData.results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">No Results Found</h3>
                <p className="text-text-secondary mb-4">
                  Try adjusting your search criteria or removing some filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="btn-primary px-6 py-3"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              searchData.results.map((result) => (
                <div key={result._id} className="bg-bg-secondary rounded-lg p-6 border border-gray-700 hover:border-accent/30 transition-colors">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <div className="text-text-secondary text-sm">Score</div>
                      <div className="text-xl font-bold text-accent">{result.score}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-sm">Accuracy</div>
                      <div className="text-lg font-semibold text-correct">{result.accuracy.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-sm">Problems</div>
                      <div className="text-lg">{result.correctAnswers}/{result.totalProblems}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-sm">Difficulty</div>
                      <div className={`text-lg font-semibold capitalize ${getDifficultyColor(result.difficulty)}`}>
                        {result.difficulty}
                      </div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-sm">Duration</div>
                      <div className="text-lg">{formatTime(result.duration)}</div>
                    </div>
                    <div>
                      <div className="text-text-secondary text-sm">Date</div>
                      <div className="text-lg">{new Date(result.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
                    <div className="flex items-center gap-4">
                      <span>PPM: {result.problemsPerMinute.toFixed(1)}</span>
                      {result.operations.length > 0 && (
                        <span>Operations: {result.operations.join(', ')}</span>
                      )}
                      {result.restartCount > 0 && (
                        <span>Restarted: {result.restartCount}x</span>
                      )}
                    </div>
                    <div>
                      {new Date(result.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Load More */}
            {searchData.pagination.hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={() => {
                    // Implement load more functionality
                    console.log('Load more results')
                  }}
                  className="btn-secondary px-8 py-3"
                >
                  Load More Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
