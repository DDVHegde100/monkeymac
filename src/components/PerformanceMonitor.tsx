'use client'

import { useState, useEffect } from 'react'

interface PerformanceData {
  totalInteractions: number
  averageLoadTime: number
  averageEngagement: number
  recentSessions: number
  performanceTrend: string
}

export default function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Track performance metrics
    const trackPerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart

        // Get device info
        const deviceInfo = {
          loadTime,
          renderTime,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          deviceType: getMobileDeviceType(),
          screenSize: `${window.screen.width}x${window.screen.height}`,
          networkType: getNetworkType(),
          userAgent: navigator.userAgent
        }

        // Send to API
        fetch('/api/user/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'performance_metrics',
            data: deviceInfo
          })
        }).catch(err => console.log('Performance tracking failed:', err))
      }
    }

    // Track user interactions
    const trackInteraction = (type: string, element: string, metadata: any = {}) => {
      fetch('/api/user/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_interaction',
          data: {
            type,
            element,
            sessionId: getSessionId(),
            metadata: {
              ...metadata,
              isMobile: isMobileDevice(),
              timestamp: Date.now()
            }
          }
        })
      }).catch(err => console.log('Interaction tracking failed:', err))
    }

    // Set up event listeners
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      trackInteraction('click', target.tagName, {
        className: target.className,
        id: target.id
      })
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      trackInteraction('keypress', 'keyboard', {
        key: e.key,
        code: e.code
      })
    }

    const handleScroll = () => {
      trackInteraction('scroll', 'window', {
        scrollY: window.scrollY,
        scrollX: window.scrollX
      })
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      trackInteraction('focus', target.tagName, {
        className: target.className,
        id: target.id
      })
    }

    // Add event listeners
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyPress)
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('focus', handleFocus, true)

    // Track performance on load
    if (document.readyState === 'complete') {
      trackPerformance()
    } else {
      window.addEventListener('load', trackPerformance)
    }

    // Load performance data
    loadPerformanceData()

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('focus', handleFocus, true)
      window.removeEventListener('load', trackPerformance)
    }
  }, [])

  const loadPerformanceData = async () => {
    try {
      const response = await fetch('/api/user/performance?metric=overview')
      if (response.ok) {
        const data = await response.json()
        setPerformanceData(data)
      }
    } catch (error) {
      console.log('Failed to load performance data:', error)
    }
  }

  const getMobileDeviceType = () => {
    const userAgent = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  }

  const getNetworkType = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    return connection?.effectiveType || 'unknown'
  }

  const isMobileDevice = () => {
    return getMobileDeviceType() !== 'desktop'
  }

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('monkeymax-session-id')
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('monkeymax-session-id', sessionId)
    }
    return sessionId
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-400'
      case 'declining': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '📊'
    }
  }

  if (!performanceData) return null

  return (
    <>
      {/* Performance Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-bg-secondary border border-sub text-text p-2 rounded-full shadow-lg hover:border-main transition-colors"
        title="Performance Monitor"
      >
        ⚡
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-40 bg-bg-secondary border border-sub rounded-lg p-4 shadow-xl max-w-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-text text-sm">Performance</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-sub hover:text-text"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-sub">Load Time:</span>
              <span className="text-text font-medium">{performanceData.averageLoadTime}ms</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sub">Engagement:</span>
              <span className="text-text font-medium">{performanceData.averageEngagement}/1.0</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sub">Interactions:</span>
              <span className="text-text font-medium">{performanceData.totalInteractions}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sub">Trend:</span>
              <span className={`font-medium ${getTrendColor(performanceData.performanceTrend)}`}>
                {getTrendIcon(performanceData.performanceTrend)} {performanceData.performanceTrend}
              </span>
            </div>
            
            <div className="pt-2 border-t border-sub">
              <div className="text-sub text-center">
                {performanceData.recentSessions} recent sessions
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Mobile-specific optimizations component
export function MobileOptimizations() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = /mobile|tablet|ipad/i.test(navigator.userAgent)
    if (!isMobile) return

    // Apply mobile-specific optimizations
    const applyMobileOptimizations = () => {
      // Disable hover effects on mobile
      document.body.classList.add('mobile-device')
      
      // Optimize touch targets
      const buttons = document.querySelectorAll('button, a, input')
      buttons.forEach(button => {
        const element = button as HTMLElement
        if (element.offsetHeight < 44) {
          element.style.minHeight = '44px'
        }
        if (element.offsetWidth < 44) {
          element.style.minWidth = '44px'
        }
      })

      // Add touch-friendly classes
      document.documentElement.classList.add('touch-device')
      
      // Optimize viewport
      const viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      }

      // Prevent zoom on input focus
      const inputs = document.querySelectorAll('input, textarea, select')
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
          }
        })
        
        input.addEventListener('blur', () => {
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes')
          }
        })
      })
    }

    // Apply optimizations
    if (document.readyState === 'complete') {
      applyMobileOptimizations()
    } else {
      window.addEventListener('load', applyMobileOptimizations)
    }

    // Save mobile settings
    fetch('/api/user/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mobile_optimization',
        data: {
          touchOptimization: true,
          fontSize: 'medium',
          buttonSize: 'large',
          gestureControls: true,
          hapticFeedback: 'vibrate' in navigator,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          devicePixelRatio: window.devicePixelRatio
        }
      })
    }).catch(err => console.log('Mobile optimization tracking failed:', err))

    return () => {
      window.removeEventListener('load', applyMobileOptimizations)
    }
  }, [])

  return null // This is a utility component with no visual output
}

// Add CSS for mobile optimizations
export const MobileCSS = () => {
  useEffect(() => {
    const css = `
      .mobile-device *:hover {
        background-color: initial !important;
      }
      
      .touch-device {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      .touch-device input,
      .touch-device textarea {
        -webkit-user-select: text;
        user-select: text;
      }
      
      @media (max-width: 768px) {
        .test-container {
          padding: 1rem;
        }
        
        .btn {
          min-height: 44px;
          min-width: 44px;
          font-size: 16px;
        }
        
        input {
          font-size: 16px;
        }
        
        .navbar {
          padding: 0.5rem 1rem;
        }
        
        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
      
      @media (max-width: 480px) {
        .text-3xl {
          font-size: 1.5rem;
        }
        
        .text-2xl {
          font-size: 1.25rem;
        }
        
        .px-6 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .py-8 {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
      }
    `

    const style = document.createElement('style')
    style.textContent = css
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}
