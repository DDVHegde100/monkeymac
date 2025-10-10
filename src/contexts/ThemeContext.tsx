'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { applyTheme } from '../utils/theme'

interface ThemeContextType {
  theme: string
  setTheme: (theme: string) => void
  font: string
  setFont: (font: string) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState('monokai')
  const [font, setFontState] = useState('JetBrains Mono')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Try to load from user preferences first
        const response = await fetch('/api/user/preferences')
        if (response.ok) {
          const data = await response.json()
          if (data.preferences?.theme) {
            setThemeState(data.preferences.theme)
            applyTheme(data.preferences.theme)
            localStorage.setItem('selectedTheme', data.preferences.theme)
          }
          if (data.preferences?.font) {
            setFontState(data.preferences.font)
            localStorage.setItem('selectedFont', data.preferences.font)
          }
        } else {
          // Fall back to localStorage for guests
          const savedTheme = localStorage.getItem('selectedTheme') || 'monokai'
          const savedFont = localStorage.getItem('selectedFont') || 'JetBrains Mono'
          setThemeState(savedTheme)
          setFontState(savedFont)
          applyTheme(savedTheme)
        }
      } catch (error) {
        // Fall back to localStorage if API fails
        const savedTheme = localStorage.getItem('selectedTheme') || 'monokai'
        const savedFont = localStorage.getItem('selectedFont') || 'JetBrains Mono'
        setThemeState(savedTheme)
        setFontState(savedFont)
        applyTheme(savedTheme)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  const setTheme = async (newTheme: string) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('selectedTheme', newTheme)

    // Try to save to backend if user is authenticated
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme, font })
      })
      if (!response.ok) {
        console.log('Failed to save theme to backend, using localStorage')
      }
    } catch (error) {
      console.log('Theme saved to localStorage only')
    }
  }

  const setFont = async (newFont: string) => {
    setFontState(newFont)
    localStorage.setItem('selectedFont', newFont)

    // Try to save to backend if user is authenticated
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, font: newFont })
      })
      if (!response.ok) {
        console.log('Failed to save font to backend, using localStorage')
      }
    } catch (error) {
      console.log('Font saved to localStorage only')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}
