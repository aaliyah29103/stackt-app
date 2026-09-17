import {
  addDays,
  formatISODate,
  getActiveWeek,
  getMonday,
  getTodayISODate,
  parseLooseDate,
  resolveAbReferenceDate,
} from './date'
import { detailFromTemplate } from './session'
import {
  DAYS,
  SLOTS,
  type DayAbbrev,
  type LoggedSession,
  type RaceEntry,
  type Slot,
  type TrainingBlockSettings,
  type WeeklyPlan,
  type WeeklyPlanWeek,
  type WorkoutTemplate,
} from '../types'

export type GenerateWeeklyPlanResult = {
  sessions: LoggedSession[]
  weeksGenerated: number
  created: number
  updated: number
  removed: number
  error?: string
}

function slotKey(day: DayAbbrev, slot: Slot) {
  return `${day}-${slot}` as const
}

/**
 * Key for a specific calendar date/slot cell (e.g. "2026-09-14|AM"), used to record
 * that a slot was deliberately vacated by deleting a plan-generated session there —
 * distinct from `slotKey`, which addresses a recurring weekday cell in the plan itself.
 */
export function dateSlotKey(date: string, slot: Slot) {
  return `${date}|${slot}`
}

/**
 * Materializes the Weekly Plan into real, independent LoggedSession records for
 * every future week of the training block, following the A/B pattern across weeks.
 *
 * Safety rules (never violated):
 * - Any date before today is never touched — past days are left exactly as they
 *   are, whatever week they fall in. Today and every future day are eligible,
 *   including the rest of the current week if the block started earlier this week.
 * - A day/slot is only created or overwritten if it's empty or still holds a
 *   session with `planGenerated: true` that hasn't been completed. Any session
 *   that was individually edited (which clears `planGenerated`) or marked
 *   complete is left untouched, and no duplicate is created alongside it.
 * - A date/slot listed in `exclusions` (deliberately vacated by deleting a
 *   plan-generated session there) is never refilled, even though it's empty.
 */
export function generateWeeklyPlanSessions(
  trainingBlock: TrainingBlockSettings,
  races: RaceEntry[],
  weeklyPlan: WeeklyPlan,
  templates: WorkoutTemplate[],
  existingSessions: LoggedSession[],
  exclusions: string[] = [],
): GenerateWeeklyPlanResult {
  const emptyResult = {
    sessions: existingSessions,
    weeksGenerated: 0,
    created: 0,
    updated: 0,
    removed: 0,
  }

  const totalWeeks = parseInt(trainingBlock.manualWeeks, 10)
  if (!Number.isFinite(totalWeeks) || totalWeeks <= 0) {
    return { ...emptyResult, error: 'Set a block length (weeks) first.' }
  }

  const startDate = parseLooseDate(trainingBlock.manualStartDate)
  if (!startDate) {
    return { ...emptyResult, error: 'Set a block start date first.' }
  }

  const blockMonday = getMonday(startDate)
  const todayISO = getTodayISODate()
  const abReference = trainingBlock.alternateWeeks
    ? resolveAbReferenceDate(trainingBlock, races)
    : null

  const excludedSet = new Set(exclusions)
  const sessions = [...existingSessions]
  let created = 0
  let updated = 0
  let removed = 0

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const weekMonday = addDays(blockMonday, weekIndex * 7)

    let plan: WeeklyPlanWeek = weeklyPlan.weekA
    if (trainingBlock.alternateWeeks) {
      const activeWeek = getActiveWeek(abReference, weekMonday)
      plan = activeWeek === 'B' ? weeklyPlan.weekB : weeklyPlan.weekA
    }

    DAYS.forEach((day, dayIndex) => {
      const date = formatISODate(addDays(weekMonday, dayIndex))
      if (date < todayISO) return // never touch a day that's already passed

      SLOTS.forEach((slot) => {
        const templateId = plan[slotKey(day, slot)] ?? null
        const existingIndex = sessions.findIndex(
          (session) => session.date === date && session.slot === slot,
        )
        const existing =
          existingIndex === -1 ? undefined : sessions[existingIndex]

        if (templateId) {
          const template = templates.find((t) => t.id === templateId)
          if (!template) return

          if (!existing) {
            if (excludedSet.has(dateSlotKey(date, slot))) return
            sessions.push({
              id: crypto.randomUUID(),
              date,
              slot,
              discipline: template.discipline,
              summary: template.focus.trim() || template.discipline,
              detail: detailFromTemplate(template.detail),
              completed: false,
              planGenerated: true,
            })
            created += 1
          } else if (existing.planGenerated && !existing.completed) {
            sessions[existingIndex] = {
              ...existing,
              discipline: template.discipline,
              summary: template.focus.trim() || template.discipline,
              detail: detailFromTemplate(template.detail),
              planGenerated: true,
            }
            updated += 1
          }
          // else: independently modified or completed — leave untouched, no duplicate.
        } else if (existing?.planGenerated && !existing.completed) {
          // Plan no longer assigns anything here — remove the still-pristine generated session.
          sessions.splice(existingIndex, 1)
          removed += 1
        }
      })
    })
  }

  return { sessions, weeksGenerated: totalWeeks, created, updated, removed }
}
