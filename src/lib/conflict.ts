import { addDays, formatISODate, parseISODate } from './date.js'
import {
  SLOTS,
  type BodyArea,
  type LoggedSession,
  type Slot,
  type TrainingExperience,
} from '../types.js'

export const RECOVERY_HOURS: Record<TrainingExperience, number> = {
  Slower: 48,
  Average: 36,
  Faster: 24,
}
export const DEFAULT_RECOVERY_HOURS = RECOVERY_HOURS.Average
export const INJURY_OVERRIDE_HOURS = 48

/**
 * Representative time-of-day for each slot, used only to compute a rest gap
 * in hours — the app has no finer time granularity than AM/PM, so this is
 * purely an internal calculation anchor, never shown to the user.
 */
const SLOT_HOUR: Record<Slot, number> = { AM: 8, PM: 14 }

function areasForExerciseName(name: string): BodyArea[] {
  const n = name.toLowerCase().trim()
  if (!n) return []
  if (n.includes('squat') || n.includes('leg press') || n.includes('lunge')) {
    return ['Knees']
  }
  if (n.includes('deadlift') || n.includes('rdl')) {
    return ['Hamstrings', 'Lower back']
  }
  if (
    n.includes('bench') ||
    n.includes('overhead press') ||
    n.includes('shoulder press')
  ) {
    return ['Shoulders']
  }
  if (
    n.includes('pull-up') ||
    n.includes('pull up') ||
    n.includes('pullup') ||
    n.includes('row')
  ) {
    return ['Shoulders', 'Lower back']
  }
  // Doesn't match any known movement — must never guess, so it's silently untagged.
  return []
}

/**
 * The body areas a session loads. Strength scans exercise names for keyword
 * matches; an unmatched name is silently untagged, never guessed. Other
 * disciplines use a fixed, discipline-level default (WOD has no per-movement
 * scanning yet — v1 uses its default area set only).
 */
export function getSessionAreas(session: LoggedSession): BodyArea[] {
  switch (session.discipline) {
    case 'Run':
      return ['Knees', 'Hamstrings']
    case 'Bike':
      return ['Knees', 'Lower back']
    case 'Swim':
      return ['Shoulders']
    case 'WOD':
      return ['Knees', 'Hamstrings']
    case 'Strength': {
      if (session.detail?.kind !== 'strength') return []
      const areas = new Set<BodyArea>()
      session.detail.exercises.forEach((exercise) => {
        areasForExerciseName(exercise.name).forEach((area) => areas.add(area))
      })
      return [...areas]
    }
    default:
      return []
  }
}

/** Internal calculation timestamp for a session's date/slot — see `SLOT_HOUR`. */
export function sessionTimestamp(session: LoggedSession): number {
  const date = parseISODate(session.date)
  date.setHours(SLOT_HOUR[session.slot], 0, 0, 0)
  return date.getTime()
}

/** Absolute gap between two sessions, in hours. */
export function hoursBetweenSessions(a: LoggedSession, b: LoggedSession): number {
  return Math.abs(sessionTimestamp(a) - sessionTimestamp(b)) / (1000 * 60 * 60)
}

export type RecoveryProfile = {
  trainingExperience: TrainingExperience | ''
  injuryProneAreas: BodyArea[]
  nursingInjuryAreas: BodyArea[]
}

/**
 * The rest threshold that applies to a specific shared area, for this person —
 * always the STRICTEST (largest) of the general recovery-capacity setting and
 * either injury list's 48h override. Never averaged or relaxed.
 */
export function areaThresholdHours(
  area: BodyArea,
  profile: RecoveryProfile,
): number {
  let hours = profile.trainingExperience
    ? RECOVERY_HOURS[profile.trainingExperience]
    : DEFAULT_RECOVERY_HOURS
  if (profile.injuryProneAreas.includes(area)) {
    hours = Math.max(hours, INJURY_OVERRIDE_HOURS)
  }
  if (profile.nursingInjuryAreas.includes(area)) {
    hours = Math.max(hours, INJURY_OVERRIDE_HOURS)
  }
  return hours
}

export type ConflictPair = {
  sessionA: LoggedSession
  sessionB: LoggedSession
  /** Only the shared areas that actually violate their threshold at this gap. */
  flaggedAreas: BodyArea[]
  gapHours: number
}

/**
 * Every detected recovery conflict, as full pairs (not just ids) so callers
 * can show the gap, the specific areas that triggered it, and act on either
 * session. Pairwise across the full session list (not just one visible week)
 * so a conflict spanning adjacent days/weeks is still caught. Sessions
 * sharing a `linkGroupId` (a brick) are always exempt from each other,
 * regardless of shared area or gap.
 */
export function findConflictPairs(
  sessions: LoggedSession[],
  profile: RecoveryProfile,
): ConflictPair[] {
  const pairs: ConflictPair[] = []

  for (let i = 0; i < sessions.length; i++) {
    const a = sessions[i]
    const areasA = getSessionAreas(a)
    if (areasA.length === 0) continue

    for (let j = i + 1; j < sessions.length; j++) {
      const b = sessions[j]
      if (a.linkGroupId && a.linkGroupId === b.linkGroupId) continue

      const areasB = getSessionAreas(b)
      if (areasB.length === 0) continue

      const sharedAreas = areasA.filter((area) => areasB.includes(area))
      if (sharedAreas.length === 0) continue

      const gapHours = hoursBetweenSessions(a, b)
      const flaggedAreas = sharedAreas.filter(
        (area) => gapHours < areaThresholdHours(area, profile),
      )
      if (flaggedAreas.length > 0) {
        pairs.push({ sessionA: a, sessionB: b, flaggedAreas, gapHours })
      }
    }
  }

  return pairs
}

/** Every session id involved in at least one detected recovery conflict. */
export function findConflictingSessionIds(
  sessions: LoggedSession[],
  profile: RecoveryProfile,
): Set<string> {
  const conflicting = new Set<string>()
  findConflictPairs(sessions, profile).forEach((pair) => {
    conflicting.add(pair.sessionA.id)
    conflicting.add(pair.sessionB.id)
  })
  return conflicting
}

/**
 * The soonest date/slot after `moving`'s current slot where moving it there
 * would clear `requiredHours` of rest from `anchor` (the session staying put)
 * — preferring a slot with nothing already in it, but falling back to the
 * soonest gap-clearing slot at all if every one of the first 30 days is
 * already occupied.
 */
export function suggestNonConflictingSlot(
  anchor: LoggedSession,
  moving: LoggedSession,
  requiredHours: number,
  allSessions: LoggedSession[],
): { date: string; slot: Slot } | null {
  let fallback: { date: string; slot: Slot } | null = null

  for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
    const candidateDate = formatISODate(
      addDays(parseISODate(moving.date), dayOffset),
    )
    for (const slot of SLOTS) {
      const candidate: LoggedSession = { ...moving, date: candidateDate, slot }
      if (hoursBetweenSessions(anchor, candidate) < requiredHours) continue

      fallback ??= { date: candidateDate, slot }

      const occupied = allSessions.some(
        (s) => s.id !== moving.id && s.date === candidateDate && s.slot === slot,
      )
      if (!occupied) return { date: candidateDate, slot }
    }
  }

  return fallback
}
