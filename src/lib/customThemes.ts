import type { Theme, ThemeColors } from '../config/types'
import { THEMES, DEFAULT_THEME_ID } from '../config/themes'

export function getAllThemes(customThemes: Theme[] = []): Theme[] {
  return [...THEMES, ...customThemes]
}

export function resolveTheme(themeId: string, customThemes: Theme[] = []): Theme | undefined {
  return customThemes.find((theme) => theme.id === themeId) || THEMES.find((theme) => theme.id === themeId)
}

export function createCustomTheme(name: string, colors: ThemeColors): Theme {
  return {
    id: `custom-${Date.now().toString(36)}`,
    name: name.trim() || 'Custom Theme',
    colors,
    custom: true,
  }
}

export function buildThemeFromBase(baseThemeId: string, overrides: Partial<ThemeColors>, customThemes: Theme[] = []): ThemeColors {
  const base = resolveTheme(baseThemeId, customThemes) || resolveTheme(DEFAULT_THEME_ID, customThemes)
  const fallback = base?.colors ?? THEMES[0].colors

  return {
    primary: overrides.primary ?? fallback.primary,
    secondary: overrides.secondary ?? fallback.secondary,
    accent: overrides.accent ?? fallback.accent,
    correct: overrides.correct ?? fallback.correct,
    incorrect: overrides.incorrect ?? fallback.incorrect,
    textPrimary: overrides.textPrimary ?? fallback.textPrimary,
    textSecondary: overrides.textSecondary ?? fallback.textSecondary,
  }
}

export function deleteCustomTheme(customThemes: Theme[], themeId: string): Theme[] {
  return customThemes.filter((theme) => theme.id !== themeId)
}
