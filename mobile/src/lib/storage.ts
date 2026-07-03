import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ModeCategory, ModeId } from './modes'

export interface SessionRecord {
  id: string
  modeId: ModeId
  modeTitle: string
  category: ModeCategory
  score: number
  totalProblems: number
  correctAnswers: number
  duration: number
  ppm: number
  completedAt: string
}

export interface ProfileStats {
  totalSessions: number
  bestScore: number
  averageScore: number
  totalProblems: number
  bestPpm: number
  lastPlayedAt: string | null
  bestByMode: Record<string, number>
  bestPpmByMode: Record<string, number>
  trainingAverageByMode: Record<string, number>
  rankedSessions: SessionRecord[]
  trainingSessions: SessionRecord[]
  contributionDays: ContributionDay[]
  ppmTrend: TrendPoint[]
}

const SESSIONS_KEY = '@monkeymac/sessions'

export interface ContributionDay {
  date: string
  count: number
}

export interface TrendPoint {
  x: number
  y: number
  trendY: number
}

function normalizeSession(session: SessionRecord & { accuracy?: number }): SessionRecord {
  return {
    id: session.id,
    modeId: session.modeId ?? 'classic',
    modeTitle: session.modeTitle ?? 'Zetamac Classic',
    category: session.category ?? 'ranked',
    score: session.score,
    totalProblems: session.totalProblems,
    correctAnswers: session.correctAnswers,
    duration: session.duration,
    ppm: session.ppm,
    completedAt: session.completedAt,
  }
}

export async function loadSessions(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY)
  if (!raw) return []
  try {
    return (JSON.parse(raw) as SessionRecord[]).map(normalizeSession)
  } catch {
    return []
  }
}

export async function saveSession(session: SessionRecord): Promise<void> {
  const sessions = await loadSessions()
  sessions.unshift(session)
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 500)))
}

export async function clearSessions(): Promise<void> {
  await AsyncStorage.removeItem(SESSIONS_KEY)
}

function emptyStats(): ProfileStats {
  return {
    totalSessions: 0,
    bestScore: 0,
    averageScore: 0,
    totalProblems: 0,
    bestPpm: 0,
    lastPlayedAt: null,
    bestByMode: {},
    bestPpmByMode: {},
    trainingAverageByMode: {},
    rankedSessions: [],
    trainingSessions: [],
    contributionDays: buildContributionDays([]),
    ppmTrend: [],
  }
}

function buildContributionDays(sessions: SessionRecord[]): ContributionDay[] {
  const counts = new Map<string, number>()
  for (const session of sessions) {
    const date = session.completedAt.slice(0, 10)
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }

  const days: ContributionDay[] = []
  const today = new Date()
  for (let offset = 41; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    days.push({ date: key, count: counts.get(key) ?? 0 })
  }
  return days
}

function computeTrend(sessions: SessionRecord[]): TrendPoint[] {
  const ordered = [...sessions].reverse()
  if (ordered.length === 0) return []

  const n = ordered.length
  const sumX = ordered.reduce((sum, _session, index) => sum + index, 0)
  const sumY = ordered.reduce((sum, session) => sum + session.ppm, 0)
  const sumXY = ordered.reduce((sum, session, index) => sum + index * session.ppm, 0)
  const sumXX = ordered.reduce((sum, _session, index) => sum + index * index, 0)
  const denominator = n * sumXX - sumX * sumX
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator
  const intercept = n === 0 ? 0 : (sumY - slope * sumX) / n

  return ordered.map((session, index) => ({
    x: index,
    y: session.ppm,
    trendY: Math.round((intercept + slope * index) * 10) / 10,
  }))
}

export function computeProfileStats(sessions: SessionRecord[]): ProfileStats {
  if (sessions.length === 0) {
    return emptyStats()
  }

  const totalProblems = sessions.reduce((sum, s) => sum + s.totalProblems, 0)
  const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
  const bestByMode: Record<string, number> = {}
  const bestPpmByMode: Record<string, number> = {}
  const trainingTotals: Record<string, { ppm: number; count: number }> = {}
  const rankedSessions = sessions.filter((session) => session.category === 'ranked')
  const trainingSessions = sessions.filter((session) => session.category === 'training')

  for (const session of sessions) {
    bestByMode[session.modeId] = Math.max(bestByMode[session.modeId] ?? 0, session.score)
    bestPpmByMode[session.modeId] = Math.max(bestPpmByMode[session.modeId] ?? 0, session.ppm)
    if (session.category === 'training') {
      const current = trainingTotals[session.modeId] ?? { ppm: 0, count: 0 }
      current.ppm += session.ppm
      current.count += 1
      trainingTotals[session.modeId] = current
    }
  }

  const trainingAverageByMode = Object.fromEntries(
    Object.entries(trainingTotals).map(([modeId, value]) => [
      modeId,
      Math.round((value.ppm / value.count) * 10) / 10,
    ])
  )

  return {
    totalSessions: sessions.length,
    bestScore: Math.max(...sessions.map((s) => s.score)),
    averageScore: Math.round(averageScore * 10) / 10,
    totalProblems,
    bestPpm: Math.max(...sessions.map((s) => s.ppm)),
    lastPlayedAt: sessions[0]?.completedAt ?? null,
    bestByMode,
    bestPpmByMode,
    trainingAverageByMode,
    rankedSessions,
    trainingSessions,
    contributionDays: buildContributionDays(sessions),
    ppmTrend: computeTrend(rankedSessions.length > 0 ? rankedSessions : sessions),
  }
}
