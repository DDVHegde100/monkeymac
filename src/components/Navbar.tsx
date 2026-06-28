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
          <Link href="/" className="flex items-center space-x-3">
            {/* Logo Image */}
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-accent/10 border border-accent/20">
              <img 
                src="/monk.png" 
                alt="MonkeyMac Logo" 
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  // Fallback to text if image doesn't load
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-full h-full bg-accent rounded-lg items-center justify-center text-bg-primary font-bold text-sm hidden">
                M
              </div>
            </div>
            <span className="text-2xl font-bold text-accent">MonkeyMac</span>
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
                href="/stats" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/stats' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                Stats
              </Link>
              <Link 
                href="/history" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/history' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                History
              </Link>
              <Link 
                href="/analytics" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/analytics' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                Analytics
              </Link>
              <Link 
                href="/search" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/search' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                Search
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
                href="/multiplayer" 
                className={`hover:text-accent transition-colors ${
                  pathname === '/multiplayer' ? 'text-accent' : 'text-text-primary'
                }`}
              >
                Multiplayer
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
          {/* GitHub Link */}
          <a 
            href="https://github.com/DDVHegde100/monkeymac" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors p-2"
            title="View source on GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>

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
