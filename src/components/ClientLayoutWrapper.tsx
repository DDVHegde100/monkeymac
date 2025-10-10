'use client'

import { ThemeProvider } from '../contexts/ThemeContext'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
