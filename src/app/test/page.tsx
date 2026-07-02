'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FONTS } from '../../config/fonts'
import { usePreferences } from '../../contexts/ThemeContext'
import type { ProblemLayout } from '../../config/types'
import { GAME_MODE_SECTIONS, getModeDisplayName } from '../../config/gameModes'
import {
  type Difficulty,
  type Operation,
  DIFFICULTY_PRESETS,
  generateProblem as createProblem,
  getDifficultyPreset,
} from '../../lib/problemGenerator'
import {
  createProblemHistory,
  recordProblemHistory,
  usesZetamacWeighting,
  type ProblemHistory,
} from '../../lib/zetamacEngine'

interface TestSettings {
  duration: number
  difficulty: Difficulty
  operations: Operation[]
  ranges: ReturnType<typeof getDifficultyPreset>['ranges']
  divisionStyle: 'reverse-multiply' | 'quotient-first'
  autoAdvance: boolean
  abstractTimeLimit?: number
}

interface Problem {
  id: string
  operation: string
  operand1: number
  operand2: number
  answer: number
  userAnswer: string
  isCorrect: boolean | null
  timeSpent: number
  timestamp: number
}

const DEFAULT_SETTINGS: TestSettings = {
  duration: DIFFICULTY_PRESETS.medium.defaultDuration,
  difficulty: 'medium',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  ranges: getDifficultyPreset('medium').ranges,
  divisionStyle: getDifficultyPreset('medium').divisionStyle,
  autoAdvance: true,
}

