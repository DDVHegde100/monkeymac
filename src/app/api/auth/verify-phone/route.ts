import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for demo (use Redis in production)
const verificationCodes = new Map<string, { code: string, expires: number }>()

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber || phoneNumber.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      )
    }

    // Generate a 3-digit verification code
    const code = Math.floor(100 + Math.random() * 900).toString()
    const expires = Date.now() + 5 * 60 * 1000 // 5 minutes

    // Store the code (in production, use a proper database/cache)
    verificationCodes.set(phoneNumber, { code, expires })

    // In production, you would send SMS here using Twilio, AWS SNS, etc.
    console.log(`Verification code for ${phoneNumber}: ${code}`)

    // For demo purposes, we'll simulate sending SMS
    // await sendSMS(phoneNumber, `Your MonkeyMac verification code is: ${code}`)

    return NextResponse.json(
      { 
        message: 'Verification code sent',
        // In production, NEVER send the code in the response
        // This is only for demo purposes
        demo_code: code 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json()

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      )
    }

    const stored = verificationCodes.get(phoneNumber)
    
    if (!stored) {
      return NextResponse.json(
        { error: 'No verification code found for this number' },
        { status: 400 }
      )
    }

    if (Date.now() > stored.expires) {
      verificationCodes.delete(phoneNumber)
      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      )
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Code is valid, clean up
    verificationCodes.delete(phoneNumber)

    return NextResponse.json(
      { message: 'Phone number verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
