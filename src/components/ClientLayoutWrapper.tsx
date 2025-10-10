'use client'

import { useEffect } from 'react'
import { loadTheme } from '../utils/theme'

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load theme immediately when the app loads
    loadTheme()
  }, [])

  return <>{children}</>
}
