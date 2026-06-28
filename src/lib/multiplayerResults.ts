import { Db, ObjectId } from 'mongodb'
import { calculatePlacementEloChange } from './elo'
import { normalizeUserStats } from './userStats'
import type { PartyDocument, PartyPlayer } from './party'

export interface PlayerRanking {
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
}

export interface MultiplayerResultSummary {
  partyCode: string
  rankings: PlayerRanking[]
}

function computeRanks(players: PartyPlayer[]): Array<PartyPlayer & { rank: number }> {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const ranked: Array<PartyPlayer & { rank: number }> = []
  let rank = 1

  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      rank = i + 1
    }
    ranked.push({ ...sorted[i], rank })
  }

  return ranked
}

export async function finalizePartyResults(
  db: Db,
  code: string
): Promise<MultiplayerResultSummary | null> {
  const parties = db.collection('parties')

  const locked = await parties.findOneAndUpdate(
    {
      code: code.toUpperCase(),
      status: 'finished',
      resultsProcessed: { $ne: true },
    },
    { $set: { resultsProcessed: true, finishedAt: new Date() } },
    { returnDocument: 'before' }
  )

  const party = locked as PartyDocument | null
  if (!party || party.players.length < 2) {
    return null
  }

  const rankedPlayers = computeRanks(party.players)
  const maxRank = Math.max(...rankedPlayers.map((player) => player.rank))
  const userIds = rankedPlayers.map((player) => new ObjectId(player.userId))

  const users = await db
    .collection('users')
    .find({ _id: { $in: userIds } })
    .toArray()

  const userMap = new Map(users.map((user) => [user._id.toString(), user]))
  const rankings: PlayerRanking[] = []

  for (const player of rankedPlayers) {
    const user = userMap.get(player.userId)
    if (!user) continue

    const stats = normalizeUserStats(user.stats)
    const opponentElos = rankedPlayers
      .filter((other) => other.userId !== player.userId)
      .map((other) => normalizeUserStats(userMap.get(other.userId)?.stats).elo)

    const eloChange = calculatePlacementEloChange(
      stats.elo,
      opponentElos,
      player.rank,
      rankedPlayers.length,
      stats.multiplayerGames
    )

    const eloAfter = Math.max(100, stats.elo + eloChange)
    const isWin = player.rank === 1
    const isLoss = player.rank === maxRank && maxRank > 1 && rankedPlayers.length > 1 && !isWin

    rankings.push({
      userId: player.userId,
      username: player.username,
      firstName: player.firstName,
      score: player.score,
      rank: player.rank,
      eloBefore: stats.elo,
      eloAfter,
      eloChange,
      isWin,
      isLoss,
    })

    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          'stats.elo': eloAfter,
          'stats.multiplayerGames': stats.multiplayerGames + 1,
          'stats.multiplayerWins': stats.multiplayerWins + (isWin ? 1 : 0),
          'stats.multiplayerLosses': stats.multiplayerLosses + (isLoss ? 1 : 0),
          updatedAt: new Date(),
        },
      }
    )
  }

  await db.collection('multiplayer_results').insertOne({
    partyCode: party.code,
    leaderId: party.leaderId,
    settings: party.settings,
    seed: party.seed,
    playerCount: rankedPlayers.length,
    rankings,
    createdAt: new Date(),
  })

  await parties.updateOne(
    { _id: party._id },
    { $set: { rankings } }
  )

  return { partyCode: party.code, rankings }
}

export async function getPartyRankings(db: Db, code: string): Promise<PlayerRanking[] | null> {
  const party = await db.collection('parties').findOne({ code: code.toUpperCase() })
  if (!party?.rankings) return null
  return party.rankings as PlayerRanking[]
}
