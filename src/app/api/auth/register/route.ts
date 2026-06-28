import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '../../../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const { firstName, username, phone, password } = await request.json()

    if (!firstName || !username || !phone || !password) {
      return NextResponse.json(
        { error: 'First name, username, phone, and password are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [{ phone }, { username }]
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone or username already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = {
      firstName,
      username,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      stats: {
        totalTests: 0,
        bestScore: 0,
        averageScore: 0,
        totalProblems: 0,
        accuracy: 0,
        elo: 1200,
        multiplayerWins: 0,
        multiplayerLosses: 0,
        multiplayerGames: 0,
      }
    }

    const result = await users.insertOne(newUser)

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: result.insertedId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    console.error('MongoDB URI available:', !!process.env.MONGODB_URI)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
