import { Db, ObjectId } from 'mongodb'
import { finalizePartyResults } from './multiplayerResults'
import {
  COUNTDOWN_MS,
  MAX_PARTY_PLAYERS,
  PartyDocument,
  PartyPlayer,
  PartySettings,
  defaultPartySettings,
  ensurePartyIndexes,
  findPlayer,
  generatePartyCode,
  isPartyExpired,
  touchPartyExpiry,
} from './party'

export async function removeUserFromParties(db: Db, userId: string) {
  const parties = db.collection('parties')
  const activeParties = await parties.find({ 'players.userId': userId }).toArray()

  for (const party of activeParties as PartyDocument[]) {
    const remaining = party.players.filter((player) => player.userId !== userId)

    if (remaining.length === 0) {
      await parties.deleteOne({ _id: party._id })
      continue
    }

    const nextLeader =
      party.leaderId === userId ? remaining[0].userId : party.leaderId

    await parties.updateOne(
      { _id: party._id },
      {
        $set: {
          players: remaining,
          leaderId: nextLeader,
          lastActivity: new Date(),
          expiresAt: touchPartyExpiry(),
        },
      }
    )
  }
}

export async function getPartyByCode(db: Db, code: string): Promise<PartyDocument | null> {
  const party = await db.collection('parties').findOne({ code: code.toUpperCase() })
  if (!party) return null

  if (isPartyExpired(party as PartyDocument)) {
    await db.collection('parties').deleteOne({ _id: party._id })
    return null
  }

  return party as PartyDocument
}

export async function createParty(
  db: Db,
  user: { userId: string; username: string; firstName: string }
): Promise<PartyDocument> {
  await ensurePartyIndexes(db)
  await removeUserFromParties(db, user.userId)

  const parties = db.collection('parties')
  const now = new Date()

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generatePartyCode()
    const existing = await parties.findOne({ code })
    if (existing) continue

    const player: PartyPlayer = {
      userId: user.userId,
      username: user.username,
      firstName: user.firstName,
      ready: false,
      score: 0,
      problemsSolved: 0,
      finished: false,
      joinedAt: now,
    }

    const party: PartyDocument = {
      code,
      leaderId: user.userId,
      status: 'waiting',
      settings: defaultPartySettings(),
      players: [player],
      seed: null,
      startAt: null,
      lastActivity: now,
      createdAt: now,
      expiresAt: touchPartyExpiry(now),
    }

    await parties.insertOne(party)
    return party
  }

  throw new Error('Failed to generate unique party code')
}

export async function joinParty(
  db: Db,
  code: string,
  user: { userId: string; username: string; firstName: string }
): Promise<PartyDocument> {
  await removeUserFromParties(db, user.userId)

  const party = await getPartyByCode(db, code)
  if (!party) {
    throw new Error('Party not found or expired')
  }

  if (party.status !== 'waiting') {
    throw new Error('Party has already started')
  }

  if (party.players.length >= MAX_PARTY_PLAYERS) {
    throw new Error('Party is full')
  }

  if (findPlayer(party, user.userId)) {
    return party
  }

  const player: PartyPlayer = {
    userId: user.userId,
    username: user.username,
    firstName: user.firstName,
    ready: false,
    score: 0,
    problemsSolved: 0,
    finished: false,
    joinedAt: new Date(),
  }

  const now = new Date()
  await db.collection('parties').updateOne(
    { _id: party._id },
    {
      $set: {
        players: [...party.players, player],
        lastActivity: now,
        expiresAt: touchPartyExpiry(now),
      },
    }
  )

  return (await getPartyByCode(db, code))!
}

export async function leaveParty(db: Db, userId: string, code?: string) {
  const parties = db.collection('parties')
  const query = code
    ? { code: code.toUpperCase(), 'players.userId': userId }
    : { 'players.userId': userId }

  const party = await parties.findOne(query)
  if (!party) return null

  const remaining = (party.players as PartyPlayer[]).filter((player) => player.userId !== userId)

  if (remaining.length === 0) {
    await parties.deleteOne({ _id: party._id })
    return null
  }

  const nextLeader = party.leaderId === userId ? remaining[0].userId : party.leaderId
  const now = new Date()
  const shouldFinish =
    party.status === 'racing' && remaining.length <= 1

  await parties.updateOne(
    { _id: party._id },
    {
      $set: {
        players: remaining,
        leaderId: nextLeader,
        lastActivity: now,
        expiresAt: touchPartyExpiry(now),
        ...(shouldFinish ? { status: 'finished' } : {}),
      },
    }
  )

  if (shouldFinish && party.players.length >= 2) {
    await finalizePartyResults(db, party.code)
  }

  return (await getPartyByCode(db, party.code)) as PartyDocument | null
}

