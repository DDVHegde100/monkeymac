import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '../../../../lib/mongodb'
import { DEFAULT_PREFERENCES, normalizePreferences } from '../../../../lib/preferences'
import type { UserPreferences } from '../../../../config/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

async function readPreferences(userId: string): Promise<UserPreferences> {
  const { db } = await connectToDatabase()
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(userId) },
    { projection: { preferences: 1 } }
  )

  return normalizePreferences(user?.preferences)
}

async function writePreferences(userId: string, preferences: UserPreferences) {
  const { db } = await connectToDatabase()
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        preferences,
        updatedAt: new Date(),
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const preferences = await readPreferences(userId)
    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error loading preferences:', error)
    return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 })
  }
}

async function savePreferences(request: NextRequest) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const current = await readPreferences(userId)
  const preferences = normalizePreferences({ ...current, ...body })

  await writePreferences(userId, preferences)
  return NextResponse.json({ success: true, preferences })
}

export async function POST(request: NextRequest) {
  try {
    return await savePreferences(request)
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await savePreferences(request)
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    return await savePreferences(request)
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}