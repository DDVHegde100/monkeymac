import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '../../../../lib/mongodb'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const users = db.collection('users')

    // Find user by username
    const user = await users.findOne({ username })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        firstName: user.firstName,
        username: user.username,
        phone: user.phone
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return success response
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: {
          id: user._id,
          firstName: user.firstName,
          username: user.username,
          phone: user.phone,
          stats: user.stats
        }
      },
      { status: 200 }
    )

    // Set HTTP-only cookie with JWT
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    console.error('MongoDB URI available:', !!process.env.MONGODB_URI)
    console.error('JWT Secret available:', !!process.env.JWT_SECRET)
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
