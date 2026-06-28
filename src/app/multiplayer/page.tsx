'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/Navbar'
import {
  DIFFICULTY_ORDER,
  DIFFICULTY_PRESETS,
  type Difficulty,
  type Operation,
  createSeededRandom,
  generateProblem,
  getDifficultyPreset,
} from '../../lib/problemGenerator'

interface PartyPlayer {
  userId: string
  username: string
  firstName: string
  ready: boolean
  score: number
  problemsSolved: number
  finished: boolean
}

interface PlayerRanking {
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

interface PartyState {
  code: string
  leaderId: string
  status: 'waiting' | 'countdown' | 'racing' | 'finished'
  settings: {
    duration: number
    difficulty: Difficulty
    operations: Operation[]
  }
  players: PartyPlayer[]
  seed: number | null
  startAt: number | null
  rankings: PlayerRanking[] | null
}

export default function MultiplayerPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [party, setParty] = useState<PartyState | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [userInput, setUserInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [problemsSolved, setProblemsSolved] = useState(0)
  const [currentProblem, setCurrentProblem] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scoreSyncRef = useRef(0)
  const finishedRef = useRef(false)

  const me = party?.players.find((player) => player.userId === user?.id)

  const makeProblem = useCallback(
    (partyState: PartyState, index: number) => {
      const preset = getDifficultyPreset(partyState.settings.difficulty)

      return generateProblem({
        operations: partyState.settings.operations,
        ranges: preset.ranges,
        divisionStyle: preset.divisionStyle,
        random:
          partyState.seed != null
            ? createSeededRandom(partyState.seed + index * 7919)
            : undefined,
      })
    },
    []
  )

  const fetchParty = useCallback(async (code: string) => {
    const response = await fetch(`/api/party/${code}`)
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to load party')
    }
    const data = await response.json()
    setParty(data.party)
    return data.party as PartyState
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          router.push('/login?redirect=/multiplayer')
          return
        }
        const authData = await authResponse.json()
        setUser(authData.user)
      } catch {
        router.push('/login?redirect=/multiplayer')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  useEffect(() => {
    if (!party?.code) return

    const interval = setInterval(async () => {
      try {
        await fetchParty(party.code)
      } catch {
        setError('Party expired or was closed')
        setParty(null)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [party?.code, fetchParty])

  useEffect(() => {
    if (!party?.code || party.status === 'finished') return

    const handleUnload = () => {
      const payload = JSON.stringify({ code: party.code })
      navigator.sendBeacon(
        '/api/party/leave',
        new Blob([payload], { type: 'application/json' })
      )
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [party?.code, party?.status])

  useEffect(() => {
    if (party?.status !== 'countdown' || !party.startAt) {
      setCountdown(null)
      return
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((party.startAt! - Date.now()) / 1000))
      setCountdown(remaining)
    }

    tick()
    const interval = setInterval(tick, 200)
    return () => clearInterval(interval)
  }, [party?.status, party?.startAt])

  useEffect(() => {
    if (!party || party.status !== 'racing' || !user || me?.finished) return
    if (currentProblem) return

    setCurrentProblem(makeProblem(party, problemsSolved))
    if (problemsSolved === 0) {
      setTimeLeft(party.settings.duration)
      finishedRef.current = false
    }
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [party, user, currentProblem, problemsSolved, me?.finished, makeProblem])

  useEffect(() => {
    if (!party || party.status !== 'racing' || timeLeft <= 0 || me?.finished) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!finishedRef.current) {
            finishedRef.current = true
            finishRace()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [party?.status, party?.code, me?.finished]) // eslint-disable-line react-hooks/exhaustive-deps

  const patchParty = async (body: Record<string, unknown>) => {
    if (!party) return null
    const response = await fetch(`/api/party/${party.code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Party update failed')
    setParty(data.party)
    return data.party as PartyState
  }

  const createParty = async () => {
    setError('')
    const response = await fetch('/api/party/create', { method: 'POST' })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error || 'Failed to create party')
      return
    }
    setParty(data.party)
  }

  const joinParty = async () => {
    setError('')
    const response = await fetch('/api/party/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error || 'Failed to join party')
      return
    }
    setParty(data.party)
  }

  const leaveParty = async () => {
    await fetch('/api/party/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: party?.code }),
    })
    setParty(null)
    setJoinCode('')
    setCurrentProblem(null)
    setProblemsSolved(0)
  }

  const toggleReady = async () => {
    if (!party || !user) return
    const me = party.players.find((player) => player.userId === user.id)
    await patchParty({ action: 'ready', ready: !me?.ready })
  }

  const updateSettings = async (update: Partial<PartyState['settings']>) => {
    if (!party) return
    await patchParty({ action: 'settings', ...update })
  }

  const startRace = async () => {
    try {
      await patchParty({ action: 'start' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start race')
    }
  }

  const syncScore = async (score: number, solved: number, finished = false) => {
    if (!party) return
    if (!finished && score === scoreSyncRef.current) return
    scoreSyncRef.current = score
    await patchParty({
      action: 'score',
      score,
      problemsSolved: solved,
      finished,
    })
  }

  const finishRace = async () => {
    await syncScore(problemsSolved, problemsSolved, true)
    setCurrentProblem(null)
  }

  const handleCorrectAnswer = async () => {
    const nextScore = problemsSolved + 1
    setProblemsSolved(nextScore)
    setUserInput('')
    setCurrentProblem(null)
    await syncScore(nextScore, nextScore, false)
  }

  const handleInputChange = (value: string) => {
    setUserInput(value)
    if (!currentProblem || party?.status !== 'racing') return

    const parsed = parseInt(value.trim(), 10)
    if (!Number.isNaN(parsed) && parsed === currentProblem.answer) {
      handleCorrectAnswer()
    }
  }

  const isLeader = party && user && party.leaderId === user.id
  const preset = party ? getDifficultyPreset(party.settings.difficulty) : null

  if (loading) {
    return (
      <div className="test-container flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading multiplayer...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar user={user} onLogout={() => router.push('/login')} />

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-accent mb-2">Multiplayer</h1>
          <p className="text-text-secondary">
            Race up to 4 players online. Login required. Party codes expire after 5 minutes of inactivity.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-incorrect/10 border border-incorrect text-center">
            {error}
          </div>
        )}

        {!party && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="stats-card text-left">
              <h2 className="text-2xl font-semibold mb-4">Create a party</h2>
              <p className="text-text-secondary mb-6">Start a lobby and share the code with friends.</p>
              <button onClick={createParty} className="btn-primary w-full py-3">
                Create Party
              </button>
            </div>
            <div className="stats-card text-left">
              <h2 className="text-2xl font-semibold mb-4">Join a party</h2>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="w-full mb-4 bg-bg-primary border border-gray-600 rounded px-3 py-2 font-mono tracking-widest text-center uppercase"
              />
              <button onClick={joinParty} disabled={joinCode.trim().length < 6} className="btn-primary w-full py-3 disabled:opacity-50">
                Join Party
              </button>
            </div>
          </div>
        )}

        {party && party.status === 'waiting' && (
          <div className="space-y-6">
            <div className="stats-card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-text-secondary text-sm">Party code</div>
                  <div className="text-4xl font-mono font-bold text-accent tracking-[0.3em]">{party.code}</div>
                </div>
                <button onClick={leaveParty} className="btn-secondary px-4 py-2">
                  Leave Party
                </button>
              </div>
            </div>

            <div className="stats-card text-left">
              <h2 className="text-2xl font-semibold mb-4">Players ({party.players.length}/4)</h2>
              <div className="space-y-3">
                {party.players.map((player) => (
                  <div key={player.userId} className="flex items-center justify-between p-3 rounded-lg bg-bg-primary">
                    <div>
                      <span className="font-semibold">{player.firstName}</span>
                      <span className="text-text-secondary ml-2">@{player.username}</span>
                      {party.leaderId === player.userId && (
                        <span className="ml-2 text-xs text-accent uppercase">Leader</span>
                      )}
                    </div>
                    <span className={player.ready ? 'text-correct' : 'text-text-secondary'}>
                      {player.ready ? 'Ready' : 'Not ready'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isLeader && (
              <div className="stats-card text-left">
                <h2 className="text-2xl font-semibold mb-4">Party settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-text-secondary mb-2">Duration</label>
                    <select
                      value={party.settings.duration}
                      onChange={(e) => updateSettings({ duration: Number(e.target.value) })}
                      className="w-full bg-bg-primary border border-gray-600 rounded px-3 py-2"
                    >
                      {[15, 30, 60, 120].map((time) => (
                        <option key={time} value={time}>
                          {time < 60 ? `${time}s` : `${time / 60}m`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-text-secondary mb-2">Mode</label>
                    <select
                      value={party.settings.difficulty}
                      onChange={(e) => updateSettings({ difficulty: e.target.value as Difficulty })}
                      className="w-full bg-bg-primary border border-gray-600 rounded px-3 py-2"
                    >
                      {DIFFICULTY_ORDER.filter((mode) => mode !== 'custom').map((mode) => (
                        <option key={mode} value={mode}>
                          {mode === 'classic' ? 'Zetamac Classic' : mode}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{preset?.description}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={toggleReady} className="btn-secondary px-8 py-3">
                {me?.ready ? 'Unready' : 'Ready up'}
              </button>
              {isLeader && (
                <button
                  onClick={startRace}
                  disabled={party.players.length < 2 || !party.players.every((player) => player.ready)}
                  className="btn-primary px-8 py-3 disabled:opacity-50"
                >
                  Start Race
                </button>
              )}
            </div>
          </div>
        )}

        {party && party.status === 'countdown' && (
          <div className="stats-card py-16 text-center">
            <div className="text-text-secondary mb-4">Race starting in</div>
            <div className="text-7xl font-bold text-accent">{countdown ?? 3}</div>
          </div>
        )}

        {party && party.status === 'racing' && (
          <div className="test-layout-centered">
            <div className="test-stats-bar flex flex-wrap justify-center gap-6 mb-8 text-lg">
              <div>Time: <span className="text-accent font-bold">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span></div>
              <div>Score: <span className="text-correct font-bold">{problemsSolved}</span></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 w-full max-w-2xl">
              {party.players.map((player) => (
                <div key={player.userId} className="stats-card py-3">
                  <div className="font-semibold truncate">{player.firstName}</div>
                  <div className="text-2xl text-accent">{player.score}</div>
                </div>
              ))}
            </div>

            {currentProblem && !me?.finished && (
              <div className="text-center">
                <div className="problem-display mb-6">
                  {currentProblem.operand1}{' '}
                  {currentProblem.operation === 'addition'
                    ? '+'
                    : currentProblem.operation === 'subtraction'
                      ? '−'
                      : currentProblem.operation === 'multiplication'
                        ? '×'
                        : '÷'}{' '}
                  {currentProblem.operand2} = ?
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="answer-input max-w-xs mx-auto"
                  autoFocus
                />
              </div>
            )}

            {me?.finished && (
              <div className="text-center text-text-secondary">Waiting for other players to finish...</div>
            )}
          </div>
        )}

        {party && party.status === 'finished' && (
          <div className="stats-card">
            <h2 className="text-3xl font-bold text-accent mb-6">Race Results</h2>
            <div className="space-y-3 mb-8">
              {(party.rankings?.length
                ? [...party.rankings].sort((a, b) => a.rank - b.rank)
                : [...party.players].sort((a, b) => b.score - a.score).map((player, index) => ({
                    ...player,
                    rank: index + 1,
                    eloBefore: 0,
                    eloAfter: 0,
                    eloChange: 0,
                    isWin: index === 0,
                    isLoss: false,
                  }))
              ).map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg bg-bg-primary ${
                    entry.userId === user?.id ? 'ring-2 ring-accent/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-accent w-10">#{entry.rank}</span>
                    <div>
                      <div className="font-semibold">{entry.firstName}</div>
                      {entry.isWin && (
                        <span className="text-xs text-correct uppercase tracking-wide">Winner</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                    <span className="text-xl font-mono">{entry.score} problems</span>
                    {party.rankings && (
                      <div className="text-sm font-mono">
                        <span className="text-text-secondary">{entry.eloBefore}</span>
                        <span className="text-text-secondary mx-1">→</span>
                        <span className="text-text-primary">{entry.eloAfter}</span>
                        <span
                          className={`ml-2 font-bold ${
                            entry.eloChange > 0
                              ? 'text-correct'
                              : entry.eloChange < 0
                                ? 'text-incorrect'
                                : 'text-text-secondary'
                          }`}
                        >
                          ({entry.eloChange > 0 ? '+' : ''}{entry.eloChange})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={leaveParty} className="btn-secondary px-6 py-3">
                Leave Party
              </button>
              <button onClick={() => router.push('/leaderboards')} className="btn-primary px-6 py-3">
                View Leaderboards
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
