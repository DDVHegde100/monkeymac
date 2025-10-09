'use client'

import { useState, useEffect } from 'react'

interface Problem {
  question: string
  answer: number
  operator: string
}

export default function MathTest() {
  const [problem, setProblem] = useState<Problem>({ question: '', answer: 0, operator: '+' })
  const [userInput, setUserInput] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(false)
  const [problems, setProblems] = useState<Problem[]>([])
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)

  const generateProblem = (): Problem => {
    const operators = ['+', '-', '*', '/']
    const operator = operators[Math.floor(Math.random() * operators.length)]
    
    let a: number, b: number, answer: number
    
    switch (operator) {
      case '+':
        a = Math.floor(Math.random() * 100) + 1
        b = Math.floor(Math.random() * 100) + 1
        answer = a + b
        break
      case '-':
        a = Math.floor(Math.random() * 100) + 1
        b = Math.floor(Math.random() * a) + 1
        answer = a - b
        break
      case '*':
        a = Math.floor(Math.random() * 20) + 1
        b = Math.floor(Math.random() * 20) + 1
        answer = a * b
        break
      case '/':
        b = Math.floor(Math.random() * 12) + 1
        answer = Math.floor(Math.random() * 20) + 1
        a = b * answer
        break
      default:
        a = 1
        b = 1
        answer = 2
    }
    
    return {
      question: `${a} ${operator} ${b}`,
      answer,
      operator
    }
  }

  const startTest = () => {
    setIsActive(true)
    setScore(0)
    setTimeLeft(60)
    setCurrentProblemIndex(0)
    setUserInput('')
    
    // Generate 100 problems
    const newProblems = Array.from({ length: 100 }, () => generateProblem())
    setProblems(newProblems)
    setProblem(newProblems[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (parseInt(userInput) === problem.answer) {
      setScore(prev => prev + 1)
    }
    
    const nextIndex = currentProblemIndex + 1
    if (nextIndex < problems.length) {
      setCurrentProblemIndex(nextIndex)
      setProblem(problems[nextIndex])
    } else {
      // Generate more problems if needed
      const newProblem = generateProblem()
      setProblem(newProblem)
      setProblems(prev => [...prev, newProblem])
      setCurrentProblemIndex(prev => prev + 1)
    }
    
    setUserInput('')
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  if (!isActive && timeLeft === 60) {
    return (
      <div className="test-container flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8 text-accent">Math Speed Test</h1>
        <p className="text-lg text-text-secondary mb-8 text-center max-w-md">
          Solve as many arithmetic problems as you can in 60 seconds!
        </p>
        <button onClick={startTest} className="btn-primary text-xl px-8 py-4">
          Start Test
        </button>
      </div>
    )
  }

  if (!isActive && timeLeft === 0) {
    return (
      <div className="test-container flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4 text-accent">Test Complete!</h1>
        <div className="text-6xl font-bold mb-8 text-correct">{score}</div>
        <p className="text-lg text-text-secondary mb-8">Problems solved correctly</p>
        <button onClick={startTest} className="btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="test-container flex flex-col items-center justify-center p-8">
      <div className="mb-8 flex gap-8 text-xl">
        <div>Time: <span className="text-accent font-bold">{timeLeft}s</span></div>
        <div>Score: <span className="text-correct font-bold">{score}</span></div>
      </div>
      
      <div className="problem-display mb-8">
        {problem.question} = ?
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          type="number"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="answer-input mb-8 max-w-xs"
          placeholder="Your answer"
          autoFocus
        />
        <button type="submit" className="btn-primary">
          Submit
        </button>
      </form>
    </div>
  )
}
