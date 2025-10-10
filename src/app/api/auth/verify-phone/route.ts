import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'

// Function to send SMS using Textbelt (free service)
async function sendSMS(phoneNumber: string, message: string) {
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: `+1${phoneNumber}`,
        message: message,
        key: 'textbelt', // Free tier key (limited messages per day)
      }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`SMS sent successfully to ${phoneNumber}`)
      return true
    } else {
      console.error('SMS send failed:', result.error)
      return false
    }
  } catch (error) {
    console.error('SMS service error:', error)
    return false
  }
}

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
    const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Store the code in MongoDB
    const { db } = await connectToDatabase()
    await db.collection('verification_codes').updateOne(
      { phoneNumber },
      { 
        $set: { 
          code, 
          expires, 
          createdAt: new Date() 
        } 
      },
      { upsert: true }
    )

    // Send actual SMS
    const smsMessage = `Your MonkeyMac verification code is: ${code}. This code expires in 5 minutes.`
    const smsSent = await sendSMS(phoneNumber, smsMessage)

    if (!smsSent) {
      return NextResponse.json(
        { error: 'Failed to send SMS. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Verification code sent to your phone',
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

    // Get stored verification code from MongoDB
    const { db } = await connectToDatabase()
    const stored = await db.collection('verification_codes').findOne({ phoneNumber })
    
    if (!stored) {
      return NextResponse.json(
        { error: 'No verification code found for this number' },
        { status: 400 }
      )
    }

    if (new Date() > stored.expires) {
      await db.collection('verification_codes').deleteOne({ phoneNumber })
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
    await db.collection('verification_codes').deleteOne({ phoneNumber })

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
