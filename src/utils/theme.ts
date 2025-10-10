// Theme definitions and utilities
export const THEMES = [
  {
    id: 'monokai',
    name: 'Monokai',
    colors: {
      primary: '#272822',
      secondary: '#3e3d32',
      textPrimary: '#f8f8f2',
      textSecondary: '#75715e',
      accent: '#a6e22e',
      correct: '#a6e22e',
      incorrect: '#f92672'
    }
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      primary: '#282a36',
      secondary: '#44475a',
      textPrimary: '#f8f8f2',
      textSecondary: '#6272a4',
      accent: '#bd93f9',
      correct: '#50fa7b',
      incorrect: '#ff5555'
    }
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: {
      primary: '#2e3440',
      secondary: '#3b4252',
      textPrimary: '#eceff4',
      textSecondary: '#4c566a',
      accent: '#81a1c1',
      correct: '#a3be8c',
      incorrect: '#bf616a'
    }
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox Dark',
    colors: {
      primary: '#282828',
      secondary: '#3c3836',
      textPrimary: '#ebdbb2',
      textSecondary: '#928374',
      accent: '#fabd2f',
      correct: '#b8bb26',
      incorrect: '#fb4934'
    }
  },
  {
    id: 'solarized',
    name: 'Solarized Dark',
    colors: {
      primary: '#002b36',
      secondary: '#073642',
      textPrimary: '#839496',
      textSecondary: '#586e75',
      accent: '#268bd2',
      correct: '#859900',
      incorrect: '#dc322f'
    }
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    colors: {
      primary: '#1a1b26',
      secondary: '#24283b',
      textPrimary: '#c0caf5',
      textSecondary: '#565f89',
      accent: '#7aa2f7',
      correct: '#9ece6a',
      incorrect: '#f7768e'
    }
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    colors: {
      primary: '#1e1e2e',
      secondary: '#313244',
      textPrimary: '#cdd6f4',
      textSecondary: '#6c7086',
      accent: '#cba6f7',
      correct: '#a6e3a1',
      incorrect: '#f38ba8'
    }
  },
  {
    id: 'monkeytype',
    name: 'MonkeyType',
    colors: {
      primary: '#323437',
      secondary: '#2c2e31',
      textPrimary: '#d1d0c5',
      textSecondary: '#646669',
      accent: '#e2b714',
      correct: '#e2b714',
      incorrect: '#ca4754'
    }
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    colors: {
      primary: '#0d1117',
      secondary: '#161b22',
      textPrimary: '#c9d1d9',
      textSecondary: '#8b949e',
      accent: '#58a6ff',
      correct: '#3fb950',
      incorrect: '#f85149'
    }
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    colors: {
      primary: '#282c34',
      secondary: '#21252b',
      textPrimary: '#abb2bf',
      textSecondary: '#5c6370',
      accent: '#61afef',
      correct: '#98c379',
      incorrect: '#e06c75'
    }
  }
]

export const applyTheme = (themeId: string) => {
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

export const loadTheme = async () => {
  try {
    // Try to load from user preferences first
    const response = await fetch('/api/user/preferences')
    if (response.ok) {
      const data = await response.json()
      if (data.preferences?.theme) {
        applyTheme(data.preferences.theme)
        localStorage.setItem('selectedTheme', data.preferences.theme)
        return
      }
    }
  } catch (error) {
    console.log('User not authenticated or preferences not found')
  }

  // Fall back to localStorage
  const savedTheme = localStorage.getItem('selectedTheme') || 'monokai'
  applyTheme(savedTheme)
}