export default function MathTest() {
  const router = useRouter()
  const { preferences, setPreferences } = usePreferences()
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [testState, setTestState] = useState<'setup' | 'testing' | 'finished'>('setup')
  const [settings, setSettings] = useState<TestSettings>(DEFAULT_SETTINGS)
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [userInput, setUserInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(120)
  const [problemStartTime, setProblemStartTime] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [abstractModeTimer, setAbstractModeTimer] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [restartCount, setRestartCount] = useState(0)
  const [tabPressed, setTabPressed] = useState(false)
  const [showAppearance, setShowAppearance] = useState(false)
  const [inputFlash, setInputFlash] = useState<'correct' | 'incorrect' | null>(null)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const problemHistoryRef = useRef<ProblemHistory>(createProblemHistory())
  const testStartTimeRef = useRef(0)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Re-check auth status when user returns to the page/tab
  useEffect(() => {
    const handleFocus = () => {
      if (!isAuthenticated) {
        // Add a small delay to allow for navigation to complete
        setTimeout(() => {
          checkAuthStatus()
        }, 100)
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && !isAuthenticated) {
        setTimeout(() => {
          checkAuthStatus()
        }, 100)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated])

  // Also re-check auth periodically when not authenticated (for better UX)
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      const interval = setInterval(() => {
        checkAuthStatus()
      }, 2000) // Check every 2 seconds

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, loading])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Tab+Enter for quick restart (like MonkeyType)
      if (e.key === 'Tab' && testState === 'testing') {
        e.preventDefault()
        setTabPressed(true)
        return
      }
      if (e.key === 'Enter' && tabPressed && testState === 'testing') {
        e.preventDefault()
        restartTest()
        setTabPressed(false)
        return
      }
      // Reset tab state on other keys
      if (e.key !== 'Tab') {
        setTabPressed(false)
      }
      
      // Restart shortcut: Ctrl+R or Cmd+R (during testing only)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && testState === 'testing') {
        e.preventDefault()
        restartTest()
      }
      // Escape to restart during testing
      if (e.key === 'Escape' && testState === 'testing') {
        restartTest()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyPress)
    return () => document.removeEventListener('keydown', handleGlobalKeyPress)
  }, [testState]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const setDifficulty = (difficulty: Difficulty) => {
    const preset = getDifficultyPreset(difficulty)
    setSettings((prev) => ({
      ...prev,
      difficulty,
      ranges: preset.ranges,
      divisionStyle: preset.divisionStyle,
      duration: preset.lockDuration ?? preset.defaultDuration,
      operations: preset.lockOperations
        ? (['addition', 'subtraction', 'multiplication', 'division'] as Operation[])
        : prev.operations,
      abstractTimeLimit: preset.abstractTimeLimit,
    }))
  }

  const activePreset = getDifficultyPreset(settings.difficulty)

  const triggerInputFlash = (type: 'correct' | 'incorrect') => {
    setInputFlash(type)
    window.setTimeout(() => setInputFlash(null), 220)
  }

  const generateProblem = useCallback((): Problem => {
    const weighted = usesZetamacWeighting(settings.difficulty)
    const generated = createProblem({
      operations: settings.operations,
      ranges: settings.ranges,
      divisionStyle: settings.divisionStyle,
      zetamacWeighted: weighted,
      history: weighted ? problemHistoryRef.current : undefined,
    })

    if (weighted) {
      recordProblemHistory(problemHistoryRef.current, generated)
    }

    return {
      ...generated,
      userAnswer: '',
      isCorrect: null,
      timeSpent: 0,
      timestamp: Date.now(),
    }
  }, [settings])

  const startTest = () => {
    problemHistoryRef.current = createProblemHistory()
    setTestState('testing')
    setTimeLeft(settings.duration)
    setProblems([])
    setUserInput('')
    testStartTimeRef.current = Date.now()
    
    const firstProblem = generateProblem()
    setCurrentProblem(firstProblem)
    setProblemStartTime(Date.now())
    
    // Abstract mode: auto-generate new problem after time limit
    if (settings.difficulty === 'abstract' && settings.abstractTimeLimit) {
      setAbstractModeTimer(settings.abstractTimeLimit)
    }
  }

  const restartTest = () => {
    // If there are problems solved, confirm restart
    if (problems.length > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to restart? You'll lose your current progress (${problems.length} problems solved).`
      )
      if (!confirmed) return
    }
    
    setRestartCount(prev => prev + 1)
    startTest()
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (testState === 'testing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [testState, timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  // Abstract mode timer effect
  useEffect(() => {
    let abstractInterval: NodeJS.Timeout
    
    if (settings.difficulty === 'abstract' && abstractModeTimer && abstractModeTimer > 0 && testState === 'testing') {
      abstractInterval = setInterval(() => {
        setAbstractModeTimer(prev => {
          if (prev && prev <= 1) {
            // Time's up! Generate new problem
            const nextProblem = generateProblem()
            setCurrentProblem(nextProblem)
            setProblemStartTime(Date.now())
            setUserInput('')
            setTimeout(() => inputRef.current?.focus(), 50)
            return settings.abstractTimeLimit || 4
          }
          return prev ? prev - 1 : null
        })
      }, 1000)
    }
    
    return () => clearInterval(abstractInterval)
  }, [settings.difficulty, abstractModeTimer, testState, settings.abstractTimeLimit, generateProblem])

  const submitAnswer = () => {
    if (!currentProblem || userInput.trim() === '' || isSubmitting) return
    
    // Set submission lock
    setIsSubmitting(true)
    
    const timeSpent = Date.now() - problemStartTime
    const userAnswer = userInput.trim()
    const parsedAnswer = parseInt(userAnswer)
    const isCorrect = !isNaN(parsedAnswer) && parsedAnswer === currentProblem.answer
    
    // Debug logging
    console.log('Manual submit:', {
      input: userAnswer,
      parsed: parsedAnswer,
      expected: currentProblem.answer,
      isCorrect,
      problem: `${currentProblem.operand1} ${getOperationSymbol(currentProblem.operation)} ${currentProblem.operand2}`,
      problemId: currentProblem.id
    })
    
    const completedProblem: Problem = {
      ...currentProblem,
      userAnswer,
      isCorrect,
      timeSpent
    }
    
    setProblems(prev => [...prev, completedProblem])
    
    // ZetaMac behavior: only advance on correct answers
    if (isCorrect && testState === 'testing') {
      triggerInputFlash('correct')
      const nextProblem = generateProblem()
      setCurrentProblem(nextProblem)
      setProblemStartTime(Date.now())
      setUserInput('')
      
      // Abstract mode timer reset
      if (settings.difficulty === 'abstract' && settings.abstractTimeLimit) {
        setAbstractModeTimer(settings.abstractTimeLimit)
      }
      
      setTimeout(() => {
        setIsSubmitting(false)
        inputRef.current?.focus()
      }, 100)
    } else if (!isCorrect) {
      triggerInputFlash('incorrect')
      // Clear input for wrong answer but stay on same problem
      setUserInput('')
      setTimeout(() => {
        setIsSubmitting(false)
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserInput(value)
    
    // Prevent auto-submit if already submitting
    if (isSubmitting) return
    
    // Auto-advance: check if answer is correct and auto-submit
    const trimmedValue = value.trim()
    if (settings.autoAdvance && currentProblem && trimmedValue !== '' && testState === 'testing') {
      const userAnswer = parseInt(trimmedValue)
      
      // Debug logging
      console.log('Auto-submit check:', {
        input: trimmedValue,
        parsed: userAnswer,
        expected: currentProblem.answer,
        isValid: !isNaN(userAnswer),
        matches: userAnswer === currentProblem.answer,
        problemId: currentProblem.id
      })
      
      // Only auto-submit if we have a valid number that matches exactly
      if (!isNaN(userAnswer) && userAnswer === currentProblem.answer) {
        console.log('Auto-submitting correct answer:', userAnswer)
        
        // Set submission lock
        setIsSubmitting(true)
        
        // Use the current values directly
        const timeSpent = Date.now() - problemStartTime
        
        const completedProblem: Problem = {
          ...currentProblem,
          userAnswer: trimmedValue,
          isCorrect: true, // We know it's correct
          timeSpent
        }
        
        setProblems(prev => [...prev, completedProblem])
        triggerInputFlash('correct')
        
        // Generate next problem and clear input
        const nextProblem = generateProblem()
        setCurrentProblem(nextProblem)
        setProblemStartTime(Date.now())
        setUserInput('')
        
        // Abstract mode timer reset
        if (settings.difficulty === 'abstract' && settings.abstractTimeLimit) {
          setAbstractModeTimer(settings.abstractTimeLimit)
        }
        
        // Release submission lock and focus input
        setTimeout(() => {
          setIsSubmitting(false)
          inputRef.current?.focus()
        }, 100)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitAnswer()
    }
  }

  const finishTest = async () => {
    if (currentProblem && userInput.trim()) {
      submitAnswer()
    }
    
    // Calculate test results
    const correctAnswers = problems.filter(p => p.isCorrect === true).length
    const totalProblems = problems.length
    const accuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0
    const duration = settings.duration - timeLeft
    const averagePPM = duration > 0 ? Math.round((totalProblems / (duration / 60))) : 0
    const score = averagePPM // PPM as score

    // Save test results if user is authenticated
    if (isAuthenticated) {
      try {
        const testData = {
          score,
          totalProblems,
          correctAnswers,
          incorrectAnswers: totalProblems - correctAnswers,
          duration,
          testDuration: settings.duration, // Original test duration setting
          difficulty: settings.difficulty,
          operations: settings.operations,
          problems,
          averagePPM,
          accuracy,
          testType: 'standard',
          isRestart: restartCount > 0
        }

        const response = await fetch('/api/test/save-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('Test result saved successfully:', result)
        } else {
          console.error('Failed to save test result:', await response.text())
        }
      } catch (error) {
        console.error('Failed to save test result:', error)
      }
    }
    
    setTestState('finished')
  }

  const getOperationSymbol = (operation: string) => {
    switch (operation) {
      case 'addition': return '+'
      case 'subtraction': return '−'
      case 'multiplication': return '×'
      case 'division': return '÷'
      default: return '?'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated MonkeyMac Logo */}
          <div className="text-6xl animate-bounce">🐒</div>
          
          {/* Loading Text */}
          <div className="text-2xl font-bold text-accent">MonkeyMac</div>
          
          {/* Loading Animation */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
          
          {/* Loading Message */}
          <div className="text-text-secondary text-center">
            <p>Preparing your math training session...</p>
            <p className="text-sm opacity-75 mt-1">Get ready to boost your mental math skills!</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="test-container min-h-screen relative">
        {/* Background Test Interface (Blurred) */}
        <div className="absolute inset-0 filter blur-sm pointer-events-none">
          <div className="flex justify-between items-center p-6 bg-bg-secondary">
            <div className="text-2xl font-bold text-accent">MonkeyMac</div>
          </div>
          <div className="flex flex-col items-center justify-center px-8 pt-20">
            <h1 className="text-4xl font-bold mb-8 text-accent text-center">Math Speed Test</h1>
            <div className="text-6xl font-mono text-center mb-8 text-text-primary opacity-50">
              12 + 7 = ?
            </div>
            <div className="flex gap-4 text-text-secondary">
              <span>Time: 2:00</span>
              <span>Score: 0</span>
              <span>Problems: 0</span>
            </div>
          </div>
        </div>

        {/* Auth Modal Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-bg-secondary rounded-lg p-8 max-w-md w-full border border-gray-600">
            <div className="text-center mb-6">
              {/* Logo */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden bg-accent/10 border border-accent/20">
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
                <div className="w-full h-full bg-accent rounded-xl items-center justify-center text-bg-primary font-bold text-2xl hidden">
                  M
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-accent mb-2">MonkeyMac</h2>
              <p className="text-text-secondary mb-1">
                ZetaMac × MonkeyType
              </p>
              <p className="text-sm text-text-secondary opacity-75 mb-3">
                Fast Math × Trackable Stats
              </p>
              
              {/* GitHub Link */}
              <a 
                href="https://github.com/DDVHegde100/monkeymac" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-accent transition-colors border border-gray-600 rounded px-3 py-1"
                title="View source on GitHub"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                Star on GitHub
              </a>
            </div>
            
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  authMode === 'login' 
                    ? 'bg-accent text-black' 
                    : 'bg-bg-primary text-text-primary hover:bg-gray-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  authMode === 'register' 
                    ? 'bg-accent text-black' 
                    : 'bg-bg-primary text-text-primary hover:bg-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            {authMode === 'login' ? (
              <div className="space-y-4">
                <p className="text-text-secondary text-center mb-4">
                  Welcome back! Please log in to continue.
                </p>
                <button 
                  onClick={() => router.push('/login')}
                  className="w-full btn-primary py-3"
                >
                  Log In
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-text-secondary text-center mb-4">
                  Create an account to track your progress and save your stats!
                </p>
                <button 
                  onClick={() => router.push('/register')}
                  className="w-full btn-primary py-3"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-600">
              <button 
                onClick={() => setIsAuthenticated(true)}
                className="w-full py-3 px-4 rounded border border-gray-500 text-text-secondary hover:text-text-primary hover:border-gray-400 transition-colors"
              >
                Continue as Guest
              </button>
              <p className="text-xs text-text-secondary opacity-60 text-center mt-2">
                (your progress won&apos;t be saved 😢)
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (testState === 'setup') {
    return (
      <div className="test-container">
        {/* Navigation */}
        <div className="flex justify-between items-center p-6 bg-bg-secondary">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-accent hover:text-yellow-400"
            >
              MonkeyMac
            </button>
            <nav className="flex space-x-6">
              <span className="text-accent font-medium">Test</span>
              <button 
                onClick={() => router.push('/stats')}
                className="text-text-primary hover:text-accent transition-colors"
              >
                Stats
              </button>
              <button 
                onClick={() => router.push('/multiplayer')}
                className="text-text-primary hover:text-accent transition-colors"
              >
                Multiplayer
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="text-text-primary hover:text-accent transition-colors"
              >
                Settings
              </button>
            </nav>
          </div>
          <button 
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' })
                .then(() => router.push('/'))
            }}
            className="btn-secondary py-1 px-4 text-sm"
          >
            Logout
          </button>
        </div>
        
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-accent text-center">Math Speed Test</h1>
          
          {/* Time Selection - MonkeyType Style */}
          <div className="setup-section mb-8 text-center">
            <div className="setup-label">time</div>
            <div className="flex flex-wrap justify-center gap-3 mb-2">
              {[15, 30, 60, 120].map(time => (
                <button
                  key={time}
                  onClick={() => !activePreset.lockDuration && setSettings(prev => ({ ...prev, duration: time }))}
                  disabled={Boolean(activePreset.lockDuration)}
                  className={`mode-pill ${
                    settings.duration === time ? 'mode-pill-active' : 'mode-pill-inactive'
                  } ${activePreset.lockDuration ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {time < 60 ? `${time}s` : `${time / 60}m`}
                </button>
              ))}
            </div>
            {activePreset.lockDuration && (
              <p className="text-xs text-text-secondary">Classic mode uses a fixed 120s Zetamac timer</p>
            )}
          </div>

          {/* Game mode selection */}
          <div className="setup-section mb-8">
            <div className="setup-label text-center">mode</div>
            <div className="space-y-6">
              {GAME_MODE_SECTIONS.map((section) => (
                <div key={section.title}>
                  <div className="text-center mb-2">
                    <div className="text-sm font-semibold text-text-primary">{section.title}</div>
                    <div className="text-xs text-text-secondary">{section.description}</div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {section.modes.map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`mode-pill capitalize ${
                          settings.difficulty === diff ? 'mode-pill-active' : 'mode-pill-inactive'
                        }`}
                        data-difficulty={diff}
                      >
                        {getModeDisplayName(diff)}
                        {diff === 'abstract' && <span className="text-xs ml-1">⚡</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-sm text-text-secondary opacity-75 max-w-lg mx-auto text-center mt-4">
              {activePreset.description}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="stats-card">
              <h2 className="text-2xl font-semibold mb-4">Operations</h2>
              {activePreset.lockOperations && (
                <p className="text-sm text-text-secondary mb-3">All four operations are required in Zetamac Classic</p>
              )}
              
              <div className="space-y-3">
                {(['addition', 'subtraction', 'multiplication', 'division'] as const).map(op => (
                  <label key={op} className={`flex items-center ${activePreset.lockOperations ? 'opacity-70' : ''}`}>
                    <input
                      type="checkbox"
                      checked={settings.operations.includes(op)}
                      disabled={activePreset.lockOperations}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings(prev => ({ 
                            ...prev, 
                            operations: [...prev.operations, op] 
                          }))
                        } else {
                          setSettings(prev => ({ 
                            ...prev, 
                            operations: prev.operations.filter(o => o !== op) 
                          }))
                        }
                      }}
                      className="mr-3 accent-accent"
                    />
                    <span className="capitalize text-lg">{op}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="stats-card">
              <h2 className="text-2xl font-semibold mb-4">Test Preview</h2>
              <div className="space-y-3">
                <p><strong>Duration:</strong> {formatTime(settings.duration)}</p>
                <p><strong>Difficulty:</strong> <span className="capitalize">{settings.difficulty}</span></p>
                <p><strong>Operations:</strong> {settings.operations.join(', ')}</p>
                {settings.difficulty === 'abstract' && (
                  <p className="text-accent"><strong>⚡ Abstract Mode:</strong> Problems change every {settings.abstractTimeLimit}s!</p>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Sample Problems:</h3>
                <div className="space-y-2 text-2xl font-mono">
                  {settings.difficulty === 'easy' && (
                    <>
                      <div>4 + 7 = ?</div>
                      <div>15 − 8 = ?</div>
                      <div>3 × 4 = ?</div>
                      <div>20 ÷ 4 = ?</div>
                    </>
                  )}
                  {(settings.difficulty === 'medium' ||
                    settings.difficulty === 'classic' ||
                    settings.difficulty === 'custom') && (
                    <>
                      <div>32 + 47 = ?</div>
                      <div>85 − 29 = ?</div>
                      <div>7 × 9 = ?</div>
                      <div>72 ÷ 8 = ?</div>
                    </>
                  )}
                  {settings.difficulty === 'hard' && (
                    <>
                      <div>247 + 389 = ?</div>
                      <div>834 − 567 = ?</div>
                      <div>17 × 23 = ?</div>
                      <div>476 ÷ 17 = ?</div>
                    </>
                  )}
                  {settings.difficulty === 'abstract' && (
                    <>
                      <div>1847 + 2593 = ?</div>
                      <div>7834 − 3967 = ?</div>
                      <div>47 × 83 = ?</div>
                      <div>3481 ÷ 59 = ?</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card mb-8">
            <button
              type="button"
              onClick={() => setShowAppearance((open) => !open)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-2xl font-semibold">Appearance</h2>
                <p className="text-text-secondary text-sm mt-1">
                  Font, size, and layout — synced with Settings
                </p>
              </div>
              <span className="text-accent text-xl">{showAppearance ? '−' : '+'}</span>
            </button>

            {showAppearance && (
              <div className="mt-6 space-y-6 border-t border-gray-700 pt-6">
                <div>
                  <label className="block text-text-secondary mb-2">Font</label>
                  <select
                    value={preferences.font}
                    onChange={(e) => setPreferences({ font: e.target.value })}
                    className="w-full bg-bg-primary border border-gray-600 rounded px-3 py-2 text-text-primary"
                  >
                    {FONTS.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary mb-2">
                    Font size: {preferences.fontSize}rem
                  </label>
                  <input
                    type="range"
                    min="1.5"
                    max="6"
                    step="0.25"
                    value={preferences.fontSize}
                    onChange={(e) => setPreferences({ fontSize: parseFloat(e.target.value) })}
                    className="w-full accent-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary mb-2">Problem layout</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['centered', 'compact', 'minimal'] as ProblemLayout[]).map((layout) => (
                      <button
                        key={layout}
                        type="button"
                        onClick={() => setPreferences({ problemLayout: layout })}
                        className={`px-3 py-2 rounded capitalize transition-colors ${
                          preferences.problemLayout === layout
                            ? 'bg-accent text-black font-semibold'
                            : 'bg-bg-primary text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {layout}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center gap-2 text-text-primary">
                    <input
                      type="checkbox"
                      checked={preferences.showTimer}
                      onChange={(e) => setPreferences({ showTimer: e.target.checked })}
                      className="accent-accent"
                    />
                    Show timer
                  </label>
                  <label className="flex items-center gap-2 text-text-primary">
                    <input
                      type="checkbox"
                      checked={preferences.showRecentDots}
                      onChange={(e) => setPreferences({ showRecentDots: e.target.checked })}
                      className="accent-accent"
                    />
                    Show recent dots
                  </label>
                </div>

                <div className="rounded-lg bg-bg-primary p-6 text-center">
                  <div className="problem-display mb-4">24 + 18 = ?</div>
                  <input
                    type="text"
                    readOnly
                    placeholder="42"
                    className="answer-input max-w-xs mx-auto border-b border-gray-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/settings')}
                  className="text-accent hover:underline text-sm"
                >
                  Open full settings →
                </button>
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              onClick={startTest}
              disabled={settings.operations.length === 0}
              className="btn-primary start-test-button text-2xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-accent"
            >
              Start Test
            </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (testState === 'testing') {
    const correctAnswers = problems.filter(p => p.isCorrect).length
    const layoutClass = `test-layout-${preferences.problemLayout}`
    
    return (
      <div className={`test-container ${layoutClass}`}>
        <div className="test-stats-bar flex flex-wrap justify-center gap-8 mb-12 text-xl">
          {preferences.showTimer && (
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">Time:</span>
              <span className={`font-bold timer-display ${timeLeft <= 10 ? 'timer-urgent' : 'text-accent'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          {settings.difficulty === 'abstract' && abstractModeTimer && (
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">Problem:</span>
              <span className={`font-bold ${abstractModeTimer <= 2 ? 'text-red-500' : 'text-accent'}`}>
                {abstractModeTimer}s
              </span>
            </div>
          )}
          <div className="flex items-center">
            <span className="text-text-secondary mr-2">Score:</span>
            <span className="font-bold text-correct">{correctAnswers}</span>
          </div>
          {preferences.problemLayout !== 'minimal' && (
            <div className="flex items-center">
              <span className="text-text-secondary mr-2">Problems:</span>
              <span className="font-bold text-text-primary">{problems.length}</span>
            </div>
          )}
        </div>

        {currentProblem && (
          <div className="text-center mb-12 problem-stage">
            <div className="problem-display mb-8 animate-problem-in">
              {currentProblem.operand1} {getOperationSymbol(currentProblem.operation)} {currentProblem.operand2} = ?
            </div>
            
            <div className={`mx-auto ${preferences.problemLayout === 'minimal' ? 'max-w-sm' : 'max-w-xs'}`}>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9-]*"
                enterKeyHint="done"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={userInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`answer-input ${inputFlash ? `answer-flash-${inputFlash}` : ''}`}
                placeholder="Your answer"
                autoFocus
              />
            </div>
            
            {preferences.problemLayout !== 'minimal' && (
              <div className="flex gap-4 mt-6 justify-center">
                {!settings.autoAdvance && (
                  <button
                    onClick={submitAnswer}
                    className="btn-primary px-8 py-3"
                    disabled={!userInput.trim()}
                  >
                    Submit Answer
                  </button>
                )}
                <button
                  onClick={restartTest}
                  className={`btn-secondary px-6 py-3 flex items-center gap-2 hover:bg-red-600 hover:text-white transition-colors ${tabPressed ? 'bg-yellow-600 text-white' : ''}`}
                  title="Restart test (Tab+Enter, Ctrl+R, or Esc) - counts as restart in stats"
                >
                  Restart
                  <span className="text-xs opacity-75 ml-1">
                    {tabPressed ? 'Press Enter!' : 'Tab+Enter'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {preferences.showRecentDots && (
          <div className="flex gap-2 mt-8 flex-wrap justify-center">
            {problems.slice(-10).map((problem) => (
              <div
                key={problem.id}
                className={`recent-dot ${
                  problem.isCorrect ? 'bg-correct' : 'bg-incorrect'
                }`}
                title={`${problem.operand1} ${getOperationSymbol(problem.operation)} ${problem.operand2} = ${problem.answer} (you: ${problem.userAnswer})`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (testState === 'finished') {
    const correctAnswers = problems.filter(p => p.isCorrect).length
    const accuracy = problems.length > 0 ? (correctAnswers / problems.length) * 100 : 0

    return (
      <div className="test-container p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8 text-accent">Test Complete!</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="stats-card">
              <div className="text-4xl font-bold text-correct mb-2">{correctAnswers}</div>
              <div className="text-text-secondary">Correct</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-bold text-accent mb-2">{Math.round(accuracy)}%</div>
              <div className="text-text-secondary">Accuracy</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-bold text-text-primary mb-2">{Math.round((correctAnswers / (settings.duration / 60)))}</div>
              <div className="text-text-secondary">PPM</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-bold text-text-primary mb-2">{problems.length}</div>
              <div className="text-text-secondary">Total</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <button
              onClick={() => {
                setRestartCount(prev => prev + 1)
                startTest()
              }}
              className="btn-primary px-8 py-3"
            >
              Quick Restart
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary px-8 py-3"
            >
              Home
            </button>
            <button
              onClick={() => setTestState('setup')}
              className="btn-secondary px-8 py-3"
            >
              Change Settings
            </button>
            <button
              onClick={() => router.push('/stats')}
              className="btn-secondary px-8 py-3"
            >
              View Stats
            </button>
          </div>

          <div className="stats-card text-left">
            <h2 className="text-2xl font-semibold mb-4 text-center">Problem Review</h2>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid gap-2">
                {problems.map((problem) => (
                  <div
                    key={problem.id}
                    className={`flex justify-between items-center p-2 rounded ${
                      problem.isCorrect ? 'bg-green-900/20' : 'bg-red-900/20'
                    }`}
                  >
                    <span className="font-mono">
                      {problem.operand1} {getOperationSymbol(problem.operation)} {problem.operand2} = {problem.answer}
                    </span>
                    <span className={`font-mono ${problem.isCorrect ? 'text-correct' : 'text-incorrect'}`}>
                      You: {problem.userAnswer}
                    </span>
                    <span className="text-text-secondary text-sm">
                      {(problem.timeSpent / 1000).toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
