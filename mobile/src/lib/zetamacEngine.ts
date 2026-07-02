import type { GeneratedProblem, GenerateProblemOptions, Operation, OperationRange } from './problemGenerator'
import { createProblemId } from './problemGenerator'

const HISTORY_SIZE = 10
const CANDIDATE_COUNT = 20

/** Operand weights for 2–12 (Zetamac multiplication / division feel). */
const SMALL_OPERAND_WEIGHTS: Record<number, number> = {
  2: 1,
  3: 1,
  4: 2,
  5: 3,
  6: 4,
  7: 5,
  8: 5,
  9: 5,
  10: 4,
  11: 3,
  12: 2,
}

export interface ProblemHistoryEntry {
  operation: Operation
  operand1: number
  operand2: number
  answer: number
}

export interface ProblemHistory {
  recent: ProblemHistoryEntry[]
  answerFrequency: Map<number, number>
}

export function createProblemHistory(): ProblemHistory {
  return { recent: [], answerFrequency: new Map() }
}

export function recordProblemHistory(history: ProblemHistory, problem: GeneratedProblem): void {
  history.recent.push({
    operation: problem.operation,
    operand1: problem.operand1,
    operand2: problem.operand2,
    answer: problem.answer,
  })
  if (history.recent.length > HISTORY_SIZE) {
    const removed = history.recent.shift()!
    const count = history.answerFrequency.get(removed.answer) ?? 0
    if (count <= 1) history.answerFrequency.delete(removed.answer)
    else history.answerFrequency.set(removed.answer, count - 1)
  }
  history.answerFrequency.set(problem.answer, (history.answerFrequency.get(problem.answer) ?? 0) + 1)
}

function pickUniform<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

function pickWeightedOperation(operations: Operation[], random: () => number): Operation {
  return pickUniform(operations, random)
}

function buildWeightTable(min: number, max: number): number[] {
  const weights: number[] = []
  for (let n = min; n <= max; n += 1) {
    if (n >= 2 && n <= 12 && max <= 12) {
      weights.push(SMALL_OPERAND_WEIGHTS[n] ?? 1)
    } else {
      // Mid-to-high bias for larger ranges (addition/subtraction 2–100)
      const peak = min + (max - min) * 0.65
      const spread = (max - min) * 0.35
      const dist = Math.abs(n - peak) / spread
      weights.push(Math.max(1, 6 - dist * 2))
    }
  }
  return weights
}

function pickWeightedInt(min: number, max: number, random: () => number): number {
  const weights = buildWeightTable(min, max)
  const total = weights.reduce((sum, w) => sum + w, 0)
  let roll = random() * total
  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i]
    if (roll <= 0) return min + i
  }
  return max
}

type Bucket = 'easy' | 'medium' | 'hard'

function pickBucket(random: () => number): Bucket {
  const roll = random()
  if (roll < 0.2) return 'easy'
  if (roll < 0.6) return 'medium'
  return 'hard'
}

function bucketRange(min: number, max: number, bucket: Bucket): OperationRange {
  const span = max - min
  if (span <= 10) {
    return { min, max }
  }
  switch (bucket) {
    case 'easy':
      return { min, max: Math.min(max, min + Math.floor(span * 0.3)) }
    case 'medium':
      return {
        min: min + Math.floor(span * 0.3),
        max: min + Math.floor(span * 0.7),
      }
    default:
      return { min: min + Math.floor(span * 0.55), max }
  }
}

function pickOperandInRange(range: OperationRange, random: () => number): number {
  return pickWeightedInt(range.min, range.max, random)
}

function multiplicationDifficultyScore(a: number, b: number): number {
  const product = a * b
  const tableBoost =
    (SMALL_OPERAND_WEIGHTS[a] ?? 1) * (SMALL_OPERAND_WEIGHTS[b] ?? 1)
  return (product / 144) * 0.6 + (tableBoost / 25) * 0.4
}

function isTrivial(problem: GeneratedProblem): boolean {
  const { operation, operand1: a, operand2: b, answer } = problem
  if (operation === 'multiplication' && (a === 1 || b === 1)) return true
  if (operation === 'division' && (b === 1 || answer === 1)) return true
  if (operation === 'addition' && (a === 0 || b === 0)) return true
  if (operation === 'subtraction' && (a === b || b === 0)) return true
  return false
}

function isBoring(problem: GeneratedProblem, random: () => number): boolean {
  const { operation, operand1: a, operand2: b, answer } = problem

  if (isTrivial(problem)) return true

  if (a === b) {
    if (operation === 'addition' || operation === 'multiplication') {
      return random() < 0.7
    }
    if (operation === 'subtraction' && answer === 0) return random() < 0.85
  }

  if (operation === 'multiplication' && a * b <= 6 && random() < 0.5) return true
  if (operation === 'division' && a === b && random() < 0.7) return true

  return false
}

