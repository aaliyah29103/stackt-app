import type { Discipline } from '../types'

export const DISCIPLINE_COLORS: Record<
  Discipline,
  { border: string; bg: string; text: string }
> = {
  Strength: {
    border: 'border-discipline-strength',
    bg: 'bg-discipline-strength/10',
    text: 'text-discipline-strength',
  },
  Run: {
    border: 'border-discipline-run',
    bg: 'bg-discipline-run/10',
    text: 'text-discipline-run',
  },
  Bike: {
    border: 'border-discipline-bike',
    bg: 'bg-discipline-bike/10',
    text: 'text-discipline-bike',
  },
  Swim: {
    border: 'border-discipline-swim',
    bg: 'bg-discipline-swim/10',
    text: 'text-discipline-swim',
  },
  WOD: {
    border: 'border-discipline-wod',
    bg: 'bg-discipline-wod/10',
    text: 'text-discipline-wod',
  },
}
