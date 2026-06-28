export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  correct: string
  incorrect: string
  textPrimary: string
  textSecondary: string
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  custom?: boolean
}

export type FontCategory = 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting'

export interface Font {
  id: string
  name: string
  family: string
  category: FontCategory
}

export type ProblemLayout = 'centered' | 'compact' | 'minimal'

export interface UserPreferences {
  theme: string
  font: string
  fontSize: number
  problemLayout: ProblemLayout
  showTimer: boolean
  showRecentDots: boolean
  customThemes: Theme[]
}