function matchesRecent(
  problem: GeneratedProblem,
  history: ProblemHistory
): boolean {
  for (const prev of history.recent) {
    if (prev.operation !== problem.operation) continue
    if (prev.answer === problem.answer) return true
    if (prev.operand1 === problem.operand1 && prev.operand2 === problem.operand2) return true
    if (prev.operand1 === problem.operand2 && prev.operand2 === problem.operand1) return true
  }
  return false
}

function answerBalanceWeight(answer: number, history: ProblemHistory): number {
  const freq = history.answerFrequency.get(answer) ?? 0
  return 1 / (freq + 1)
}

function scoreCandidate(problem: GeneratedProblem, history: ProblemHistory): number {
  if (matchesRecent(problem, history)) return 0

  let difficulty = 1
  if (problem.operation === 'multiplication') {
    difficulty = 0.5 + multiplicationDifficultyScore(problem.operand1, problem.operand2)
  } else if (problem.operation === 'addition' || problem.operation === 'subtraction') {
    difficulty = 0.4 + (problem.operand1 + problem.operand2) / 200
  } else if (problem.operation === 'division') {
    difficulty = 0.5 + multiplicationDifficultyScore(problem.answer, problem.operand2)
  }

  const operandWeight =
    (buildWeightTable(2, 12)[problem.operand1 - 2] ?? 1) *
    (buildWeightTable(2, 12)[Math.min(problem.operand2, 12) - 2] ?? 1)

  const novelty = problem.operand1 === problem.operand2 ? 0.35 : 1
  const answerBalance = answerBalanceWeight(problem.answer, history)

  return difficulty * Math.sqrt(operandWeight) * novelty * answerBalance
}

function buildCandidate(
  operation: Operation,
  ranges: GenerateProblemOptions['ranges'],
  divisionStyle: GenerateProblemOptions['divisionStyle'],
  random: () => number
): GeneratedProblem | null {
  const range = ranges[operation]
  let operand1: number
  let operand2: number
  let answer: number

  switch (operation) {
    case 'addition': {
      const bucket = pickBucket(random)
      const bucketed = bucketRange(range.min, range.max, bucket)
      operand1 = pickOperandInRange(bucketed, random)
      operand2 = pickOperandInRange(bucketed, random)
      answer = operand1 + operand2
      break
    }
    case 'subtraction': {
      const bucket = pickBucket(random)
      const bucketed = bucketRange(range.min, range.max, bucket)
      operand1 = pickOperandInRange(bucketed, random)
      const low = Math.max(range.min, bucketed.min)
      operand2 = pickWeightedInt(low, operand1, random)
      answer = operand1 - operand2
      break
    }
    case 'multiplication':
      operand1 = pickWeightedInt(range.min, range.max, random)
      operand2 = pickWeightedInt(range.min, range.max, random)
      answer = operand1 * operand2
      break
    case 'division': {
      if (divisionStyle === 'reverse-multiply') {
        answer = pickWeightedInt(range.min, range.max, random)
        operand2 = pickWeightedInt(range.min, range.max, random)
        operand1 = answer * operand2
      } else {
        answer = pickWeightedInt(range.min, range.max, random)
        operand2 = pickWeightedInt(range.min, range.max, random)
        operand1 = answer * operand2
      }
      break
    }
    default:
      return null
  }

  const problem: GeneratedProblem = {
    id: createProblemId(),
    operation,
    operand1,
    operand2,
    answer,
  }

  if (isTrivial(problem)) return null
  if (isBoring(problem, random)) return null

  return problem
}

export interface ZetamacGenerateOptions extends GenerateProblemOptions {
  history?: ProblemHistory
}

export function generateZetamacWeightedProblem(options: ZetamacGenerateOptions): GeneratedProblem {
  const random = options.random ?? Math.random
  const operations =
    options.operations.length > 0 ? options.operations : (['addition'] as Operation[])
  const divisionStyle = options.divisionStyle ?? 'reverse-multiply'
  const history = options.history ?? createProblemHistory()

  let best: GeneratedProblem | null = null
  let bestScore = -1

  for (let i = 0; i < CANDIDATE_COUNT; i += 1) {
    const operation = pickWeightedOperation(operations, random)
    const candidate = buildCandidate(operation, options.ranges, divisionStyle, random)
    if (!candidate) continue

    const score = scoreCandidate(candidate, history)
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }

  if (best) {
    return { ...best, id: createProblemId() }
  }

  // Fallback: one unweighted attempt
  const operation = pickWeightedOperation(operations, random)
  const fallback = buildCandidate(operation, options.ranges, divisionStyle, random)
  if (fallback) return { ...fallback, id: createProblemId() }

  return {
    id: createProblemId(),
    operation: 'addition',
    operand1: 7,
    operand2: 8,
    answer: 15,
  }
}

export function usesZetamacWeighting(difficulty: string): boolean {
  return difficulty === 'classic' || difficulty === 'medium'
}
