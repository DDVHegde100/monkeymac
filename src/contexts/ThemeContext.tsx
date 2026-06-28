'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { UserPreferences } from '../config/types'
import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  loadLocalPreferences,
  normalizePreferences,
  saveLocalPreferences,
} from '../lib/preferences'

interface PreferencesContextType {
  preferences: UserPreferences
  setPreferences: (update: Partial<UserPreferences>) => Promise<void>
  isLoading: boolean
  theme: string
  setTheme: (theme: string) => Promise<void>
  font: string
  setFont: (font: string) => Promise<void>
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function usePreferences() {
  return useTheme()
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/user/preferences')
        if (response.ok) {
          const data = await response.json()
          const next = normalizePreferences(data.preferences)
          setPreferencesState(next)
          applyPreferences(next)
          saveLocalPreferences(next)
          return
        }
      } catch {
        // fall back to local storage
      }

      const local = loadLocalPreferences()
      setPreferencesState(local)
      applyPreferences(local)
    }

    load().finally(() => setIsLoading(false))
  }, [])

  const persistPreferences = useCallback(async (next: UserPreferences) => {
    setPreferencesState(next)
    applyPreferences(next)
    saveLocalPreferences(next)

    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      })
    } catch {
      // local storage already updated
    }
  }, [])

  const setPreferences = useCallback(
    async (update: Partial<UserPreferences>) => {
      const next = normalizePreferences({ ...preferences, ...update })
      await persistPreferences(next)
    },
    [preferences, persistPreferences]
  )

  const setTheme = useCallback(
    async (theme: string) => setPreferences({ theme }),
    [setPreferences]
  )

  const setFont = useCallback(
    async (font: string) => setPreferences({ font }),
    [setPreferences]
  )

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setPreferences,
        isLoading,
        theme: preferences.theme,
        setTheme,
        font: preferences.font,
        setFont,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  )
}
