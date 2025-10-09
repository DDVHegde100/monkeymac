'use client'

import type { Metadata } from 'next'
import './globals.css'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { useRouter, usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
    loadSavedTheme()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedTheme = () => {
    const savedTheme = localStorage.getItem('monkeymax-theme')
    if (savedTheme) {
      applyTheme(savedTheme)
    }
  }

  const applyTheme = (themeId: string) => {
    const themes: Record<string, any> = {
      'dark': {
        primary: '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#ffd700',
        correct: '#00ff00',
        incorrect: '#ff0000',
        textPrimary: '#ffffff',
        textSecondary: '#b8b8b8'
      },
      'light': {
        primary: '#ffffff',
        secondary: '#f5f5f5',
        accent: '#0066cc',
        correct: '#00aa00',
        incorrect: '#cc0000',
        textPrimary: '#000000',
        textSecondary: '#666666'
      },
      'serika': {
        primary: '#323437',
        secondary: '#2c2e31',
        accent: '#e2b714',
        correct: '#00ff00',
        incorrect: '#ff0000',
        textPrimary: '#d1d0c5',
        textSecondary: '#646669'
      }
    }

    const theme = themes[themeId] || themes['dark']
    const root = document.documentElement
    root.style.setProperty('--bg-primary', theme.primary)
    root.style.setProperty('--bg-secondary', theme.secondary)
    root.style.setProperty('--text-primary', theme.textPrimary)
    root.style.setProperty('--text-secondary', theme.textSecondary)
    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--correct', theme.correct)
    root.style.setProperty('--incorrect', theme.incorrect)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Don't show navbar on login/register pages
  const hideNavbar = ['/login', '/register'].includes(pathname)

  return (
    <html lang="en">
      <head>
        <title>MonkeyMac - Mental Math Training</title>
        <meta name="description" content="Practice mental math with style - inspired by MonkeyType" />
      </head>
      <body className="bg-bg-primary text-text-primary">
        {!hideNavbar && (
          <Navbar user={user} onLogout={handleLogout} />
        )}
        <main className={hideNavbar ? '' : 'pt-0'}>
          {children}
        </main>
      </body>
    </html>
  )
}
