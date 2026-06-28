import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '../../../../lib/auth'
import { connectToDatabase } from '../../../../lib/mongodb'
import {
  beginPartyRacing,
  getPartyByCode,
  setPlayerReady,
  startPartyRace,
  updatePartyScore,
  updatePartySettings,
} from '../../../../lib/partyService'
import { serializeParty } from '../../../../lib/party'
import type { Difficulty, Operation } from '../../../../lib/problemGenerator'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const auth = getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Login required for multiplayer' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const party = await getPartyByCode(db, params.code)

    if (!party) {
      return NextResponse.json({ error: 'Party not found or expired' }, { status: 404 })
    }

    const isMember = party.players.some((player) => player.userId === auth.userId)
    if (!isMember) {
      return NextResponse.json({ error: 'You are not in this party' }, { status: 403 })
    }

    if (party.status === 'countdown' && party.startAt && Date.now() >= party.startAt) {
      await beginPartyRacing(db, party.code)
      const refreshed = await getPartyByCode(db, party.code)
      return NextResponse.json({ party: serializeParty(refreshed!) })
    }

    return NextResponse.json({ party: serializeParty(party) })
  } catch (error) {
    console.error('Get party error:', error)
    return NextResponse.json({ error: 'Failed to fetch party' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const auth = getAuthUser(request)
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Login required for multiplayer' }, { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()
    const code = params.code.toUpperCase()

    switch (body.action) {
      case 'ready':
        await setPlayerReady(db, code, auth.userId, Boolean(body.ready))
        break
      case 'settings':
        await updatePartySettings(db, code, auth.userId, {
          duration: body.duration,
          difficulty: body.difficulty as Difficulty,
          operations: body.operations as Operation[],
        })
        break
      case 'start':
        await startPartyRace(db, code, auth.userId)
        break
      case 'score':
        await updatePartyScore(
          db,
          code,
          auth.userId,
          Number(body.score) || 0,
          Number(body.problemsSolved) || 0,
          Boolean(body.finished)
        )
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    const party = await getPartyByCode(db, code)
    if (!party) {
      return NextResponse.json({ error: 'Party not found or expired' }, { status: 404 })
    }

    return NextResponse.json({ party: serializeParty(party) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update party'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
