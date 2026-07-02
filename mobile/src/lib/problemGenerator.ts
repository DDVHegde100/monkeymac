export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division'

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
  zetamacWeighted?: boolean
  history?: import('./zetamacEngine').ProblemHistory
}

export const CLASSIC_RANGES: DifficultyRanges = {
  addition: { min: 2, max: 100 },
  subtraction: { min: 2, max: 100 },
  multiplication: { min: 2, max: 12 },
  division: { min: 2, max: 12 },
}

export const CLASSIC_OPERATIONS: Operation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
]

export function createProblemId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function getOperationSymbol(operation: Operation): string {
  switch (operation) {
    case 'addition':
      return '+'
    case 'subtraction':
      return '−'
    case 'multiplication':
      return '×'
    case 'division':
      return '÷'
    default:
      return '?'
  }
}

import { generateZetamacWeightedProblem } from './zetamacEngine'

function randomInt(min: number, max: number, random: () => number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function pickOperation(operations: Operation[], random: () => number): Operation {
  return operations[Math.floor(random() * operations.length)]
}

function generateDivision(
  range: OperationRange,
  random: () => number
): Pick<GeneratedProblem, 'operand1' | 'operand2' | 'answer'> {
  const factorA = randomInt(range.min, range.max, random)
  const factorB = randomInt(range.min, range.max, random)
  const dividend = factorA * factorB
  if (random() < 0.5) {
    return { operand1: dividend, operand2: factorA, answer: factorB }
  }
  return { operand1: dividend, operand2: factorB, answer: factorA }
}

export function generateProblem(options: GenerateProblemOptions): GeneratedProblem {
  if (options.zetamacWeighted) {
    return generateZetamacWeightedProblem(options)
  }

  const random = options.random ?? Math.random
  const operations = options.operations.length > 0 ? options.operations : CLASSIC_OPERATIONS
  const operation = pickOperation(operations, random)
  const range = options.ranges[operation]

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
    default: {
      const result = generateDivision(range, random)
      operand1 = result.operand1
      operand2 = result.operand2
      answer = result.answer
    }
  }

  return {
    id: createProblemId(),
    operation,
    operand1,
    operand2,
    answer,
  }
}
