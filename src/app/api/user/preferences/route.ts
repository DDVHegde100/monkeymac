import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/monkeymax'

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    const { theme, font } = await request.json()
    
    // Get user from JWT token
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('monkeymax')
    const users = db.collection('users')

    // Update user preferences
    await users.updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $set: { 
          preferences: {
            theme: theme || 'dark',
            font: font || 'fira-code'
          }
        }
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null
  
  try {
    // Get user from JWT token
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('monkeymax')
    const users = db.collection('users')

    // Get user preferences
    const user = await users.findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { preferences: 1 } }
    )
    
    const preferences = user?.preferences || { theme: 'dark', font: 'fira-code' }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error loading preferences:', error)
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
  } finally {
    if (client) {
      await client.close()
    }
  }
}
