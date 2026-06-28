import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../../lib/auth'
import { connectToDatabase } from '../../../../lib/mongodb'
import { leaveParty } from '../../../../lib/partyService'
import { serializeParty } from '../../../../lib/party'

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Login required for multiplayer' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { db } = await connectToDatabase()
    const party = await leaveParty(db, auth.userId, body.code)

    return NextResponse.json({
      success: true,
      party: party ? serializeParty(party) : null,
    })
  } catch (error) {
    console.error('Leave party error:', error)
    return NextResponse.json({ error: 'Failed to leave party' }, { status: 500 })
  }
}
