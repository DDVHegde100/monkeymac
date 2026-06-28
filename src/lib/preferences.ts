import { THEMES, DEFAULT_THEME_ID } from '../config/themes'
import { FONTS, DEFAULT_FONT_ID } from '../config/fonts'
import type { ProblemLayout, Theme, UserPreferences } from '../config/types'
import { resolveTheme } from './customThemes'

export const PREFERENCES_STORAGE_KEY = 'monkeymac-preferences'

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: DEFAULT_THEME_ID,
  font: DEFAULT_FONT_ID,
  fontSize: 3,
  problemLayout: 'centered',
  showTimer: true,
  showRecentDots: true,
  customThemes: [],
}

export const PROBLEM_LAYOUTS: { id: ProblemLayout; name: string; description: string }[] = [
  { id: 'centered', name: 'Centered', description: 'Large centered problem with full stats bar' },
  { id: 'compact', name: 'Compact', description: 'Tighter layout with inline stats' },
  { id: 'minimal', name: 'Minimal', description: 'Problem and input only — distraction-free' },
]

export function mergePreferences(partial?: Partial<UserPreferences> | null): UserPreferences {
  return {
    ...DEFAULT_PREFERENCES,
    ...partial,
    customThemes: partial?.customThemes ?? DEFAULT_PREFERENCES.customThemes,
  }
}

export function normalizePreferences(raw: Partial<UserPreferences> | null | undefined): UserPreferences {
  const merged = mergePreferences(raw)

  const legacyFontMap: Record<string, string> = {
    jetbrains: 'jetbrains-mono',
    fira: 'fira-code',
    source: 'source-code-pro',
    roboto: 'roboto-mono',
  }

  const resolvedFont = legacyFontMap[merged.font] || merged.font
  const customThemes = Array.isArray(merged.customThemes)
    ? merged.customThemes.filter((theme) => theme?.id && theme?.name && theme?.colors)
    : []
  const themeExists = Boolean(resolveTheme(merged.theme, customThemes))
  const fontExists = FONTS.some((font) => font.id === resolvedFont)
  const layoutValid = PROBLEM_LAYOUTS.some((layout) => layout.id === merged.problemLayout)

  return {
    theme: themeExists ? merged.theme : DEFAULT_PREFERENCES.theme,
    font: fontExists ? resolvedFont : DEFAULT_PREFERENCES.font,
    fontSize: clampFontSize(merged.fontSize),
    problemLayout: layoutValid ? merged.problemLayout : DEFAULT_PREFERENCES.problemLayout,
    showTimer: merged.showTimer ?? DEFAULT_PREFERENCES.showTimer,
    showRecentDots: merged.showRecentDots ?? DEFAULT_PREFERENCES.showRecentDots,
    customThemes,
  }
}

export function clampFontSize(size: number): number {
  if (Number.isNaN(size)) return DEFAULT_PREFERENCES.fontSize
  return Math.min(6, Math.max(1.5, size))
}

export function applyThemeColors(theme: Theme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.style.setProperty('--bg-primary', theme.colors.primary)
  root.style.setProperty('--bg-secondary', theme.colors.secondary)
  root.style.setProperty('--text-primary', theme.colors.textPrimary)
  root.style.setProperty('--text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--accent', theme.colors.accent)
  root.style.setProperty('--correct', theme.colors.correct)
  root.style.setProperty('--incorrect', theme.colors.incorrect)
  root.dataset.theme = theme.id
}

export function applyTheme(themeId: string, customThemes: Theme[] = []) {
  const theme = resolveTheme(themeId, customThemes)
  if (!theme) return
  applyThemeColors(theme)
}

export function applyFont(fontId: string) {
  const font = FONTS.find((item) => item.id === fontId)
  if (!font || typeof document === 'undefined') return

  document.documentElement.style.setProperty('--font-family', font.family)
}

export function applyFontSize(size: number) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--test-font-size', `${clampFontSize(size)}rem`)
}

export function applyProblemLayout(layout: ProblemLayout) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.problemLayout = layout
}

export function applyPreferences(preferences: UserPreferences) {
  applyTheme(preferences.theme, preferences.customThemes)
  applyFont(preferences.font)
  applyFontSize(preferences.fontSize)
  applyProblemLayout(preferences.problemLayout)
}

export function loadLocalPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES

  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
    if (stored) {
      return normalizePreferences(JSON.parse(stored))
    }
  } catch {
    // fall through to legacy keys
  }

  return normalizePreferences({
    theme: localStorage.getItem('monkeymax-theme') || localStorage.getItem('selectedTheme') || undefined,
    font: localStorage.getItem('monkeymax-font') || localStorage.getItem('selectedFont') || undefined,
    fontSize: parseFloat(localStorage.getItem('monkeymax-font-size') || '') || undefined,
    problemLayout: (localStorage.getItem('monkeymax-problem-layout') as ProblemLayout) || undefined,
    showTimer: localStorage.getItem('monkeymax-show-timer') !== 'false',
    showRecentDots: localStorage.getItem('monkeymax-show-dots') !== 'false',
  })
}

export function saveLocalPreferences(preferences: UserPreferences) {
  if (typeof window === 'undefined') return

  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
  localStorage.setItem('monkeymax-theme', preferences.theme)
  localStorage.setItem('selectedTheme', preferences.theme)
  localStorage.setItem('monkeymax-font', preferences.font)
  localStorage.setItem('selectedFont', preferences.font)
  localStorage.setItem('monkeymax-font-size', preferences.fontSize.toString())
  localStorage.setItem('monkeymax-problem-layout', preferences.problemLayout)
  localStorage.setItem('monkeymax-show-timer', String(preferences.showTimer))
  localStorage.setItem('monkeymax-show-dots', String(preferences.showRecentDots))
}

export function getFontById(fontId: string) {
  return FONTS.find((font) => font.id === fontId)
}

export function getThemeById(themeId: string) {
  return THEMES.find((theme) => theme.id === themeId)
}
