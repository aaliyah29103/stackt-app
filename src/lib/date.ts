import type { RaceEntry, Slot, TrainingBlockSettings } from '../types.js'

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_WEEK = 7 * MS_PER_DAY

const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Midnight-normalized copy of a date (strips time-of-day). */
export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Monday of the week containing the given date (midnight-normalized). */
export function getMonday(date: Date): Date {
  const normalized = startOfDay(date)
  const jsDay = normalized.getDay() // 0 = Sun .. 6 = Sat
  const mondayOffset = (jsDay + 6) % 7 // 0 = Mon .. 6 = Sun
  return addDays(normalized, -mondayOffset)
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayISODate(): string {
  return formatISODate(new Date())
}

export function getDefaultSlot(): Slot {
  return new Date().getHours() < 12 ? 'AM' : 'PM'
}

/** Parses a "YYYY-MM-DD" string as a local-time date (avoids the UTC-shift from `new Date(str)`). */
export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getWeekdayName(date: Date): string {
  return WEEKDAY_NAMES[(date.getDay() + 6) % 7]
}

/** e.g. "Monday, Aug 17" */
export function formatDayOption(date: Date): string {
  return `${getWeekdayName(date)}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`
}

/** e.g. "Monday, Aug 17, 2026" — like `formatDayOption` but disambiguated with a year. */
export function formatFullDayLabel(date: Date): string {
  return `${getWeekdayName(date)}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

/** e.g. "Aug 17, 2026" */
export function formatWeekOfLabel(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

/** e.g. "Aug 2026" — a calendar picker's month header. */
export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Monday-start calendar grid for a given month: always 42 days (6 full weeks),
 * including the leading/trailing days from adjacent months needed to fill the grid.
 */
export function getCalendarGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = getMonday(firstOfMonth)
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
}

/**
 * Parses loosely-formatted date strings like "Sep 6th, 2026" (strips ordinal
 * suffixes first). A strict "YYYY-MM-DD" value — what DateInput now always
 * produces — is routed through `parseISODate` to avoid the UTC-shift that
 * `new Date("YYYY-MM-DD")` introduces; only genuinely free-text legacy values
 * fall through to the loose parse.
 */
export function parseLooseDate(value: string): Date | null {
  if (!value.trim()) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return parseISODate(value.trim())
  }
  const cleaned = value.replace(/(\d+)(st|nd|rd|th)/i, '$1')
  const parsed = new Date(cleaned)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getEarliestRaceDate(races: RaceEntry[]): Date | null {
  const dates = races
    .map((race) => parseLooseDate(race.date))
    .filter((date): date is Date => date !== null)
  if (dates.length === 0) return null
  return dates.reduce((earliest, date) => (date < earliest ? date : earliest))
}

/**
 * Resolves the A/B alternation reference date, in priority order:
 * 1. The earliest configured race date, if one exists.
 * 2. The Manual block's start date, if Manual mode is selected.
 * 3. The fixed, persisted date "Alternate A/B weeks" was first turned on.
 * Returns null only if none of the above have ever been set.
 */
export function resolveAbReferenceDate(
  trainingBlock: TrainingBlockSettings,
  races: RaceEntry[],
): Date | null {
  const raceDate = getEarliestRaceDate(races)
  if (raceDate) return raceDate

  if (trainingBlock.mode === 'manual') {
    const manualDate = parseLooseDate(trainingBlock.manualStartDate)
    if (manualDate) return manualDate
  }

  if (trainingBlock.abFallbackStartDate) {
    return parseISODate(trainingBlock.abFallbackStartDate)
  }

  return null
}

/** Which alternating week (A/B) is active as of `asOf`, given a reference start date.
 * Returns null when there's no reference date to alternate from — the caller must
 * treat that as "unknown," not silently default to 'A' (which would show as
 * permanently stuck on Week A instead of reflecting that setup is incomplete).
 */
export function getActiveWeek(
  referenceDate: Date | null,
  asOf: Date = new Date(),
): 'A' | 'B' | null {
  if (!referenceDate) return null
  const diffWeeks = Math.floor(
    (asOf.getTime() - referenceDate.getTime()) / MS_PER_WEEK,
  )
  const normalized = ((diffWeeks % 2) + 2) % 2
  return normalized === 0 ? 'A' : 'B'
}
