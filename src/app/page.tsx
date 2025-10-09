'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  firstName: string
  username: string
  phone: string
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
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

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })
      if (response.ok) {
        setUser(null)
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const AuthButton = () => {
    if (loading) {
      return (
        <div className="text-text-secondary">
          Loading...
        </div>
      )
    }

    if (user) {
      return (
        <div className="flex items-center space-x-4">
          <span className="text-text-primary font-medium">
            @{user.username}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      )
    }

    return (
      <div className="space-x-3">
        <Link href="/login" className="btn-secondary text-sm px-4 py-2">
          Login
        </Link>
        <Link href="/register" className="btn-primary text-sm px-4 py-2">
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="test-container min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="text-2xl font-bold text-accent">
          MonkeyMac
        </div>
        <AuthButton />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-8 main-content">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold mb-6 text-accent animate-pulse">
              🐒
            </h1>
            <h2 className="text-6xl md:text-7xl font-bold mb-4 text-text-primary">
              {user ? `Hey, ${user.firstName}!` : 'MonkeyMac'}
            </h2>
          </div>
          
          <p className="text-3xl md:text-4xl text-text-secondary mb-8 font-light">
            {user ? 'MonkeyMac is coming soon...' : 'is coming soon...'}
          </p>
          
          <div className="mb-12">
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
              {user 
                ? `Welcome back, ${user.firstName}! Get ready for the ultimate mental math training experience.`
                : 'Mental math training meets MonkeyType\'s sleek design. Get ready to supercharge your arithmetic skills with style.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 opacity-60">
            <div className="stats-card">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-text-secondary text-sm">Speed-based arithmetic challenges</p>
            </div>
            <div className="stats-card">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
              <p className="text-text-secondary text-sm">Detailed statistics and analytics</p>
            </div>
            <div className="stats-card">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Compete</h3>
              <p className="text-text-secondary text-sm">Leaderboards and achievements</p>
            </div>
          </div>

          <div className="mt-16 text-text-secondary">
            <p className="text-sm">
              Built with Next.js • Styled with ❤️ • Powered by Math
            </p>
            {user && (
              <p className="text-xs mt-2 opacity-50">
                Logged in as: {user.username} • Phone: {user.phone}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
