'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface TestSettings {
  duration: number
  operations: ('addition' | 'subtraction' | 'multiplication' | 'division')[]
  ranges: {
    addition: { min: number, max: number }
    subtraction: { min: number, max: number }
    multiplication: { min: number, max: number }
    division: { min: number, max: number }
  }
  autoAdvance: boolean
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
  duration: 120,
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  ranges: {
    addition: { min: 1, max: 99 },
    subtraction: { min: 1, max: 99 },
    multiplication: { min: 1, max: 12 },
    division: { min: 1, max: 144 }
  },
  autoAdvance: true
}

export default function MathTest() {
  const router = useRouter()
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
  
  const inputRef = useRef<HTMLInputElement>(null)
  const testStartTimeRef = useRef(0)

  useEffect(() => {
    checkAuthStatus()
  }, [])

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

  const generateProblem = useCallback((): Problem => {
    const availableOps = settings.operations
    const operation = availableOps[Math.floor(Math.random() * availableOps.length)]
    
    let operand1: number, operand2: number, answer: number
    const range = settings.ranges[operation]
    
    switch (operation) {
      case 'addition':
        operand1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        operand2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        answer = operand1 + operand2
        break
      
      case 'subtraction':
        operand1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        operand2 = Math.floor(Math.random() * (operand1 - range.min + 1)) + range.min
        answer = operand1 - operand2
        break
      
      case 'multiplication':
        operand1 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        operand2 = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        answer = operand1 * operand2
        break
      
      case 'division':
        answer = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
        operand2 = Math.floor(Math.random() * 12) + 1
        operand1 = answer * operand2
        break
      
      default:
        operand1 = 1
        operand2 = 1
        answer = 2
    }
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      operation,
      operand1,
      operand2,
      answer,
      userAnswer: '',
      isCorrect: null,
      timeSpent: 0,
      timestamp: Date.now()
    }
  }, [settings])

  const startTest = () => {
    setTestState('testing')
    setTimeLeft(settings.duration)
    setProblems([])
    setUserInput('')
    testStartTimeRef.current = Date.now()
    
    const firstProblem = generateProblem()
    setCurrentProblem(firstProblem)
    setProblemStartTime(Date.now())
    
    setTimeout(() => inputRef.current?.focus(), 100)
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

  const submitAnswer = () => {
    if (!currentProblem || userInput.trim() === '') return
    
    const timeSpent = Date.now() - problemStartTime
    const userAnswer = userInput.trim()
    const isCorrect = parseInt(userAnswer) === currentProblem.answer
    
    const completedProblem: Problem = {
      ...currentProblem,
      userAnswer,
      isCorrect,
      timeSpent
    }
    
    setProblems(prev => [...prev, completedProblem])
    
    // Only advance if the answer is correct (for ZetaMac-style gameplay)
    if (isCorrect && testState === 'testing') {
      const nextProblem = generateProblem()
      setCurrentProblem(nextProblem)
      setProblemStartTime(Date.now())
      setUserInput('')
      
      setTimeout(() => inputRef.current?.focus(), 50)
    } else if (!isCorrect) {
      // Clear input for wrong answer but stay on same problem
      setUserInput('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUserInput(value)
    
    if (settings.autoAdvance && value.length > 0 && currentProblem) {
      const possibleAnswer = parseInt(value)
      // Only auto-advance on correct answer
      if (!isNaN(possibleAnswer) && possibleAnswer === currentProblem.answer) {
        setTimeout(submitAnswer, 100)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitAnswer()
    }
  }

  const finishTest = () => {
    if (currentProblem && userInput.trim()) {
      submitAnswer()
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
      <div className="test-container flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading...</div>
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
              <h2 className="text-3xl font-bold text-accent mb-2">MonkeyMac</h2>
              <p className="text-text-secondary mb-1">
                ZetaMac × MonkeyType
              </p>
              <p className="text-sm text-text-secondary opacity-75">
                Fast Math × Trackable Stats
              </p>
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
                (your progress won't be saved 😢)
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="stats-card">
              <h2 className="text-2xl font-semibold mb-4">Test Settings</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Duration</label>
                <select
                  value={settings.duration}
                  onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-bg-secondary border border-gray-600 rounded text-text-primary"
                  title="Select test duration"
                >
                  <option value={60}>1 minute</option>
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Operations</label>
                <div className="space-y-2">
                  {(['addition', 'subtraction', 'multiplication', 'division'] as const).map(op => (
                    <label key={op} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.operations.includes(op)}
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
                        className="mr-2 accent-accent"
                      />
                      <span className="capitalize">{op}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoAdvance}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                    className="mr-2 accent-accent"
                  />
                  <span>Auto-advance to next problem</span>
                </label>
              </div>
            </div>

            <div className="stats-card">
              <h2 className="text-2xl font-semibold mb-4">Test Preview</h2>
              <div className="space-y-3">
                <p><strong>Duration:</strong> {formatTime(settings.duration)}</p>
                <p><strong>Operations:</strong> {settings.operations.join(', ')}</p>
                <p><strong>Auto-advance:</strong> {settings.autoAdvance ? 'On' : 'Off'}</p>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Sample Problems:</h3>
                <div className="space-y-2 text-2xl font-mono">
                  <div>12 + 8 = ?</div>
                  <div>15 − 7 = ?</div>
                  <div>6 × 4 = ?</div>
                  <div>48 ÷ 6 = ?</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startTest}
              disabled={settings.operations.length === 0}
              className="btn-primary text-2xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
    
    return (
      <div className="test-container flex flex-col items-center justify-center min-h-screen p-8">
        <div className="flex gap-8 mb-12 text-xl">
          <div className="flex items-center">
            <span className="text-text-secondary mr-2">Time:</span>
            <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-accent'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-text-secondary mr-2">Score:</span>
            <span className="font-bold text-correct">{correctAnswers}</span>
          </div>
          <div className="flex items-center">
            <span className="text-text-secondary mr-2">Problems:</span>
            <span className="font-bold text-text-primary">{problems.length}</span>
          </div>
        </div>

        {currentProblem && (
          <div className="text-center mb-12">
            <div className="problem-display mb-8">
              {currentProblem.operand1} {getOperationSymbol(currentProblem.operation)} {currentProblem.operand2} = ?
            </div>
            
            <div className="max-w-xs mx-auto">
              <input
                ref={inputRef}
                type="number"
                value={userInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="answer-input"
                placeholder="Your answer"
                autoFocus
              />
            </div>
            
            {!settings.autoAdvance && (
              <button
                onClick={submitAnswer}
                className="btn-primary mt-6 px-8 py-3"
                disabled={!userInput.trim()}
              >
                Submit Answer
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-8">
          {problems.slice(-10).map((problem) => (
            <div
              key={problem.id}
              className={`w-4 h-4 rounded-full ${
                problem.isCorrect ? 'bg-correct' : 'bg-incorrect'
              }`}
              title={`${problem.operand1} ${getOperationSymbol(problem.operation)} ${problem.operand2} = ${problem.answer} (you: ${problem.userAnswer})`}
            />
          ))}
        </div>
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

          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => setTestState('setup')}
              className="btn-primary px-8 py-3"
            >
              Test Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary px-8 py-3"
            >
              Home
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
