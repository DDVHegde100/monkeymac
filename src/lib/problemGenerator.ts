export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division'
export type Difficulty = 'easy' | 'classic' | 'medium' | 'hard' | 'abstract' | 'custom'

export interface OperationRange {
  min: number
  max: number
}

export interface DifficultyRanges {
  addition: OperationRange
  subtraction: OperationRange
  multiplication: OperationRange
  division: OperationRange
}

export interface DifficultyPreset {
  id: Difficulty
  label: string
  description: string
  ranges: DifficultyRanges
  divisionStyle: 'reverse-multiply' | 'quotient-first'
  defaultDuration: number
  lockDuration?: number
  lockOperations: boolean
  abstractTimeLimit?: number
}

export interface GeneratedProblem {
  id: string
  operation: Operation
  operand1: number
  operand2: number
  answer: number
}

export interface GenerateProblemOptions {
  operations: Operation[]
  ranges: DifficultyRanges
  divisionStyle?: 'reverse-multiply' | 'quotient-first'
  random?: () => number
}

const ZETAMAC_RANGES: DifficultyRanges = {
  addition: { min: 2, max: 100 },
  subtraction: { min: 2, max: 100 },
  multiplication: { min: 2, max: 12 },
  division: { min: 2, max: 12 },
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyPreset> = {
  easy: {
    id: 'easy',
    label: 'easy',
    description: 'Small numbers, simple operations',
    ranges: {
      addition: { min: 1, max: 20 },
      subtraction: { min: 1, max: 20 },
      multiplication: { min: 1, max: 5 },
      division: { min: 1, max: 25 },
    },
    divisionStyle: 'quotient-first',
    defaultDuration: 60,
    lockOperations: false,
  },
  classic: {
    id: 'classic',
    label: 'classic',
    description: 'Exact Zetamac ranges — 120s, all four operations',
    ranges: ZETAMAC_RANGES,
    divisionStyle: 'reverse-multiply',
    defaultDuration: 120,
    lockDuration: 120,
    lockOperations: true,
  },
  medium: {
    id: 'medium',
    label: 'medium',
    description: 'Zetamac number ranges with custom time and operations',
    ranges: ZETAMAC_RANGES,
    divisionStyle: 'reverse-multiply',
    defaultDuration: 120,
    lockOperations: false,
  },
  hard: {
    id: 'hard',
    label: 'hard',
    description: 'Large numbers, complex calculations',
    ranges: {
      addition: { min: 10, max: 999 },
      subtraction: { min: 10, max: 999 },
      multiplication: { min: 1, max: 25 },
      division: { min: 1, max: 625 },
    },
    divisionStyle: 'quotient-first',
    defaultDuration: 120,
    lockOperations: false,
  },
  abstract: {
    id: 'abstract',
    label: 'abstract',
    description: 'Hard problems that change every 4 seconds',
    ranges: {
      addition: { min: 50, max: 9999 },
      subtraction: { min: 50, max: 9999 },
      multiplication: { min: 10, max: 99 },
      division: { min: 1, max: 9801 },
    },
    divisionStyle: 'quotient-first',
    defaultDuration: 120,
    lockOperations: false,
    abstractTimeLimit: 4,
  },
  custom: {
    id: 'custom',
    label: 'custom',
    description: 'Configure duration, operations, and ranges freely',
    ranges: ZETAMAC_RANGES,
    divisionStyle: 'reverse-multiply',
    defaultDuration: 60,
    lockOperations: false,
  },
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'classic', 'medium', 'hard', 'abstract', 'custom']

export function getDifficultyPreset(difficulty: Difficulty): DifficultyPreset {
  return DIFFICULTY_PRESETS[difficulty]
}

export function getDifficultyRanges(difficulty: Difficulty): DifficultyRanges {
  return { ...getDifficultyPreset(difficulty).ranges }
}

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function pickOperation(operations: Operation[], random: () => number): Operation {
  return operations[Math.floor(random() * operations.length)]
}

function generateDivision(
  range: OperationRange,
  style: 'reverse-multiply' | 'quotient-first',
  random: () => number
): Pick<GeneratedProblem, 'operand1' | 'operand2' | 'answer'> {
  if (style === 'reverse-multiply') {
    const factorA = randomInt(range.min, range.max, random)
    const factorB = randomInt(range.min, range.max, random)
    const dividend = factorA * factorB

    if (random() < 0.5) {
      return { operand1: dividend, operand2: factorA, answer: factorB }
    }

    return { operand1: dividend, operand2: factorB, answer: factorA }
  }

  const quotient = randomInt(range.min, range.max, random)
  const divisor = randomInt(range.min, range.max, random)
  return { operand1: quotient * divisor, operand2: divisor, answer: quotient }
}

export function generateProblem(options: GenerateProblemOptions): GeneratedProblem {
  const random = options.random ?? Math.random
  const availableOps = options.operations.length > 0 ? options.operations : (['addition'] as Operation[])
  const operation = pickOperation(availableOps, random)
  const range = options.ranges[operation]
  const divisionStyle = options.divisionStyle ?? 'reverse-multiply'

  let operand1: number
  let operand2: number
  let answer: number

  switch (operation) {
    case 'addition':
      operand1 = randomInt(range.min, range.max, random)
      operand2 = randomInt(range.min, range.max, random)
      answer = operand1 + operand2
      break
    case 'subtraction':
      operand1 = randomInt(range.min, range.max, random)
      operand2 = randomInt(range.min, operand1, random)
      answer = operand1 - operand2
      break
    case 'multiplication':
      operand1 = randomInt(range.min, range.max, random)
      operand2 = randomInt(range.min, range.max, random)
      answer = operand1 * operand2
      break
    case 'division': {
      const result = generateDivision(range, divisionStyle, random)
      operand1 = result.operand1
      operand2 = result.operand2
      answer = result.answer
      break
    }
    default:
      operand1 = 1
      operand2 = 1
      answer = 2
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    operation,
    operand1,
    operand2,
    answer,
  }
}

export function createProblemId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

/** Validates generated operands stay within expected Zetamac classic bounds. */
export function isWithinZetamacClassicBounds(problem: GeneratedProblem): boolean {
  const preset = DIFFICULTY_PRESETS.classic

  switch (problem.operation) {
    case 'addition':
    case 'subtraction':
      return (
        problem.operand1 >= preset.ranges.addition.min &&
        problem.operand1 <= preset.ranges.addition.max &&
        problem.operand2 >= preset.ranges.addition.min &&
        problem.operand2 <= preset.ranges.addition.max
      )
    case 'multiplication':
      return (
        problem.operand1 >= preset.ranges.multiplication.min &&
        problem.operand1 <= preset.ranges.multiplication.max &&
        problem.operand2 >= preset.ranges.multiplication.min &&
        problem.operand2 <= preset.ranges.multiplication.max
      )
    case 'division':
      return (
        problem.operand2 >= preset.ranges.division.min &&
        problem.operand2 <= preset.ranges.division.max &&
        problem.answer >= preset.ranges.division.min &&
        problem.answer <= preset.ranges.division.max &&
        problem.operand1 === problem.operand2 * problem.answer
      )
    default:
      return false
  }
}

function isWithinRange(value: number, range: OperationRange): boolean {
  return value >= range.min && value <= range.max
}

export function validateProblemForDifficulty(
  problem: GeneratedProblem,
  difficulty: Difficulty
): boolean {
  const preset = DIFFICULTY_PRESETS[difficulty]

  switch (problem.operation) {
    case 'addition':
    case 'subtraction':
      return (
        isWithinRange(problem.operand1, preset.ranges.addition) &&
        isWithinRange(problem.operand2, preset.ranges.addition) &&
        (problem.operation !== 'subtraction' || problem.operand1 >= problem.operand2)
      )
    case 'multiplication':
      return (
        isWithinRange(problem.operand1, preset.ranges.multiplication) &&
        isWithinRange(problem.operand2, preset.ranges.multiplication) &&
        problem.answer === problem.operand1 * problem.operand2
      )
    case 'division':
      if (problem.operand1 !== problem.operand2 * problem.answer) return false
      if (preset.divisionStyle === 'reverse-multiply') {
        return (
          isWithinRange(problem.operand2, preset.ranges.division) &&
          isWithinRange(problem.answer, preset.ranges.division)
        )
      }
      return (
        isWithinRange(problem.answer, preset.ranges.division) &&
        isWithinRange(problem.operand2, preset.ranges.division)
      )
    default:
      return false
  }
}

export function validateDifficultyGeneration(
  difficulty: Difficulty,
  iterations = 200
): { valid: boolean; failures: number } {
  const preset = DIFFICULTY_PRESETS[difficulty]
  const operations: Operation[] = ['addition', 'subtraction', 'multiplication', 'division']
  let failures = 0

  for (let i = 0; i < iterations; i += 1) {
    const problem = generateProblem({
      operations,
      ranges: preset.ranges,
      divisionStyle: preset.divisionStyle,
    })

    if (!validateProblemForDifficulty(problem, difficulty)) {
      failures += 1
    }
  }

  return { valid: failures === 0, failures }
}
