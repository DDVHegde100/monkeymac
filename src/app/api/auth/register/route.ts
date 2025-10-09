import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/monkeymax'

export async function POST(request: NextRequest) {
  try {
    const { firstName, username, phone, password } = await request.json()

    if (!firstName || !username || !phone || !password) {
      return NextResponse.json(
        { error: 'First name, username, phone, and password are required' },
        { status: 400 }
      )
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('monkeymax')
    const users = db.collection('users')

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [{ phone }, { username }]
    })

    if (existingUser) {
      await client.close()
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
        accuracy: 0
      }
    }

    const result = await users.insertOne(newUser)
    await client.close()

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: result.insertedId
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
