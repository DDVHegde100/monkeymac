'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Shortcut {
  key: string
  description: string
  action: () => void
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

export default function KeyboardShortcuts() {
  const [isVisible, setIsVisible] = useState(false)
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const router = useRouter()

  useEffect(() => {
    // Define all keyboard shortcuts
    const shortcutDefinitions: Shortcut[] = [
      {
        key: 'Enter',
        description: 'Start/Submit test',
        action: () => {
          const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
          const startButton = document.querySelector('.start-test-button') as HTMLButtonElement
          if (submitButton) submitButton.click()
          else if (startButton) startButton.click()
        }
      },
      {
        key: 'Tab',
        description: 'Quick restart test',
        action: () => {
          const restartButton = document.querySelector('.restart-button') as HTMLButtonElement
          if (restartButton) restartButton.click()
        }
      },
      {
        key: 'Escape',
        description: 'Stop current test',
        action: () => {
          const stopButton = document.querySelector('.stop-button') as HTMLButtonElement
          if (stopButton) stopButton.click()
        }
      },
      {
        key: 'h',
        ctrlKey: true,
        description: 'Go to Home',
        action: () => router.push('/')
      },
      {
        key: 't',
        ctrlKey: true,
        description: 'Go to Test',
        action: () => router.push('/test')
      },
      {
        key: 's',
        ctrlKey: true,
        description: 'Go to Stats',
        action: () => router.push('/stats')
      },
      {
        key: 'a',
        ctrlKey: true,
        description: 'Go to Analytics',
        action: () => router.push('/analytics')
      },
      {
        key: 'l',
        ctrlKey: true,
        description: 'Go to Leaderboards',
        action: () => router.push('/leaderboards')
      },
      {
        key: '1',
        description: 'Set difficulty to Easy',
        action: () => setDifficulty('easy')
      },
      {
        key: '2',
        description: 'Set difficulty to Medium',
        action: () => setDifficulty('medium')
      },
      {
        key: '3',
        description: 'Set difficulty to Hard',
        action: () => setDifficulty('hard')
      },
      {
        key: '4',
        description: 'Set difficulty to Abstract',
        action: () => setDifficulty('abstract')
      },
      {
        key: 'f',
        ctrlKey: true,
        description: 'Toggle focus mode',
        action: () => toggleFocusMode()
      },
      {
        key: '/',
        description: 'Show/hide shortcuts',
        action: () => setIsVisible(!isVisible)
      }
    ]

    setShortcuts(shortcutDefinitions)

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      for (const shortcut of shortcutDefinitions) {
        const keyMatches = event.key === shortcut.key
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
        const altMatches = !!shortcut.altKey === event.altKey
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey

        if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [router, isVisible])

  const setDifficulty = (difficulty: string) => {
    const difficultySelect = document.querySelector('select[name="difficulty"]') as HTMLSelectElement
    if (difficultySelect) {
      difficultySelect.value = difficulty
      difficultySelect.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  const toggleFocusMode = () => {
    document.body.classList.toggle('focus-mode')
    
    // Add focus mode styles if not already added
    if (!document.getElementById('focus-mode-styles')) {
      const style = document.createElement('style')
      style.id = 'focus-mode-styles'
      style.textContent = `
        .focus-mode {
          background: #000 !important;
        }
        .focus-mode * {
          background: transparent !important;
          border-color: #333 !important;
        }
        .focus-mode .test-container {
          background: #111 !important;
        }
        .focus-mode .navbar {
          display: none !important;
        }
        .focus-mode .stats-sidebar {
          opacity: 0.3;
        }
      `
      document.head.appendChild(style)
    }
  }

  const formatShortcut = (shortcut: Shortcut) => {
    const parts: string[] = []
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    parts.push(shortcut.key)
    return parts.join(' + ')
  }

  return (
    <>
      {/* Shortcuts Help Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsVisible(false)}>
          <div className="bg-bg-secondary rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-sub hover:text-text text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-bg rounded border border-sub">
                  <span className="text-text">{shortcut.description}</span>
                  <kbd className="bg-bg-secondary border border-sub px-2 py-1 rounded text-sm font-mono text-main">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center text-sub text-sm">
              Press <kbd className="bg-bg border border-sub px-1 rounded font-mono">/</kbd> to toggle this panel
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-bg-secondary border border-sub text-sub hover:text-text hover:border-main p-2 rounded transition-colors text-xs"
          title="Keyboard Shortcuts (/)"
        >
          ⌨️
        </button>
      </div>
    </>
  )
}

// Advanced focus mode component
export function AdvancedFocusMode() {
  const [focusMode, setFocusMode] = useState(false)
  const [zenMode, setZenMode] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault()
        toggleZenMode()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleZenMode = () => {
    setZenMode(!zenMode)
    
    if (!zenMode) {
      // Enter zen mode
      document.body.classList.add('zen-mode')
      
      // Add zen mode styles
      if (!document.getElementById('zen-mode-styles')) {
        const style = document.createElement('style')
        style.id = 'zen-mode-styles'
        style.textContent = `
          .zen-mode {
            background: #0a0a0a !important;
          }
          .zen-mode .navbar,
          .zen-mode .sidebar,
          .zen-mode .footer,
          .zen-mode .stats-sidebar {
            display: none !important;
          }
          .zen-mode .test-container {
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: transparent !important;
          }
          .zen-mode .test-content {
            text-align: center !important;
            max-width: 800px !important;
          }
          .zen-mode * {
            border-color: #222 !important;
          }
          .zen-mode .performance-monitor {
            display: none !important;
          }
        `
        document.head.appendChild(style)
      }
    } else {
      // Exit zen mode
      document.body.classList.remove('zen-mode')
    }
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex space-x-2">
      <button
        onClick={() => setFocusMode(!focusMode)}
        className={`px-3 py-1 rounded text-xs transition-colors ${
          focusMode 
            ? 'bg-main text-bg' 
            : 'bg-bg-secondary border border-sub text-sub hover:text-text'
        }`}
        title="Focus Mode (Ctrl+F)"
      >
        Focus
      </button>
      
      <button
        onClick={toggleZenMode}
        className={`px-3 py-1 rounded text-xs transition-colors ${
          zenMode 
            ? 'bg-main text-bg' 
            : 'bg-bg-secondary border border-sub text-sub hover:text-text'
        }`}
        title="Zen Mode (F11)"
      >
        Zen
      </button>
    </div>
  )
}
