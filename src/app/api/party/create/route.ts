import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../../lib/auth'
import { connectToDatabase } from '../../../../lib/mongodb'
import { createParty, fetchUserProfile } from '../../../../lib/partyService'
import { serializeParty } from '../../../../lib/party'

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Login required for multiplayer' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const profile = await fetchUserProfile(db, auth.userId)

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const party = await createParty(db, {
      userId: auth.userId,
      username: profile.username,
      firstName: profile.firstName,
    })

    return NextResponse.json({ party: serializeParty(party) })
  } catch (error) {
    console.error('Create party error:', error)
    return NextResponse.json({ error: 'Failed to create party' }, { status: 500 })
  }
}
