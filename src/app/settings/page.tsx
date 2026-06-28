'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../../styles/enhanced-settings.css'
import { FONTS } from '../../config/fonts'
import type { ProblemLayout, UserPreferences } from '../../config/types'
import CustomThemeBuilder from '../../components/CustomThemeBuilder'
import { getAllThemes } from '../../lib/customThemes'
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  loadLocalPreferences,
  normalizePreferences,
  PROBLEM_LAYOUTS,
  saveLocalPreferences,
} from '../../lib/preferences'

export default function SettingsPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [operationStats, setOperationStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        await loadUserPreferences()
        await loadOperationStats()
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }

    const local = loadLocalPreferences()
    setPreferences(local)
    applyPreferences(local)
    setLoading(false)
  }

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        const next = normalizePreferences(data.preferences)
        setPreferences(next)
        applyPreferences(next)
        saveLocalPreferences(next)
        return
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    }

    const local = loadLocalPreferences()
    setPreferences(local)
    applyPreferences(local)
  }

  const savePreferences = async (update: Partial<UserPreferences>) => {
    const next = normalizePreferences({ ...preferences, ...update })
    setPreferences(next)
    applyPreferences(next)
    saveLocalPreferences(next)

    if (isAuthenticated) {
      try {
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        })
      } catch (error) {
        console.error('Failed to save user preferences:', error)
      }
    }
  }

  const loadOperationStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/user/operation-stats')
      if (response.ok) {
        const data = await response.json()
        setOperationStats(data)
      }
    } catch (error) {
      console.error('Failed to load operation stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="bg-bg-secondary border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-accent/10 border border-accent/20">
              <img src="/monk.png" alt="MonkeyMac Logo" className="w-full h-full object-cover object-center" />
            </div>
            <h1 className="text-2xl font-bold text-accent">Settings</h1>
          </div>
          <button
            onClick={() => router.push('/test')}
            className="text-text-secondary hover:text-accent transition-colors"
          >
            ← Back to Test
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-xl text-text-primary mb-2">
            {user?.firstName ? `Welcome, ${user.firstName}! 👋` : 'Customize your experience'}
          </h2>
          <p className="text-text-secondary">
            {isAuthenticated
              ? 'Changes sync to your account and apply instantly on the test page.'
              : 'Customize locally as a guest. Log in to sync preferences across devices.'}
          </p>
          {!isAuthenticated && (
            <button onClick={() => router.push('/login')} className="mt-3 text-accent hover:underline text-sm">
              Log in to sync preferences →
            </button>
          )}
        </div>

        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Themes</h2>
          <p className="text-text-secondary mb-6">Choose from MonkeyType-inspired color schemes</p>
          <div className="theme-grid">
            {getAllThemes(preferences.customThemes).map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${preferences.theme === theme.id ? 'selected' : ''}`}
                onClick={() => savePreferences({ theme: theme.id })}
              >
                <div className="theme-preview" style={{ backgroundColor: theme.colors.primary }}>
                  <div className="theme-preview-accent" style={{ backgroundColor: theme.colors.accent }} />
                  <div className="theme-preview-text" style={{ color: theme.colors.textPrimary }}>
                    Aa
                  </div>
                </div>
                <div className="theme-name">
                  {theme.name}
                  {theme.custom && <span className="text-xs text-accent ml-1">custom</span>}
                </div>
                {preferences.theme === theme.id && (
                  <div className="text-accent text-xs font-bold mt-2">✓ ACTIVE</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <CustomThemeBuilder preferences={preferences} onSave={savePreferences} />

        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Fonts</h2>
          <p className="text-text-secondary mb-6">Pick a typeface for problems and answers</p>
          <div className="font-grid">
            {FONTS.map((font) => (
              <div
                key={font.id}
                className={`font-card ${preferences.font === font.id ? 'selected' : ''} ${
                  font.category === 'display' ? 'glow-font' : ''
                }`}
                onClick={() => savePreferences({ font: font.id })}
              >
                <div className="font-preview" style={{ fontFamily: font.family }}>
                  {font.name}
                </div>
                {preferences.font === font.id && (
                  <div className="text-accent text-xs font-bold mt-2">✓ ACTIVE</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Test Font Size</h2>
          <p className="text-text-secondary mb-6">Adjust the font size for math problems during tests</p>
          <div className="font-size-controls">
            <span className="text-text-secondary min-w-[60px]">Small</span>
            <input
              type="range"
              min="1.5"
              max="6"
              step="0.25"
              value={preferences.fontSize}
              onChange={(e) => savePreferences({ fontSize: parseFloat(e.target.value) })}
              className="font-size-slider"
            />
            <span className="text-text-secondary min-w-[60px] text-right">Large</span>
            <span className="text-accent font-bold min-w-[80px] text-center">{preferences.fontSize}rem</span>
          </div>
          <div className="test-preview">
            <div className="test-preview-problem" style={{ fontSize: `${preferences.fontSize}rem` }}>
              42 + 18 = ?
            </div>
            <input
              type="text"
              className="test-preview-input"
              style={{ fontSize: `${preferences.fontSize * 0.8}rem` }}
              placeholder="60"
              readOnly
            />
          </div>
        </div>

        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Problem Layout</h2>
          <p className="text-text-secondary mb-6">Choose how problems appear during a test</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROBLEM_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => savePreferences({ problemLayout: layout.id as ProblemLayout })}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  preferences.problemLayout === layout.id
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="font-semibold text-text-primary mb-1">{layout.name}</div>
                <div className="text-sm text-text-secondary">{layout.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Test UI Options</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-text-primary">Show countdown timer</span>
              <input
                type="checkbox"
                checked={preferences.showTimer}
                onChange={(e) => savePreferences({ showTimer: e.target.checked })}
                className="accent-accent w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-text-primary">Show recent problem dots</span>
              <input
                type="checkbox"
                checked={preferences.showRecentDots}
                onChange={(e) => savePreferences({ showRecentDots: e.target.checked })}
                className="accent-accent w-5 h-5"
              />
            </label>
          </div>
        </div>

        {isAuthenticated && operationStats && (
          <div className="stats-card-enhanced mb-8">
            <h2 className="text-3xl font-semibold mb-6">📊 Your Performance by Operation</h2>
            {statsLoading ? (
              <div className="text-center text-text-secondary">Loading statistics...</div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.totalTests || 0}</div>
                    <div className="stat-label">Total Tests</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.totalProblems || 0}</div>
                    <div className="stat-label">Total Problems</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.avgAccuracy?.toFixed(1) || 0}%</div>
                    <div className="stat-label">Overall Accuracy</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{operationStats.overallStats?.avgTimePerProblem?.toFixed(1) || 0}s</div>
                    <div className="stat-label">Avg Time/Problem</div>
                  </div>
                </div>
                <div className="operation-breakdown">
                  {Object.entries(operationStats.operationStats || {}).map(([operation, stats]: [string, any]) => (
                    <div key={operation} className="operation-card">
                      <div className="operation-title">{operation}</div>
                      <div className="operation-stats">
                        <div className="operation-stat">
                          <span>Accuracy:</span>
                          <span className="text-correct font-bold">{stats.avgAccuracy?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="operation-stat">
                          <span>Avg Time:</span>
                          <span className="text-accent font-bold">{stats.avgTimePerProblem?.toFixed(2) || 0}s</span>
                        </div>
                        <div className="operation-stat">
                          <span>Problems:</span>
                          <span className="text-text-primary">{stats.totalProblems || 0}</span>
                        </div>
                        <div className="operation-stat">
                          <span>Tests:</span>
                          <span className="text-text-primary">{stats.testCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="stats-card">
          <h2 className="text-3xl font-semibold mb-6">Live Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Current Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Theme:</span>
                  <span className="text-text-primary">
                    {getAllThemes(preferences.customThemes).find((t) => t.id === preferences.theme)?.name ||
                      preferences.theme}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Font:</span>
                  <span className="text-text-primary">
                    {FONTS.find((f) => f.id === preferences.font)?.name || preferences.font}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Test Font Size:</span>
                  <span className="text-text-primary">{preferences.fontSize}rem</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Layout:</span>
                  <span className="text-text-primary capitalize">{preferences.problemLayout}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Theme Preview</h3>
              <div className={`p-4 rounded-lg bg-bg-secondary layout-preview layout-preview-${preferences.problemLayout}`}>
                <div className="problem-display mb-4">15 × 7 = ?</div>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-text-secondary">Time: 1:45</span>
                  <span className="text-correct">Score: 23</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {user && (
          <div className="stats-card mt-8">
            <h2 className="text-3xl font-semibold mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Profile</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Name:</span>
                    <span className="text-text-primary">{user.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Username:</span>
                    <span className="text-text-primary">@{user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phone:</span>
                    <span className="text-text-primary">{user.phone}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => router.push('/test')} className="w-full btn-primary py-2">
                    Take Math Test
                  </button>
                  <button
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/'))
                    }}
                    className="w-full btn-secondary py-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
