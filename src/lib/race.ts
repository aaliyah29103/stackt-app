import { formatWeekOfLabel, parseLooseDate } from './date.js'
import type { RaceEntry, RaceType } from '../types.js'

export function createBlankRace(): RaceEntry {
  return { id: crypto.randomUUID(), raceType: null, date: '', label: '' }
}

/** Appends a fresh blank race to a races array, returning the new array. */
export function appendBlankRace(races: RaceEntry[]): RaceEntry[] {
  return [...races, createBlankRace()]
}

export function raceDisplayName(race: RaceEntry): string {
  return race.label || race.raceType || 'Race'
}

/** e.g. "Nov 13, 2026" — falls back to the raw stored text if it can't be parsed. */
export function raceDateLabel(race: RaceEntry): string {
  if (!race.date.trim()) return 'No date set'
  const parsed = parseLooseDate(race.date)
  return parsed ? formatWeekOfLabel(parsed) : race.date
}

/** Sorts races by soonest date first; races with no parseable date sort last. */
export function sortRacesBySoonest(races: RaceEntry[]): RaceEntry[] {
  return [...races].sort((a, b) => {
    const dateA = parseLooseDate(a.date)
    const dateB = parseLooseDate(b.date)
    if (dateA && dateB) return dateA.getTime() - dateB.getTime()
    if (dateA) return -1
    if (dateB) return 1
    return 0
  })
}

export const RACE_TYPE_COLORS: Record<
  RaceType,
  { border: string; bg: string; text: string }
> = {
  HYROX: {
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
    text: 'text-orange-700',
  },
  '21.1km': {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700',
  },
  '42.2km': {
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    text: 'text-violet-700',
  },
  IRONMAN: {
    border: 'border-blue-700/30',
    bg: 'bg-blue-700/10',
    text: 'text-blue-700',
  },
  OTHER: {
    border: 'border-gray-400/30',
    bg: 'bg-gray-400/10',
    text: 'text-gray-600',
  },
}

export const DEFAULT_RACE_COLOR = {
  border: 'border-gray-400/30',
  bg: 'bg-gray-400/10',
  text: 'text-gray-600',
}

export function raceColor(race: RaceEntry) {
  return race.raceType ? RACE_TYPE_COLORS[race.raceType] : DEFAULT_RACE_COLOR
}
