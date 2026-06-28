export const DEFAULT_ELO = 1200
export const K_FACTOR_NEW = 32
export const K_FACTOR_ESTABLISHED = 16
export const ESTABLISHED_GAMES = 20

export function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + 10 ** ((opponentElo - playerElo) / 400))
}

export function getKFactor(gamesPlayed: number): number {
  return gamesPlayed < ESTABLISHED_GAMES ? K_FACTOR_NEW : K_FACTOR_ESTABLISHED
}

/** Placement-based ELO update for multiplayer (1st = win, last = loss, middle = draw-ish). */
export function calculatePlacementEloChange(
  playerElo: number,
  opponentElos: number[],
  placement: number,
  totalPlayers: number,
  gamesPlayed: number
): number {
  if (totalPlayers < 2 || opponentElos.length === 0) return 0

  const k = getKFactor(gamesPlayed)
  const actual = totalPlayers > 1 ? (totalPlayers - placement) / (totalPlayers - 1) : 0.5
  const avgOpponent = opponentElos.reduce((sum, elo) => sum + elo, 0) / opponentElos.length
  const expected = expectedScore(playerElo, avgOpponent)

  return Math.round(k * (actual - expected))
}
