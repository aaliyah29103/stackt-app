import { z } from 'zod'
import { getSessionAreas } from './conflict.js'
import { addDays, formatISODate, parseLooseDate, startOfDay } from './date.js'
import { raceDisplayName } from './race.js'
import {
  BODY_AREAS,
  DISCIPLINES,
  RACE_TYPES,
  SLOTS,
  TRAINING_EXPERIENCE_OPTIONS,
  type BodyArea,
  type LoggedSession,
  type RaceEntry,
  type TrainingExperience,
} from '../types.js'

export const FEELING_OPTIONS = ['Rough', 'OK', 'Great'] as const
export type Feeling = (typeof FEELING_OPTIONS)[number]

export const TIME_AVAILABLE_OPTIONS = [15, 30, 45, 60] as const

const MAX_NOTE_LENGTH = 500

/**
 * Everything sent to the /api/prioritize function for one recommendation.
 * Deliberately narrow — only the current week's remaining sessions, only
 * recent history for body areas those sessions actually touch, only
 * configured races — never the user's full session history or profile.
 * Shared with api/prioritize.ts, which validates every request against this
 * schema before spending a Claude call on it.
 */
export const PrioritizeRequestSchema = z.object({
  /** ISO date (YYYY-MM-DD) of the day being prioritized — may be any day this week, not necessarily today. */
  referenceDate: z.string(),
  timeAvailableMinutes: z.number().positive(),
  physicalFeeling: z.enum(FEELING_OPTIONS),
  mentalFeeling: z.enum(FEELING_OPTIONS),
  note: z.string().max(MAX_NOTE_LENGTH),
  recoveryCapacity: z.union([z.enum(TRAINING_EXPERIENCE_OPTIONS), z.literal('')]),
  injuryProneAreas: z.array(z.enum(BODY_AREAS)),
  nursingInjuryAreas: z.array(z.enum(BODY_AREAS)),
  candidateSessions: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        slot: z.enum(SLOTS),
        discipline: z.enum(DISCIPLINES),
        summary: z.string(),
        areas: z.array(z.enum(BODY_AREAS)),
        isConflicting: z.boolean(),
      }),
    )
    .min(1),
  recentHistory: z.array(
    z.object({
      date: z.string(),
      discipline: z.enum(DISCIPLINES),
      areas: z.array(z.enum(BODY_AREAS)),
    }),
  ),
  races: z.array(
    z.object({
      raceType: z.enum(RACE_TYPES).nullable(),
      label: z.string(),
      daysUntil: z.number(),
    }),
  ),
})

export type PrioritizeRequestPayload = z.infer<typeof PrioritizeRequestSchema>
export type PrioritizeCandidateSession = PrioritizeRequestPayload['candidateSessions'][number]
export type PrioritizeHistoryEntry = PrioritizeRequestPayload['recentHistory'][number]
export type PrioritizeRaceInfo = PrioritizeRequestPayload['races'][number]

/** Shared with api/prioritize.ts — the exact shape Claude must return. */
export const PrioritizationResponseSchema = z.object({
  reasoning: z
    .string()
    .describe(
      'The full explanation, grounded in the specific facts provided. Must end by acknowledging the athlete knows their own body better than this recommendation does.',
    ),
  recommendation: z
    .enum(['session', 'either', 'rest'])
    .describe(
      '"session" recommends one specific candidate (recommendedSessionId). "either" means two candidates are close enough that either is fine. "rest" means the better call today is not training this slot at all, even if something is scheduled.',
    ),
  recommendedSessionId: z
    .string()
    .nullable()
    .describe('The id of the recommended session when recommendation is "session". Null otherwise.'),
  alternativeSessionId: z
    .string()
    .nullable()
    .describe(
      'The id of the other session being compared, when relevant (e.g. the runner-up, or one of the two equally-fine options). Null if there was only one candidate.',
    ),
})

export type PrioritizeResponsePayload = z.infer<typeof PrioritizationResponseSchema>

/**
 * The candidate sessions for one specific day — not "the rest of the week."
 * Scoping to a single day is what makes "should I prioritize my run or my
 * swim on Thursday" a well-defined question: it's Thursday's sessions and
 * Thursday's recovery/history context, not a blend across several days.
 */
