'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingProps {
  user: any
  onComplete: () => void
}

export default function OnboardingFlow({ user, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    difficulty: 'medium',
    operations: ['addition', 'subtraction'],
    testDuration: 60,
    theme: 'dark'
  })
  const router = useRouter()

  const steps = [
    {
      title: "Welcome to MonkeyMac! 🎉",
      subtitle: "Let's set up your math training experience",
      content: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-accent/10 border border-accent/20">
            <img 
              src="/monk.png" 
              alt="MonkeyMac Logo" 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-accent rounded-2xl items-center justify-center text-bg-primary font-bold text-2xl hidden">
              M
            </div>
          </div>
          <p className="text-text-secondary">
            Hi {user.firstName}! Ready to boost your mental math skills?
          </p>
          <div className="bg-bg-secondary rounded-lg p-4 text-sm text-text-secondary">
            <p>🚀 <strong>Fast calculations</strong> - Practice arithmetic with speed</p>
            <p>📊 <strong>Track progress</strong> - See your improvement over time</p>
            <p>🎯 <strong>Personalized</strong> - Customize difficulty and operations</p>
          </div>
        </div>
      )
    },
    {
      title: "Choose Your Difficulty",
      subtitle: "We'll start you here, but you can change this anytime",
      content: (
        <div className="space-y-4">
          {[
            { id: 'easy', name: 'Easy', desc: 'Single digits (1-10)', icon: '🌱' },
            { id: 'medium', name: 'Medium', desc: 'Double digits (10-100)', icon: '⚡' },
            { id: 'hard', name: 'Hard', desc: 'Large numbers (100-1000)', icon: '🔥' },
            { id: 'abstract', name: 'Abstract', desc: 'Pattern recognition', icon: '🧠' }
          ].map((level) => (
            <button
              key={level.id}
              onClick={() => setPreferences(prev => ({ ...prev, difficulty: level.id }))}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                preferences.difficulty === level.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-gray-600 bg-bg-secondary hover:border-accent/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <div className="font-semibold">{level.name}</div>
                  <div className="text-sm text-text-secondary">{level.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Select Operations",
      subtitle: "Which math operations do you want to practice?",
      content: (
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'addition', name: 'Addition', symbol: '+', color: 'text-green-400' },
            { id: 'subtraction', name: 'Subtraction', symbol: '−', color: 'text-blue-400' },
            { id: 'multiplication', name: 'Multiplication', symbol: '×', color: 'text-purple-400' },
            { id: 'division', name: 'Division', symbol: '÷', color: 'text-orange-400' }
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => {
                const newOps = preferences.operations.includes(op.id)
                  ? preferences.operations.filter(o => o !== op.id)
                  : [...preferences.operations, op.id]
                if (newOps.length > 0) {
                  setPreferences(prev => ({ ...prev, operations: newOps }))
                }
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                preferences.operations.includes(op.id)
                  ? 'border-accent bg-accent/10'
                  : 'border-gray-600 bg-bg-secondary hover:border-accent/50'
              }`}
            >
              <div className={`text-3xl font-bold mb-2 ${op.color}`}>{op.symbol}</div>
              <div className="text-sm font-semibold">{op.name}</div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Test Duration",
      subtitle: "How long should each practice session be?",
      content: (
        <div className="space-y-4">
          {[30, 60, 120, 300].map((duration) => (
            <button
              key={duration}
              onClick={() => setPreferences(prev => ({ ...prev, testDuration: duration }))}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                preferences.testDuration === duration
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-gray-600 bg-bg-secondary hover:border-accent/50'
              }`}
            >
              <div className="font-semibold">
                {duration < 60 ? `${duration} seconds` : `${duration / 60} minute${duration > 60 ? 's' : ''}`}
              </div>
              <div className="text-sm text-text-secondary">
                {duration === 30 && 'Quick practice'}
                {duration === 60 && 'Standard session (recommended)'}
                {duration === 120 && 'Extended practice'}
                {duration === 300 && 'Marathon session'}
              </div>
            </button>
          ))}
        </div>
      )
    }
  ]

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Save preferences and complete onboarding
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferences)
        })
        
        if (response.ok) {
          onComplete()
          router.push('/test')
        }
      } catch (error) {
        console.error('Failed to save preferences:', error)
        onComplete() // Complete anyway
      }
    }
  }

  const handleSkip = () => {
    onComplete()
    router.push('/test')
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-bg-primary rounded-full h-2">
            <div 
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-accent mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-text-secondary">
            {steps[currentStep].subtitle}
          </p>
        </div>

        <div className="mb-8">
          {steps[currentStep].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleSkip}
            className="px-6 py-2 text-text-secondary hover:text-accent transition-colors"
          >
            Skip Setup
          </button>
          
          <div className="space-x-4">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2 bg-bg-primary text-text-primary rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-accent text-bg-primary rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Start Training!' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
