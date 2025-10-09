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
  // Original MonkeyType inspired themes
  { id: 'dark', name: 'Dark (Default)', colors: { primary: '#1a1a1a', secondary: '#2a2a2a', accent: '#ffd700', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#b8b8b8' }},
  { id: 'light', name: 'Light', colors: { primary: '#ffffff', secondary: '#f5f5f5', accent: '#0066cc', correct: '#00aa00', incorrect: '#cc0000', textPrimary: '#000000', textSecondary: '#666666' }},
  { id: 'serika', name: 'Serika', colors: { primary: '#323437', secondary: '#2c2e31', accent: '#e2b714', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#d1d0c5', textSecondary: '#646669' }},
  { id: 'metropolis', name: 'Metropolis', colors: { primary: '#1e1e1e', secondary: '#2d2d2d', accent: '#fc7753', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#a0a0a0' }},
  { id: 'laser', name: 'Laser', colors: { primary: '#031926', secondary: '#0b2137', accent: '#00ff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#7dd3fc' }},
  { id: 'botanical', name: 'Botanical', colors: { primary: '#283618', secondary: '#1a2409', accent: '#bc6c25', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#fefae0', textSecondary: '#dda15e' }},
  { id: 'vaporwave', name: 'Vaporwave', colors: { primary: '#0d0221', secondary: '#1a0b3d', accent: '#ff00ff', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ff00ff', textSecondary: '#8a2be2' }},
  { id: 'dracula', name: 'Dracula', colors: { primary: '#282a36', secondary: '#44475a', accent: '#ff79c6', correct: '#50fa7b', incorrect: '#ff5555', textPrimary: '#f8f8f2', textSecondary: '#6272a4' }},
  { id: 'monokai', name: 'Monokai', colors: { primary: '#272822', secondary: '#383830', accent: '#a6e22e', correct: '#a6e22e', incorrect: '#f92672', textPrimary: '#f8f8f2', textSecondary: '#75715e' }},
  { id: 'nord', name: 'Nord', colors: { primary: '#2e3440', secondary: '#3b4252', accent: '#88c0d0', correct: '#a3be8c', incorrect: '#bf616a', textPrimary: '#eceff4', textSecondary: '#d8dee9' }},
  { id: 'gruvbox', name: 'Gruvbox', colors: { primary: '#282828', secondary: '#3c3836', accent: '#fabd2f', correct: '#b8bb26', incorrect: '#fb4934', textPrimary: '#ebdbb2', textSecondary: '#a89984' }},
  { id: 'terminal', name: 'Terminal', colors: { primary: '#000000', secondary: '#1a1a1a', accent: '#00ff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#00ff00', textSecondary: '#008000' }},
  
  // Extended color palette
  { id: 'ocean', name: 'Ocean', colors: { primary: '#0f172a', secondary: '#1e293b', accent: '#06b6d4', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#f1f5f9', textSecondary: '#64748b' }},
  { id: 'sunset', name: 'Sunset', colors: { primary: '#7c2d12', secondary: '#9a3412', accent: '#fb923c', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#fed7aa', textSecondary: '#fdba74' }},
  { id: 'forest', name: 'Forest', colors: { primary: '#052e16', secondary: '#166534', accent: '#4ade80', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#bbf7d0', textSecondary: '#86efac' }},
  { id: 'cherry', name: 'Cherry', colors: { primary: '#4c0519', secondary: '#7f1d3e', accent: '#f43f5e', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#fecaca', textSecondary: '#f87171' }},
  { id: 'grape', name: 'Grape', colors: { primary: '#2e1065', secondary: '#4c1d95', accent: '#8b5cf6', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#ddd6fe', textSecondary: '#c4b5fd' }},
  { id: 'mint', name: 'Mint', colors: { primary: '#022c22', secondary: '#065f46', accent: '#34d399', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#a7f3d0', textSecondary: '#6ee7b7' }},
  { id: 'coral', name: 'Coral', colors: { primary: '#7c2d12', secondary: '#c2410c', accent: '#ff7849', correct: '#10b981', incorrect: '#dc2626', textPrimary: '#fed7aa', textSecondary: '#fdba74' }},
  { id: 'slate', name: 'Slate', colors: { primary: '#0f172a', secondary: '#334155', accent: '#64748b', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#f1f5f9', textSecondary: '#94a3b8' }},
  { id: 'amber', name: 'Amber', colors: { primary: '#451a03', secondary: '#78350f', accent: '#f59e0b', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#fef3c7', textSecondary: '#fcd34d' }},
  
  // Neon themes
  { id: 'neon-blue', name: 'Neon Blue', colors: { primary: '#0a0a0a', secondary: '#1a1a2e', accent: '#00ffff', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#00ffff', textSecondary: '#0077ff' }},
  { id: 'neon-pink', name: 'Neon Pink', colors: { primary: '#0a0a0a', secondary: '#2a0a2a', accent: '#ff0080', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#ff0080', textSecondary: '#ff40a0' }},
  { id: 'neon-green', name: 'Neon Green', colors: { primary: '#0a0a0a', secondary: '#0a2a0a', accent: '#00ff40', correct: '#00ff80', incorrect: '#ff0040', textPrimary: '#00ff40', textSecondary: '#80ff80' }},
  { id: 'neon-purple', name: 'Neon Purple', colors: { primary: '#0a0a0a', secondary: '#1a0a2a', accent: '#8000ff', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#8000ff', textSecondary: '#a040ff' }},
  { id: 'neon-orange', name: 'Neon Orange', colors: { primary: '#0a0a0a', secondary: '#2a1a0a', accent: '#ff8000', correct: '#00ff00', incorrect: '#ff0040', textPrimary: '#ff8000', textSecondary: '#ffa040' }},
  
  // Pastel themes
  { id: 'pastel-pink', name: 'Pastel Pink', colors: { primary: '#fdf2f8', secondary: '#fce7f3', accent: '#ec4899', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#831843', textSecondary: '#be185d' }},
  { id: 'pastel-blue', name: 'Pastel Blue', colors: { primary: '#eff6ff', secondary: '#dbeafe', accent: '#3b82f6', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#1e40af', textSecondary: '#3b82f6' }},
  { id: 'pastel-green', name: 'Pastel Green', colors: { primary: '#f0fdf4', secondary: '#dcfce7', accent: '#22c55e', correct: '#16a34a', incorrect: '#ef4444', textPrimary: '#166534', textSecondary: '#22c55e' }},
  { id: 'pastel-purple', name: 'Pastel Purple', colors: { primary: '#faf5ff', secondary: '#f3e8ff', accent: '#a855f7', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#6b21a8', textSecondary: '#9333ea' }},
  { id: 'pastel-yellow', name: 'Pastel Yellow', colors: { primary: '#fefce8', secondary: '#fef3c7', accent: '#eab308', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#a16207', textSecondary: '#ca8a04' }},
  
  // Cyberpunk themes
  { id: 'cyberpunk', name: 'Cyberpunk', colors: { primary: '#0d1117', secondary: '#21262d', accent: '#ff007f', correct: '#00ff41', incorrect: '#ff0040', textPrimary: '#00ffff', textSecondary: '#7c3aed' }},
  { id: 'matrix', name: 'Matrix', colors: { primary: '#000000', secondary: '#001100', accent: '#00ff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#00ff00', textSecondary: '#008800' }},
  { id: 'synthwave', name: 'Synthwave', colors: { primary: '#1a0933', secondary: '#2d1b69', accent: '#ff006e', correct: '#00f5ff', incorrect: '#ff0040', textPrimary: '#f72585', textSecondary: '#7209b7' }},
  { id: 'retrowave', name: 'Retrowave', colors: { primary: '#240046', secondary: '#3c096c', accent: '#ff0080', correct: '#00ffff', incorrect: '#ff4000', textPrimary: '#ff006e', textSecondary: '#c77dff' }},
  { id: 'outrun', name: 'Outrun', colors: { primary: '#0f0f23', secondary: '#1a1a3e', accent: '#fc1460', correct: '#0abdc6', incorrect: '#ff4000', textPrimary: '#fc1460', textSecondary: '#0abdc6' }},
  
  // Nature themes
  { id: 'sunrise', name: 'Sunrise', colors: { primary: '#451a03', secondary: '#7c2d12', accent: '#fb923c', correct: '#22c55e', incorrect: '#dc2626', textPrimary: '#fed7aa', textSecondary: '#fbbf24' }},
  { id: 'aurora', name: 'Aurora', colors: { primary: '#0c4a6e', secondary: '#075985', accent: '#38bdf8', correct: '#34d399', incorrect: '#f87171', textPrimary: '#bae6fd', textSecondary: '#7dd3fc' }},
  { id: 'volcano', name: 'Volcano', colors: { primary: '#7c1d1d', secondary: '#991b1b', accent: '#ef4444', correct: '#22c55e', incorrect: '#b91c1c', textPrimary: '#fecaca', textSecondary: '#f87171' }},
  { id: 'desert', name: 'Desert', colors: { primary: '#78350f', secondary: '#92400e', accent: '#f59e0b', correct: '#10b981', incorrect: '#dc2626', textPrimary: '#fcd34d', textSecondary: '#f59e0b' }},
  { id: 'glacial', name: 'Glacial', colors: { primary: '#164e63', secondary: '#0e7490', accent: '#06b6d4', correct: '#10b981', incorrect: '#ef4444', textPrimary: '#a5f3fc', textSecondary: '#67e8f9' }},
  
  // Vintage themes
  { id: 'sepia', name: 'Sepia', colors: { primary: '#3f2f1f', secondary: '#5d4037', accent: '#d4af37', correct: '#8bc34a', incorrect: '#d32f2f', textPrimary: '#f5e6d3', textSecondary: '#d7b899' }},
  { id: 'typewriter', name: 'Typewriter', colors: { primary: '#2e2e2e', secondary: '#3e3e3e', accent: '#c9b037', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#e0e0e0', textSecondary: '#b0b0b0' }},
  { id: 'parchment', name: 'Parchment', colors: { primary: '#f5f5dc', secondary: '#f0e68c', accent: '#8b4513', correct: '#228b22', incorrect: '#dc143c', textPrimary: '#2f1b14', textSecondary: '#8b4513' }},
  { id: 'newspaper', name: 'Newspaper', colors: { primary: '#f8f8f8', secondary: '#e8e8e8', accent: '#000080', correct: '#008000', incorrect: '#800000', textPrimary: '#1a1a1a', textSecondary: '#666666' }},
  
  // Minimal themes
  { id: 'minimal-dark', name: 'Minimal Dark', colors: { primary: '#111111', secondary: '#222222', accent: '#ffffff', correct: '#888888', incorrect: '#444444', textPrimary: '#ffffff', textSecondary: '#888888' }},
  { id: 'minimal-light', name: 'Minimal Light', colors: { primary: '#ffffff', secondary: '#f0f0f0', accent: '#000000', correct: '#666666', incorrect: '#999999', textPrimary: '#000000', textSecondary: '#666666' }},
  { id: 'monochrome', name: 'Monochrome', colors: { primary: '#1a1a1a', secondary: '#2a2a2a', accent: '#ffffff', correct: '#cccccc', incorrect: '#666666', textPrimary: '#ffffff', textSecondary: '#999999' }},
  
  // Colorful themes
  { id: 'rainbow', name: 'Rainbow', colors: { primary: '#1a1a2e', secondary: '#16213e', accent: '#ff6b6b', correct: '#4ecdc4', incorrect: '#ff9ff3', textPrimary: '#f7dc6f', textSecondary: '#bb8fce' }},
  { id: 'galaxy', name: 'Galaxy', colors: { primary: '#0f0f23', secondary: '#1a1a3e', accent: '#c39bd3', correct: '#85c1e9', incorrect: '#f1948a', textPrimary: '#f8c471', textSecondary: '#a569bd' }},
  { id: 'tropical', name: 'Tropical', colors: { primary: '#004d40', secondary: '#00695c', accent: '#ff5722', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#80cbc4', textSecondary: '#4db6ac' }},
  { id: 'autumn', name: 'Autumn', colors: { primary: '#3e2723', secondary: '#5d4037', accent: '#ff9800', correct: '#8bc34a', incorrect: '#d32f2f', textPrimary: '#ffcc02', textSecondary: '#ff8f00' }},
  { id: 'spring', name: 'Spring', colors: { primary: '#1b5e20', secondary: '#2e7d32', accent: '#cddc39', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#c8e6c9', textSecondary: '#a5d6a7' }},
  
  // Tech themes
  { id: 'vscode', name: 'VS Code', colors: { primary: '#1e1e1e', secondary: '#2d2d30', accent: '#007acc', correct: '#4ec9b0', incorrect: '#f14c4c', textPrimary: '#cccccc', textSecondary: '#969696' }},
  { id: 'sublime', name: 'Sublime', colors: { primary: '#263238', secondary: '#37474f', accent: '#ff9800', correct: '#4caf50', incorrect: '#f44336', textPrimary: '#ffffff', textSecondary: '#90a4ae' }},
  { id: 'atom', name: 'Atom', colors: { primary: '#1d1f21', secondary: '#2d2f31', accent: '#55b5db', correct: '#90c695', incorrect: '#cc6666', textPrimary: '#c5c8c6', textSecondary: '#969896' }},
  { id: 'github', name: 'GitHub', colors: { primary: '#0d1117', secondary: '#21262d', accent: '#f78166', correct: '#56d364', incorrect: '#f85149', textPrimary: '#f0f6fc', textSecondary: '#8b949e' }},
  
  // Game themes
  { id: 'mario', name: 'Mario', colors: { primary: '#0066cc', secondary: '#0052a3', accent: '#ff0000', correct: '#00cc00', incorrect: '#cc0000', textPrimary: '#ffffff', textSecondary: '#ccddff' }},
  { id: 'zelda', name: 'Zelda', colors: { primary: '#2d5016', secondary: '#3a6b1c', accent: '#ffd700', correct: '#00cc00', incorrect: '#cc0000', textPrimary: '#ffffff', textSecondary: '#ccffcc' }},
  { id: 'sonic', name: 'Sonic', colors: { primary: '#0066ff', secondary: '#0052cc', accent: '#ffcc00', correct: '#00cc00', incorrect: '#cc0000', textPrimary: '#ffffff', textSecondary: '#ccddff' }},
  
  // High contrast themes
  { id: 'high-contrast', name: 'High Contrast', colors: { primary: '#000000', secondary: '#1a1a1a', accent: '#ffff00', correct: '#00ff00', incorrect: '#ff0000', textPrimary: '#ffffff', textSecondary: '#cccccc' }},
  { id: 'inverted', name: 'Inverted', colors: { primary: '#ffffff', secondary: '#e5e5e5', accent: '#0000ff', correct: '#008000', incorrect: '#800000', textPrimary: '#000000', textSecondary: '#333333' }},
  
  // Themed colors
  { id: 'ocean-deep', name: 'Ocean Deep', colors: { primary: '#001122', secondary: '#002244', accent: '#00aaff', correct: '#00ffaa', incorrect: '#ff4400', textPrimary: '#aaeeff', textSecondary: '#66ccee' }},
  { id: 'fire-red', name: 'Fire Red', colors: { primary: '#220000', secondary: '#440000', accent: '#ff4400', correct: '#00ff44', incorrect: '#aa0000', textPrimary: '#ffaaaa', textSecondary: '#ee6666' }},
  { id: 'electric-blue', name: 'Electric Blue', colors: { primary: '#000022', secondary: '#000044', accent: '#4400ff', correct: '#44ff00', incorrect: '#ff0044', textPrimary: '#aaaaff', textSecondary: '#6666ee' }},
  { id: 'toxic-green', name: 'Toxic Green', colors: { primary: '#002200', secondary: '#004400', accent: '#44ff00', correct: '#00ff44', incorrect: '#ff0044', textPrimary: '#aaffaa', textSecondary: '#66ee66' }},
  
  // More creative themes
  { id: 'cotton-candy', name: 'Cotton Candy', colors: { primary: '#ffb3d9', secondary: '#ff99cc', accent: '#ff66b3', correct: '#66ff99', incorrect: '#ff6666', textPrimary: '#660033', textSecondary: '#990066' }},
  { id: 'midnight-oil', name: 'Midnight Oil', colors: { primary: '#0d1020', secondary: '#1a2040', accent: '#ffa500', correct: '#32cd32', incorrect: '#dc143c', textPrimary: '#f0f8ff', textSecondary: '#b0c4de' }},
  { id: 'golden-hour', name: 'Golden Hour', colors: { primary: '#2c1810', secondary: '#4a2c18', accent: '#ffa500', correct: '#32cd32', incorrect: '#dc143c', textPrimary: '#ffd700', textSecondary: '#daa520' }},
  { id: 'lavender-mist', name: 'Lavender Mist', colors: { primary: '#e6e6fa', secondary: '#dda0dd', accent: '#9370db', correct: '#32cd32', incorrect: '#dc143c', textPrimary: '#4b0082', textSecondary: '#663399' }}
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 bg-bg-secondary ${
                  currentTheme === theme.id 
                    ? 'border-accent scale-105' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <h3 className="text-xs font-semibold mb-2 truncate text-text-primary">
                  {theme.name}
                </h3>
                
                {/* Color Palette Preview - simplified without inline styles */}
                <div className="flex gap-1 mb-2 justify-center">
                  <div className="w-3 h-3 rounded-full bg-bg-primary border border-gray-400" />
                  <div className="w-3 h-3 rounded-full bg-bg-secondary border border-gray-400" />
                  <div className="w-3 h-3 rounded-full bg-accent border border-gray-400" />
                  <div className="w-3 h-3 rounded-full bg-correct border border-gray-400" />
                  <div className="w-3 h-3 rounded-full bg-incorrect border border-gray-400" />
                </div>

                {/* Mini Preview */}
                <div className="text-xs space-y-1 text-center">
                  <div className="text-text-primary">8+5=13</div>
                  <div className="flex gap-2 items-center justify-center">
                    <span className="text-correct">✓</span>
                    <span className="text-incorrect">✗</span>
                    <span className="text-accent">Mac</span>
                  </div>
                </div>

                {currentTheme === theme.id && (
                  <div className="mt-2 text-center">
                    <div className="text-xs font-bold px-2 py-1 rounded-full bg-accent text-black">
                      ACTIVE
                    </div>
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
