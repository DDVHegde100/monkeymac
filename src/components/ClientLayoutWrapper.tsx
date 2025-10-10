'use client'

import { ThemeProvider } from '../contexts/ThemeContext'
import PerformanceMonitor, { MobileOptimizations, MobileCSS } from './PerformanceMonitor'
import KeyboardShortcuts, { AdvancedFocusMode } from './KeyboardShortcuts'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MobileCSS />
      <MobileOptimizations />
      <AdvancedFocusMode />
      {children}
      <PerformanceMonitor />
      <KeyboardShortcuts />
    </ThemeProvider>
  )
}
