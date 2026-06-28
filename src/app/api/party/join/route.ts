import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../../lib/auth'
import { connectToDatabase } from '../../../../lib/mongodb'
import { fetchUserProfile, joinParty } from '../../../../lib/partyService'
import { serializeParty } from '../../../../lib/party'

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Login required for multiplayer' }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Party code is required' }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const profile = await fetchUserProfile(db, auth.userId)

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const party = await joinParty(db, code.trim(), {
      userId: auth.userId,
      username: profile.username,
      firstName: profile.firstName,
    })

    return NextResponse.json({ party: serializeParty(party) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join party'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
