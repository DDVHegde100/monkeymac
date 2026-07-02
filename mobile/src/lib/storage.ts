import AsyncStorage from '@react-native-async-storage/async-storage'

export interface SessionRecord {
  id: string
  score: number
  totalProblems: number
  correctAnswers: number
  accuracy: number
  duration: number
  ppm: number
  completedAt: string
}

export interface ProfileStats {
  totalSessions: number
  bestScore: number
  averageScore: number
  totalProblems: number
  averageAccuracy: number
  bestPpm: number
  lastPlayedAt: string | null
}

const SESSIONS_KEY = '@monkeymac/sessions'

export async function loadSessions(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as SessionRecord[]
  } catch {
    return []
  }
}

export async function saveSession(session: SessionRecord): Promise<void> {
  const sessions = await loadSessions()
  sessions.unshift(session)
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 200)))
}

export async function clearSessions(): Promise<void> {
  await AsyncStorage.removeItem(SESSIONS_KEY)
}

export function computeProfileStats(sessions: SessionRecord[]): ProfileStats {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      bestScore: 0,
      averageScore: 0,
      totalProblems: 0,
      averageAccuracy: 0,
      bestPpm: 0,
      lastPlayedAt: null,
    }
  }

  const totalProblems = sessions.reduce((sum, s) => sum + s.totalProblems, 0)
  const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
  const averageAccuracy = sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length

  return {
    totalSessions: sessions.length,
    bestScore: Math.max(...sessions.map((s) => s.score)),
    averageScore: Math.round(averageScore * 10) / 10,
    totalProblems,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    bestPpm: Math.max(...sessions.map((s) => s.ppm)),
    lastPlayedAt: sessions[0]?.completedAt ?? null,
  }
}
