'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    correct: string
    incorrect: string
    textPrimary: string
    textSecondary: string
  }
}

const THEMES: Theme[] = [
  {
    id: 'dark',
    name: 'Dark (Default)',
    colors: {
      primary: '#1a1a1a',
      secondary: '#2a2a2a',
      accent: '#ffd700',
      correct: '#00ff00',
      incorrect: '#ff0000',
      textPrimary: '#ffffff',
      textSecondary: '#b8b8b8'
    }
  },
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      accent: '#0066cc',
      correct: '#00aa00',
      incorrect: '#cc0000',
      textPrimary: '#000000',
      textSecondary: '#666666'
    }
  },
  {
    id: 'serika',
    name: 'Serika',
    colors: {
      primary: '#323437',
      secondary: '#2c2e31',
      accent: '#e2b714',
      correct: '#00ff00',
      incorrect: '#ff0000',
      textPrimary: '#d1d0c5',
      textSecondary: '#646669'
    }
  },
  {
    id: 'metropolis',
    name: 'Metropolis',
    colors: {
      primary: '#1e1e1e',
      secondary: '#2d2d2d',
      accent: '#fc7753',
      correct: '#00ff00',
      incorrect: '#ff0000',
      textPrimary: '#ffffff',
      textSecondary: '#a0a0a0'
    }
  },
  {
    id: 'laser',
    name: 'Laser',
    colors: {
      primary: '#031926',
      secondary: '#0b2137',
      accent: '#00ff00',
      correct: '#00ff00',
      incorrect: '#ff0000',
      textPrimary: '#ffffff',
      textSecondary: '#7dd3fc'
    }
  },
  {
    id: 'botanical',
    name: 'Botanical',
    colors: {
      primary: '#283618',
      secondary: '#1a2409',
      accent: '#bc6c25',
      correct: '#00ff00',
      incorrect: '#ff0000',
      textPrimary: '#fefae0',
      textSecondary: '#dda15e'
    }
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    colors: {
      primary: '#0d0221',
      secondary: '#1a0b3d',
      accent: '#ff00ff',
      correct: '#00ff00',
      incorrect: '#ff0000',
      textPrimary: '#ff00ff',
      textSecondary: '#8a2be2'
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      primary: '#282a36',
      secondary: '#44475a',
      accent: '#ff79c6',
      correct: '#50fa7b',
      incorrect: '#ff5555',
      textPrimary: '#f8f8f2',
      textSecondary: '#6272a4'
    }
  },
  {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      primary: '#272822',
      secondary: '#383830',
      accent: '#a6e22e',
      correct: '#a6e22e',
      incorrect: '#f92672',
      textPrimary: '#f8f8f2',
      textSecondary: '#75715e'
    }
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: {
      primary: '#2e3440',
      secondary: '#3b4252',
      accent: '#88c0d0',
      correct: '#a3be8c',
      incorrect: '#bf616a',
      textPrimary: '#eceff4',
      textSecondary: '#d8dee9'
    }
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    colors: {
      primary: '#282828',
      secondary: '#3c3836',
      accent: '#fabd2f',
      correct: '#b8bb26',
      incorrect: '#fb4934',
      textPrimary: '#ebdbb2',
      textSecondary: '#a89984'
    }
  },
  {
    id: 'terminal',
    name: 'Terminal',
    colors: {
      primary: '#000000',
      secondary: '#1a1a1a',
      accent: '#00ff00',
      correct: '#00ff00',
      incorrect: '#ff0000',
      textPrimary: '#00ff00',
      textSecondary: '#008000'
    }
  }
]

export default function SettingsPage() {
  const router = useRouter()
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    loadSavedTheme()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('monkeymax-theme')
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId)
    if (!theme) return

    const root = document.documentElement
    root.style.setProperty('--bg-primary', theme.colors.primary)
    root.style.setProperty('--bg-secondary', theme.colors.secondary)
    root.style.setProperty('--text-primary', theme.colors.textPrimary)
    root.style.setProperty('--text-secondary', theme.colors.textSecondary)
    root.style.setProperty('--accent', theme.colors.accent)
    root.style.setProperty('--correct', theme.colors.correct)
    root.style.setProperty('--incorrect', theme.colors.incorrect)
  }

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId)
    applyTheme(themeId)
    localStorage.setItem('monkeymax-theme', themeId)
  }

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="test-container flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-8 text-accent">Settings</h1>
        <p className="text-lg text-text-secondary mb-8 text-center max-w-md">
          Please log in to access settings and customize your experience.
        </p>
        <button 
          onClick={() => router.push('/login')}
          className="btn-primary text-xl px-8 py-4"
        >
          Login to Continue
        </button>
      </div>
    )
  }

  return (
    <div className="test-container p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-accent">Settings</h1>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary px-6 py-2"
          >
            Back to Home
          </button>
        </div>

        {/* Theme Selection */}
        <div className="stats-card mb-8">
          <h2 className="text-3xl font-semibold mb-6">Themes</h2>
          <p className="text-text-secondary mb-6">
            Choose from MonkeyType-inspired themes to customize your experience
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card cursor-pointer p-4 rounded-lg border-2 transition-all duration-200 bg-bg-secondary text-text-primary ${
                  currentTheme === theme.id 
                    ? 'border-accent scale-105' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <h3 className="text-lg font-semibold mb-3">{theme.name}</h3>
                
                {/* Theme Preview */}
                <div className="space-y-3">
                  <div className="text-sm text-text-primary">
                    12 + 8 = 20
                  </div>
                  <div className="text-sm text-text-secondary">
                    Problems per minute: 45
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="text-correct">✓</span>
                    <span className="text-incorrect">✗</span>
                    <span className="text-accent">MonkeyMac</span>
                  </div>
                </div>

                {currentTheme === theme.id && (
                  <div className="mt-3 text-center">
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-accent text-black">
                      ACTIVE
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test Settings Preview */}
        <div className="stats-card">
          <h2 className="text-3xl font-semibold mb-6">Test Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Default Test Configuration</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Duration:</span>
                  <span className="text-text-primary">2 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Operations:</span>
                  <span className="text-text-primary">All (+, −, ×, ÷)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Auto-advance:</span>
                  <span className="text-text-primary">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Number ranges:</span>
                  <span className="text-text-primary">Zetamac standard</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Theme Preview</h3>
              <div className="p-4 rounded-lg bg-bg-secondary">
                <div className="text-4xl font-mono text-center mb-4 text-text-primary">
                  15 × 7 = ?
                </div>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-text-secondary">Time: 1:45</span>
                  <span className="text-correct">Score: 23</span>
                  <span className="text-text-secondary">Problems: 25</span>
                </div>
                <div className="flex justify-center gap-1 mt-4">
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                  <div className="w-3 h-3 rounded-full bg-incorrect"></div>
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                  <div className="w-3 h-3 rounded-full bg-correct"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
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
                  <button 
                    onClick={() => router.push('/test')}
                    className="w-full btn-primary py-2"
                  >
                    Take Math Test
                  </button>
                  <button 
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' })
                        .then(() => router.push('/'))
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
