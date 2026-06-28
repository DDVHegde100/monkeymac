'use client'

import { useMemo, useState } from 'react'
import type { Theme, ThemeColors, UserPreferences } from '../config/types'
import { buildThemeFromBase, createCustomTheme } from '../lib/customThemes'
import { resolveTheme } from '../lib/customThemes'

const COLOR_FIELDS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'primary', label: 'Background' },
  { key: 'secondary', label: 'Surface' },
  { key: 'accent', label: 'Accent' },
  { key: 'textPrimary', label: 'Text' },
  { key: 'textSecondary', label: 'Muted text' },
  { key: 'correct', label: 'Correct' },
  { key: 'incorrect', label: 'Incorrect' },
]

interface CustomThemeBuilderProps {
  preferences: UserPreferences
  onSave: (update: Partial<UserPreferences>) => Promise<void>
}

export default function CustomThemeBuilder({ preferences, onSave }: CustomThemeBuilderProps) {
  const baseTheme = resolveTheme(preferences.theme, preferences.customThemes)
  const [name, setName] = useState('My Theme')
  const [colors, setColors] = useState<ThemeColors>(
    baseTheme?.colors ?? buildThemeFromBase('dark', {}, preferences.customThemes)
  )

  const previewTheme = useMemo(
    () => ({ id: 'preview', name, colors, custom: true as const }),
    [name, colors]
  )

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors((current) => ({ ...current, [key]: value }))
  }

  const resetFromCurrent = () => {
    const source = resolveTheme(preferences.theme, preferences.customThemes)
    if (source) {
      setColors(source.colors)
      setName(`${source.name} Custom`)
    }
  }

  const handleSave = async () => {
    const theme = createCustomTheme(name, colors)
    const customThemes = [...preferences.customThemes, theme]
    await onSave({ customThemes, theme: theme.id })
  }

  const handleDelete = async (themeId: string) => {
    const customThemes = preferences.customThemes.filter((theme) => theme.id !== themeId)
    const nextTheme = preferences.theme === themeId ? 'dark' : preferences.theme
    await onSave({ customThemes, theme: nextTheme })
  }

  return (
    <div className="stats-card mb-8">
      <h2 className="text-3xl font-semibold mb-2">Custom Theme Builder</h2>
      <p className="text-text-secondary mb-6">
        Pick your own colors. Custom themes save to your profile when logged in.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary mb-2">Theme name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-bg-primary border border-gray-600 rounded px-3 py-2 text-text-primary"
              maxLength={32}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLOR_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-text-secondary text-sm mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-10 w-12 rounded cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="flex-1 bg-bg-primary border border-gray-600 rounded px-2 py-1 text-sm text-text-primary font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" onClick={resetFromCurrent} className="btn-secondary py-2 px-4">
              Start from current theme
            </button>
            <button type="button" onClick={handleSave} className="btn-primary py-2 px-4">
              Save custom theme
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Preview</h3>
          <div
            className="rounded-lg p-6 border border-gray-700"
            style={{ backgroundColor: previewTheme.colors.primary, color: previewTheme.colors.textPrimary }}
          >
            <div className="text-sm mb-4" style={{ color: previewTheme.colors.textSecondary }}>
              MonkeyMac · {previewTheme.name}
            </div>
            <div className="text-4xl font-mono text-center mb-4">47 + 28 = ?</div>
            <div className="flex justify-center gap-4 text-sm">
              <span style={{ color: previewTheme.colors.accent }}>Time: 1:42</span>
              <span style={{ color: previewTheme.colors.correct }}>Score: 31</span>
              <span style={{ color: previewTheme.colors.incorrect }}>Miss</span>
            </div>
          </div>
        </div>
      </div>

      {preferences.customThemes.length > 0 && (
        <div className="mt-8 border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold mb-4">Your custom themes</h3>
          <div className="theme-grid">
            {preferences.customThemes.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${preferences.theme === theme.id ? 'selected' : ''}`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => onSave({ theme: theme.id })}
                >
                  <div className="theme-preview" style={{ backgroundColor: theme.colors.primary }}>
                    <div className="theme-preview-accent" style={{ backgroundColor: theme.colors.accent }} />
                    <div className="theme-preview-text" style={{ color: theme.colors.textPrimary }}>
                      Aa
                    </div>
                  </div>
                  <div className="theme-name">{theme.name}</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(theme.id)}
                  className="mt-2 text-xs text-incorrect hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
