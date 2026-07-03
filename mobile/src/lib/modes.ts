import type { DifficultyRanges, Operation } from './problemGenerator'
import { CLASSIC_OPERATIONS, CLASSIC_RANGES } from './problemGenerator'

export type ModeCategory = 'ranked' | 'training'
export type ModeId =
  | 'classic'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'train-addition'
  | 'train-subtraction'
  | 'train-multiplication'
  | 'train-division'

export const DURATIONS = [30, 60, 120, 240] as const
export type TestDuration = (typeof DURATIONS)[number]

export interface ModeDefinition {
  id: ModeId
  title: string
  shortTitle: string
  detail: string
  description: string
  category: ModeCategory
  operations: Operation[]
  ranges: DifficultyRanges
  defaultDuration: TestDuration
  zetamacWeighted: boolean
  divisionStyle: 'reverse-multiply' | 'quotient-first'
  accent: string
}

const EASY_RANGES: DifficultyRanges = {
  addition: { min: 2, max: 30 },
  subtraction: { min: 2, max: 30 },
  multiplication: { min: 2, max: 8 },
  division: { min: 2, max: 8 },
}

const MEDIUM_RANGES: DifficultyRanges = {
  addition: { min: 2, max: 80 },
  subtraction: { min: 2, max: 80 },
  multiplication: { min: 2, max: 12, rightMin: 2, rightMax: 50 },
  division: { min: 2, max: 12, rightMin: 2, rightMax: 50 },
}

const HARD_RANGES: DifficultyRanges = {
  addition: { min: 25, max: 250 },
  subtraction: { min: 25, max: 250 },
  multiplication: { min: 6, max: 19, rightMin: 12, rightMax: 125 },
  division: { min: 6, max: 19, rightMin: 12, rightMax: 125 },
}

export const MODES: Record<ModeId, ModeDefinition> = {
  classic: {
    id: 'classic',
    title: 'Zetamac Classic',
    shortTitle: 'Classic',
    detail: '2 minutes · all operations',
    description: 'Addition and subtraction from 2-100, multiplication 2-12 by 2-100, division in reverse.',
    category: 'ranked',
    operations: CLASSIC_OPERATIONS,
    ranges: CLASSIC_RANGES,
    defaultDuration: 120,
    zetamacWeighted: true,
    divisionStyle: 'reverse-multiply',
    accent: '#ffd54f',
  },
  easy: {
    id: 'easy',
    title: 'Easy',
    shortTitle: 'Easy',
    detail: 'Small numbers · clean warmup',
    description: 'Lower ranges for fast rhythm and confidence.',
    category: 'ranked',
    operations: CLASSIC_OPERATIONS,
    ranges: EASY_RANGES,
    defaultDuration: 60,
    zetamacWeighted: false,
    divisionStyle: 'reverse-multiply',
    accent: '#86efac',
  },
  medium: {
    id: 'medium',
    title: 'Medium',
    shortTitle: 'Medium',
    detail: 'Zetamac-ish · slightly lighter',
    description: 'Mixed operations with weighted operands and a smaller multiplication ceiling.',
    category: 'ranked',
    operations: CLASSIC_OPERATIONS,
    ranges: MEDIUM_RANGES,
    defaultDuration: 120,
    zetamacWeighted: true,
    divisionStyle: 'reverse-multiply',
    accent: '#60a5fa',
  },
  hard: {
    id: 'hard',
    title: 'Hard',
    shortTitle: 'Hard',
    detail: 'Large ranges · heavy scoring',
    description: 'Bigger addition, subtraction, multiplication, and reverse division.',
    category: 'ranked',
    operations: CLASSIC_OPERATIONS,
    ranges: HARD_RANGES,
    defaultDuration: 120,
    zetamacWeighted: true,
    divisionStyle: 'reverse-multiply',
    accent: '#fb7185',
  },
  'train-addition': {
    id: 'train-addition',
    title: 'Addition Training',
    shortTitle: 'Addition',
    detail: 'Only addition',
    description: 'Focused reps on addition using Classic-style ranges.',
    category: 'training',
    operations: ['addition'],
    ranges: CLASSIC_RANGES,
    defaultDuration: 60,
    zetamacWeighted: true,
    divisionStyle: 'reverse-multiply',
    accent: '#a78bfa',
  },
  'train-subtraction': {
    id: 'train-subtraction',
    title: 'Subtraction Training',
    shortTitle: 'Subtraction',
    detail: 'Addition in reverse',
    description: 'Focused subtraction practice with positive answers.',
    category: 'training',
    operations: ['subtraction'],
    ranges: CLASSIC_RANGES,
    defaultDuration: 60,
    zetamacWeighted: true,
    divisionStyle: 'reverse-multiply',
    accent: '#38bdf8',
  },
  'train-multiplication': {
    id: 'train-multiplication',
    title: 'Multiplication Training',
    shortTitle: 'Multiply',
    detail: '2-12 by 2-100',
    description: 'Zetamac multiplication reps with harder second factors.',
    category: 'training',
    operations: ['multiplication'],
    ranges: CLASSIC_RANGES,
    defaultDuration: 60,
    zetamacWeighted: true,
    divisionStyle: 'reverse-multiply',
    accent: '#f59e0b',
  },
  'train-division': {
    id: 'train-division',
    title: 'Division Training',
    shortTitle: 'Division',
    detail: 'Multiplication in reverse',
    description: 'Division generated from the same multiplication ranges.',
    category: 'training',
    operations: ['division'],
    ranges: CLASSIC_RANGES,
    defaultDuration: 60,
    zetamacWeighted: true,
    divisionStyle: 'reverse-multiply',
    accent: '#34d399',
  },
}

export const RANKED_MODE_IDS: ModeId[] = ['classic', 'easy', 'medium', 'hard']
export const TRAINING_MODE_IDS: ModeId[] = [
  'train-addition',
  'train-subtraction',
  'train-multiplication',
  'train-division',
]

export function getMode(modeId: string | undefined): ModeDefinition {
  return MODES[(modeId as ModeId) || 'classic'] ?? MODES.classic
}

export function normalizeDuration(value: string | number | undefined, fallback: TestDuration): TestDuration {
  const parsed = typeof value === 'number' ? value : Number(value)
  return (DURATIONS.find((duration) => duration === parsed) ?? fallback) as TestDuration
}