export function getSessionsForDay(
  sessions: LoggedSession[],
  dateISO: string,
): LoggedSession[] {
  return sessions.filter(
    (session) => session.date === dateISO && !session.completed,
  )
}

const HISTORY_WINDOW_DAYS = 14
const MAX_HISTORY_ENTRIES = 30

/**
 * Completed sessions from the 14 days before the reference date that touch
 * at least one of the given areas — the frequency signal the AI needs to
 * reason about recovery relative to actual training load, not just a fixed
 * rest-hours rule. `referenceDate` is whichever day is being prioritized,
 * not necessarily today.
 */
export function getRelevantRecentHistory(
  sessions: LoggedSession[],
  relevantAreas: BodyArea[],
  referenceDate: Date,
): PrioritizeHistoryEntry[] {
  if (relevantAreas.length === 0) return []
  const referenceISO = formatISODate(referenceDate)
  const cutoffISO = formatISODate(addDays(referenceDate, -HISTORY_WINDOW_DAYS))

  return sessions
    .filter(
      (session) =>
        session.completed &&
        session.date >= cutoffISO &&
        session.date < referenceISO,
    )
    .map((session) => ({
      date: session.date,
      discipline: session.discipline,
      areas: getSessionAreas(session),
    }))
    .filter((entry) => entry.areas.some((area) => relevantAreas.includes(area)))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, MAX_HISTORY_ENTRIES)
}

/**
 * Configured races with a valid date, as plain days-until-race proximity
 * relative to the reference date — soonest first.
 */
export function getRaceProximity(
  races: RaceEntry[],
  referenceDate: Date,
): PrioritizeRaceInfo[] {
  return races
    .filter((race) => race.raceType || race.date || race.label)
    .map((race) => {
      const target = parseLooseDate(race.date)
      const daysUntil = target
        ? Math.round(
            (startOfDay(target).getTime() - startOfDay(referenceDate).getTime()) /
              (24 * 60 * 60 * 1000),
          )
        : NaN
      return { raceType: race.raceType ?? null, label: raceDisplayName(race), daysUntil }
    })
    .filter((race) => Number.isFinite(race.daysUntil))
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

export function buildPrioritizeRequestPayload(params: {
  timeAvailableMinutes: number
  physicalFeeling: Feeling
  mentalFeeling: Feeling
  note: string
  recoveryCapacity: TrainingExperience | ''
  injuryProneAreas: BodyArea[]
  nursingInjuryAreas: BodyArea[]
  allSessions: LoggedSession[]
  races: RaceEntry[]
  /** The specific day being prioritized — defaults to today in the UI, but can be any day this week. */
  referenceDate: Date
  conflictingIds: Set<string>
}): PrioritizeRequestPayload {
  const {
    timeAvailableMinutes,
    physicalFeeling,
    mentalFeeling,
    note,
    recoveryCapacity,
    injuryProneAreas,
    nursingInjuryAreas,
    allSessions,
    races,
    referenceDate,
    conflictingIds,
  } = params

  const referenceDateISO = formatISODate(referenceDate)
  const candidates = getSessionsForDay(allSessions, referenceDateISO)

  const candidateSessions: PrioritizeCandidateSession[] = candidates.map(
    (session) => ({
      id: session.id,
      date: session.date,
      slot: session.slot,
      discipline: session.discipline,
      summary: session.summary,
      areas: getSessionAreas(session),
      isConflicting: conflictingIds.has(session.id),
    }),
  )

  const relevantAreas = [
    ...new Set(candidateSessions.flatMap((session) => session.areas)),
  ]

  return {
    referenceDate: referenceDateISO,
    timeAvailableMinutes,
    physicalFeeling,
    mentalFeeling,
    note: note.trim(),
    recoveryCapacity,
    injuryProneAreas,
    nursingInjuryAreas,
    candidateSessions,
    recentHistory: getRelevantRecentHistory(
      allSessions,
      relevantAreas,
      referenceDate,
    ),
    races: getRaceProximity(races, referenceDate),
  }
}
