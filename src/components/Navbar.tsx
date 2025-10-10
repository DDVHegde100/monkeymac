'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  user?: any
  onLogout?: () => void
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-bg-secondary border-b border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-bold text-accent">
            MonkeyMac
          </Link>
          
          {user && (
            <div className="flex space-x-6">
              <Link 
                href="/test" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/test' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                Test
              </Link>
              <Link 
                href="/leaderboards" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/leaderboards' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                Leaderboards
              </Link>
              <Link 
                href="/settings" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/settings' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                Settings
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-text-secondary">
                Hey, {user.firstName}!
              </span>
              <button 
                onClick={onLogout}
                className="btn-secondary py-1 px-4 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <Link href="/login" className="btn-secondary py-1 px-4 text-sm">
                Login
              </Link>
              <Link href="/register" className="btn-primary py-1 px-4 text-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
