import { ObjectId } from 'mongodb'
import type { Difficulty, Operation } from './problemGenerator'

export const PARTY_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const MAX_PARTY_PLAYERS = 4
export const PARTY_INACTIVITY_MS = 5 * 60 * 1000
export const COUNTDOWN_MS = 3000

export type PartyStatus = 'waiting' | 'countdown' | 'racing' | 'finished'

export interface PartyPlayer {
  userId: string
  username: string
  firstName: string
  ready: boolean
  score: number
  problemsSolved: number
  finished: boolean
  joinedAt: Date
}

export interface PartySettings {
  duration: number
  difficulty: Difficulty
  operations: Operation[]
}

export interface PartyDocument {
  _id?: ObjectId
  code: string
  leaderId: string
  status: PartyStatus
  settings: PartySettings
  players: PartyPlayer[]
  seed: number | null
  startAt: number | null
  lastActivity: Date
  createdAt: Date
  expiresAt: Date
  resultsProcessed?: boolean
  finishedAt?: Date
  rankings?: Array<{
    userId: string
    username: string
    firstName: string
    score: number
    rank: number
    eloBefore: number
    eloAfter: number
    eloChange: number
    isWin: boolean
    isLoss: boolean
  }>
}

export function generatePartyCode(): string {
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += PARTY_CODE_CHARS[Math.floor(Math.random() * PARTY_CODE_CHARS.length)]
  }
  return code
}

export function touchPartyExpiry(lastActivity = new Date()): Date {
  return new Date(lastActivity.getTime() + PARTY_INACTIVITY_MS)
}

export function defaultPartySettings(): PartySettings {
  return {
    duration: 120,
    difficulty: 'classic',
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
  }
}

export function serializeParty(party: PartyDocument) {
  return {
    code: party.code,
    leaderId: party.leaderId,
    status: party.status,
    settings: party.settings,
    players: party.players.map((player) => ({
      userId: player.userId,
      username: player.username,
      firstName: player.firstName,
      ready: player.ready,
      score: player.score,
      problemsSolved: player.problemsSolved,
      finished: player.finished,
    })),
    seed: party.seed,
    startAt: party.startAt,
    lastActivity: party.lastActivity,
    expiresAt: party.expiresAt,
    rankings: party.rankings ?? null,
  }
}

export function isPartyExpired(party: PartyDocument): boolean {
  return new Date() > new Date(party.expiresAt)
}

export function findPlayer(party: PartyDocument, userId: string): PartyPlayer | undefined {
  return party.players.find((player) => player.userId === userId)
}

export function isLeader(party: PartyDocument, userId: string): boolean {
  return party.leaderId === userId
}

export async function ensurePartyIndexes(db: { collection: (name: string) => any }) {
  const parties = db.collection('parties')
  await parties.createIndex({ code: 1 }, { unique: true })
  await parties.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  await parties.createIndex({ 'players.userId': 1 })
}
