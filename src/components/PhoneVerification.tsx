'use client'

import { useState } from 'react'

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void
  onCancel: () => void
}

export default function PhoneVerification({ onVerified, onCancel }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [demoCode, setDemoCode] = useState('')

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Extract digits only
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone })
      })

      const data = await response.json()

      if (response.ok) {
        setDemoCode(data.demo_code) // Only for demo purposes
        setStep('code')
      } else {
        setError(data.error || 'Failed to send verification code')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanPhone = phoneNumber.replace(/\D/g, '')

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: cleanPhone, 
          code: verificationCode 
        })
      })

      const data = await response.json()

      if (response.ok) {
        onVerified(cleanPhone)
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    setLoading(true)
    
    const cleanPhone = phoneNumber.replace(/\D/g, '')

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanPhone })
      })

      const data = await response.json()

      if (response.ok) {
        setDemoCode(data.demo_code)
        setError('New verification code sent!')
      } else {
        setError(data.error || 'Failed to resend code')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-bg-secondary rounded-xl p-8 max-w-md w-full border border-gray-600">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden bg-accent/10 border border-accent/20">
            <img 
              src="/monk.png" 
              alt="MonkeyMac Logo" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <h2 className="text-2xl font-bold text-accent mb-2">
            Phone Verification
          </h2>
          <p className="text-text-secondary text-sm">
            {step === 'phone' 
              ? 'Enter your phone number to receive a verification code'
              : 'Enter the 3-digit code sent to your phone'
            }
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2 text-text-primary">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 bg-bg-primary border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:border-accent text-center text-lg tracking-wide"
                maxLength={14}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-bg-primary text-text-secondary rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-accent text-bg-primary rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-2 text-text-primary">
                Verification Code
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className="w-full px-4 py-3 bg-bg-primary border border-gray-600 rounded-lg text-text-primary focus:outline-none focus:border-accent text-center text-2xl tracking-widest font-mono"
                maxLength={3}
                required
              />
              <div className="mt-2 text-xs text-text-secondary text-center">
                Code sent to {phoneNumber}
              </div>
              
              {/* Demo Code Display (Remove in production) */}
              {demoCode && (
                <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-center">
                  <div className="text-xs text-yellow-300 mb-1">Demo Code:</div>
                  <div className="font-mono text-lg font-bold text-yellow-400">{demoCode}</div>
                  <div className="text-xs text-yellow-300 mt-1">
                    (In production, this would be sent via SMS)
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 py-3 bg-bg-primary text-text-secondary rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 3}
                className="flex-1 py-3 bg-accent text-bg-primary rounded-lg font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-accent hover:underline disabled:opacity-50"
              >
                Didn&apos;t receive code? Resend
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
