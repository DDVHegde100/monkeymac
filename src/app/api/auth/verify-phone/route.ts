import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'

// Multiple SMS service options with fallback
async function sendSMS(phoneNumber: string, message: string) {
  // Try Twilio first (most reliable)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+1${phoneNumber}`
      })
      
      console.log(`SMS sent successfully via Twilio to ${phoneNumber}`)
      return { success: true, provider: 'Twilio' }
    } catch (error) {
      console.error('Twilio SMS failed:', error)
    }
  }

  // Fallback to Textbelt (free but limited)
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: `+1${phoneNumber}`,
        message: message,
        key: 'textbelt',
      }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log(`SMS sent successfully via Textbelt to ${phoneNumber}`)
      return { success: true, provider: 'Textbelt' }
    } else {
      console.error('Textbelt SMS failed:', result.error)
    }
  } catch (error) {
    console.error('Textbelt SMS error:', error)
  }

  // Fallback to SMS API (another free option)
  try {
    const response = await fetch('https://api.sms.to/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SMS_TO_API_KEY || 'demo'}`
      },
      body: JSON.stringify({
        to: `+1${phoneNumber}`,
        message: message,
        sender_id: 'MonkeyMac'
      }),
    })

    const result = await response.json()
    
    if (result.success || result.status === 'success') {
      console.log(`SMS sent successfully via SMS.to to ${phoneNumber}`)
      return { success: true, provider: 'SMS.to' }
    }
  } catch (error) {
    console.error('SMS.to API error:', error)
  }

  return { success: false, provider: 'none' }
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
    const smsResult = await sendSMS(phoneNumber, smsMessage)

    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Failed to send SMS. Please check your phone number and try again.' },
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
