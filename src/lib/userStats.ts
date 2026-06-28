export const DEFAULT_ELO = 1200

export interface UserStats {
  totalTests: number
  bestScore: number
  averageScore: number
  totalProblems: number
  accuracy: number
  totalTimeSpent?: number
  averagePPM?: number
  testsRestarted?: number
  elo: number
  multiplayerWins: number
  multiplayerLosses: number
  multiplayerGames: number
}

export const DEFAULT_USER_STATS: UserStats = {
  totalTests: 0,
  bestScore: 0,
  averageScore: 0,
  totalProblems: 0,
  accuracy: 0,
  totalTimeSpent: 0,
  averagePPM: 0,
  testsRestarted: 0,
  elo: DEFAULT_ELO,
  multiplayerWins: 0,
  multiplayerLosses: 0,
  multiplayerGames: 0,
}

export function normalizeUserStats(raw?: Partial<UserStats> | null): UserStats {
  return {
    ...DEFAULT_USER_STATS,
    ...raw,
    elo: typeof raw?.elo === 'number' ? raw.elo : DEFAULT_ELO,
    multiplayerWins: raw?.multiplayerWins ?? 0,
    multiplayerLosses: raw?.multiplayerLosses ?? 0,
    multiplayerGames: raw?.multiplayerGames ?? 0,
  }
}

export function getRankTitle(elo: number): string {
  if (elo >= 1800) return 'Grandmaster'
  if (elo >= 1600) return 'Expert'
  if (elo >= 1400) return 'Advanced'
  if (elo >= 1200) return 'Intermediate'
  return 'Novice'
}
