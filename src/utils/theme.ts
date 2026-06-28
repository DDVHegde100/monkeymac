export { THEMES, DEFAULT_THEME_ID } from '../config/themes'
export { FONTS, DEFAULT_FONT_ID } from '../config/fonts'
export type { Theme, Font, UserPreferences, ProblemLayout } from '../config/types'
export {
  DEFAULT_PREFERENCES,
  PROBLEM_LAYOUTS,
  applyTheme,
  applyFont,
  applyFontSize,
  applyProblemLayout,
  applyPreferences,
  loadLocalPreferences,
  saveLocalPreferences,
  mergePreferences,
  normalizePreferences,
  getFontById,
  getThemeById,
} from '../lib/preferences'

// Backward-compatible alias used by older code
export const loadTheme = async () => {
  const { loadLocalPreferences, applyPreferences } = await import('../lib/preferences')

  try {
    const response = await fetch('/api/user/preferences')
    if (response.ok) {
      const data = await response.json()
      if (data.preferences) {
        const { normalizePreferences, applyPreferences: apply } = await import('../lib/preferences')
        const prefs = normalizePreferences(data.preferences)
        apply(prefs)
        return
      }
    }
  } catch {
    // guest or offline
  }

  applyPreferences(loadLocalPreferences())
}
