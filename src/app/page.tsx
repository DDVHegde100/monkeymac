'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import SmartDashboard from '../components/SmartDashboard'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Not authenticated, redirect to test page
          router.replace('/test')
          return
        }
      } catch (error) {
        // Error checking auth, redirect to test page
        router.replace('/test')
        return
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="text-xl text-sub">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-sub">
            Here's your personalized mental math training dashboard
          </p>
        </div>
        
        <SmartDashboard />
      </div>
    </div>
  )
}
