import type { Difficulty } from '../lib/problemGenerator'

export interface GameModeSection {
  title: string
  description: string
  modes: Difficulty[]
}

export const GAME_MODE_SECTIONS: GameModeSection[] = [
  {
    title: 'Official',
    description: 'True Zetamac rules',
    modes: ['classic'],
  },
  {
    title: 'Training',
    description: 'Practice at your pace',
    modes: ['easy', 'medium', 'hard'],
  },
  {
    title: 'Challenge',
    description: 'Push your limits',
    modes: ['abstract'],
  },
  {
    title: 'Free play',
    description: 'Full control over time and operations',
    modes: ['custom'],
  },
]

export const MODE_DISPLAY_NAMES: Partial<Record<Difficulty, string>> = {
  classic: 'zetamac',
  custom: 'custom',
}

export function getModeDisplayName(mode: Difficulty): string {
  return MODE_DISPLAY_NAMES[mode] ?? mode
}
