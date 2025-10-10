'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Check for success message from registration
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccess(message)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/test')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden bg-accent/10 border border-accent/20">
            <img 
              src="/monk.png" 
              alt="MonkeyMac Logo" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h1 className="text-4xl font-bold text-accent mb-2">Welcome Back</h1>
          <p className="text-text-secondary">Ready to boost your math skills?</p>
        </div>

        <div className="bg-bg-secondary rounded-xl p-8 border border-gray-600 shadow-xl">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-gray-600 rounded-md text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-bg-secondary border border-gray-600 rounded-md text-text-primary focus:outline-none focus:border-accent"
              required
            />
          </div>

          {success && (
            <div className="text-green-400 text-sm text-center p-3 bg-green-500/10 border border-green-500/20 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center p-3 bg-red-500/10 border border-red-500/20 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Register here
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}