export async function updatePartySettings(
  db: Db,
  code: string,
  leaderId: string,
  settings: Partial<PartySettings>
) {
  const party = await getPartyByCode(db, code)
  if (!party) throw new Error('Party not found')
  if (party.leaderId !== leaderId) throw new Error('Only the party leader can change settings')
  if (party.status !== 'waiting') throw new Error('Cannot change settings after the race starts')

  const nextSettings = { ...party.settings, ...settings }
  const now = new Date()

  await db.collection('parties').updateOne(
    { _id: party._id },
    {
      $set: {
        settings: nextSettings,
        lastActivity: now,
        expiresAt: touchPartyExpiry(now),
      },
    }
  )
}

export async function setPlayerReady(db: Db, code: string, userId: string, ready: boolean) {
  const party = await getPartyByCode(db, code)
  if (!party) throw new Error('Party not found')
  if (party.status !== 'waiting') throw new Error('Party is not in lobby')

  const players = party.players.map((player) =>
    player.userId === userId ? { ...player, ready } : player
  )

  const now = new Date()
  await db.collection('parties').updateOne(
    { _id: party._id },
    { $set: { players, lastActivity: now, expiresAt: touchPartyExpiry(now) } }
  )
}

export async function startPartyRace(db: Db, code: string, leaderId: string) {
  const party = await getPartyByCode(db, code)
  if (!party) throw new Error('Party not found')
  if (party.leaderId !== leaderId) throw new Error('Only the party leader can start the race')
  if (party.players.length < 2) throw new Error('Need at least 2 players to start')
  if (!party.players.every((player) => player.ready)) {
    throw new Error('All players must be ready')
  }

  const players = party.players.map((player) => ({
    ...player,
    score: 0,
    problemsSolved: 0,
    finished: false,
  }))

  const now = new Date()
  const seed = Math.floor(Math.random() * 1_000_000)
  const startAt = Date.now() + COUNTDOWN_MS

  await db.collection('parties').updateOne(
    { _id: party._id },
    {
      $set: {
        status: 'countdown',
        seed,
        startAt,
        players,
        lastActivity: now,
        expiresAt: touchPartyExpiry(now),
      },
    }
  )

  return { seed, startAt }
}

export async function beginPartyRacing(db: Db, code: string) {
  const now = new Date()
  await db.collection('parties').updateOne(
    { code: code.toUpperCase(), status: 'countdown' },
    {
      $set: {
        status: 'racing',
        lastActivity: now,
        expiresAt: touchPartyExpiry(now),
      },
    }
  )
}

export async function updatePartyScore(
  db: Db,
  code: string,
  userId: string,
  score: number,
  problemsSolved: number,
  finished = false
) {
  const party = await getPartyByCode(db, code)
  if (!party) throw new Error('Party not found')

  const players = party.players.map((player) =>
    player.userId === userId
      ? { ...player, score, problemsSolved, finished: finished || player.finished }
      : player
  )

  const now = new Date()
  const allFinished = players.every((player) => player.finished)
  const nextStatus = allFinished ? 'finished' : party.status

  await db.collection('parties').updateOne(
    { _id: party._id },
    {
      $set: {
        players,
        status: nextStatus,
        lastActivity: now,
        expiresAt: touchPartyExpiry(now),
      },
    }
  )

  if (nextStatus === 'finished') {
    await finalizePartyResults(db, code)
  }
}

export async function fetchUserProfile(
  db: Db,
  userId: string
): Promise<{ username: string; firstName: string } | null> {
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(userId) },
    { projection: { username: 1, firstName: 1 } }
  )

  if (!user) return null
  return { username: user.username, firstName: user.firstName }
}
