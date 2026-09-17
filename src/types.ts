export const DISCIPLINES = [
  'Strength',
  'Run',
  'Bike',
  'Swim',
  'WOD',
] as const

export type Discipline = (typeof DISCIPLINES)[number]

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type DayAbbrev = (typeof DAYS)[number]

export const SLOTS = ['AM', 'PM'] as const
export type Slot = (typeof SLOTS)[number]

export type StrengthSet = {
  id: number
  reps: string
  weight: string
}

export type StrengthExercise = {
  id: number
  name: string
  sets: StrengthSet[]
}

export type IntervalRow = {
  id: number
  distance: string
  pace: string
  rest: string
}

export type IntervalDetail = {
  mode: 'steady' | 'intervals'
  steadyDistance: string
  steadyPace: string
  repeats: string
  structure: 'uniform' | 'custom'
  uniformRow: IntervalRow
  customRows: IntervalRow[]
}

export const HYROX_ROW_TYPES = ['Distance', 'Reps', 'Time'] as const
export type HyroxRowType = (typeof HYROX_ROW_TYPES)[number]

export type HyroxRow = {
  id: number
  type: HyroxRowType
  name: string
  value: string
  /** How many times this movement repeats. "1" (the default) means a single pass. */
  sets: string
  rest: string
}

export type HyroxBlock = {
  id: number
  rows: HyroxRow[]
}

export type HyroxDetail = {
  rounds: string
  blocks: HyroxBlock[]
}

export type SessionDetail =
  | { kind: 'strength'; exercises: StrengthExercise[] }
  | { kind: 'interval'; interval: IntervalDetail }
  | { kind: 'hyrox'; hyrox: HyroxDetail }

export type LoggedSession = {
  id: string
  /** ISO date (YYYY-MM-DD) of the specific day this session is logged against. */
  date: string
  slot: Slot
  discipline: Discipline
  summary: string
  /** Structured exercise/interval data from "More detail," independent of any template. */
  detail?: SessionDetail
  completed: boolean
  /**
   * True only while this session still exactly matches what the Weekly Plan
   * generated for its date/slot. Cleared the moment the session is individually
   * edited, so regenerating the plan never overwrites or removes it.
   */
  planGenerated?: boolean
  /**
   * Shared by every session in a "linked" group (e.g. a triathlon brick — bike
   * immediately followed by run, zero rest intentional). Purely a lightweight
   * grouping tag for display: linked sessions remain fully independent records:
   * editing, completing, or deleting one never touches the others, same as the
   * session/template independence principle elsewhere in this app. When conflict
   * detection is built, it MUST exempt sessions sharing a linkGroupId from any
   * "insufficient rest between sessions" rule — zero rest is intentional here,
   * not a risk to flag.
   */
  linkGroupId?: string
}

export type WorkoutTemplate = {
  id: string
  discipline: Discipline
  name: string
  focus: string
  detail?: SessionDetail
}

export const RACE_TYPES = ['HYROX', '21.1km', '42.2km', 'IRONMAN', 'OTHER'] as const
export type RaceType = (typeof RACE_TYPES)[number]

export type RaceEntry = {
  id: string
  raceType: RaceType | null
  date: string
  label: string
}

export const SEX_OPTIONS = ['Prefer not to say', 'Female', 'Male', 'Other'] as const
export type Sex = (typeof SEX_OPTIONS)[number]

export const TRAINING_EXPERIENCE_OPTIONS = [
  'Slower',
  'Average',
  'Faster',
] as const
export type TrainingExperience = (typeof TRAINING_EXPERIENCE_OPTIONS)[number]

export const BODY_AREAS = ['Hamstrings', 'Knees', 'Lower back', 'Shoulders'] as const
export type BodyArea = (typeof BODY_AREAS)[number]

export type Profile = {
  name: string
  age: string
  sex: Sex
  height: string
  trainingExperience: TrainingExperience | ''
  /** Permanent — areas that are always more injury-prone for this person. */
  injuryProneAreas: BodyArea[]
  /**
   * Separate from `injuryProneAreas` and meant to be toggled on/off freely as
   * injuries come and go. Kept independent because it's intended to also drive
   * a future session-prioritization feature, not just conflict detection.
   */
  nursingInjuryAreas: BodyArea[]
}

export const DEFAULT_PROFILE: Profile = {
  name: '',
  age: '',
  sex: 'Prefer not to say',
  height: '',
  trainingExperience: '',
  injuryProneAreas: [],
  nursingInjuryAreas: [],
}

export type UnitsPreferences = {
  distance: 'km' | 'mi'
  weight: 'kg' | 'lb'
}

export type NotificationsPreferences = {
  conflictCheckIns: boolean
}

export type TrainingBlockSettings = {
  mode: 'auto' | 'manual'
  manualWeeks: string
  manualStartDate: string
  alternateWeeks: boolean
  weekALabel: string
  weekBLabel: string
  /**
   * ISO date (YYYY-MM-DD) captured the first time "Alternate A/B weeks" was turned
   * on, used as the A/B reference only when no race and no manual start date exist.
   * Set once and reused — must never be recomputed as "today" on every read.
   */
  abFallbackStartDate: string
}

export const DEFAULT_TRAINING_BLOCK: TrainingBlockSettings = {
  mode: 'auto',
  manualWeeks: '',
  manualStartDate: '',
  alternateWeeks: false,
  weekALabel: '',
  weekBLabel: '',
  abFallbackStartDate: '',
}

/** Slot key like "Mon-AM" — the day/slot cell a template is assigned to. */
export type WeeklyPlanSlotKey = `${DayAbbrev}-${Slot}`

/** Maps each day/slot cell to a template id. An absent key means no session for that cell. */
export type WeeklyPlanWeek = Partial<Record<WeeklyPlanSlotKey, string>>

export type WeeklyPlan = {
  weekA: WeeklyPlanWeek
  /** Only used when Training Block's "Alternate A/B weeks" is on. */
  weekB: WeeklyPlanWeek
}

export const DEFAULT_WEEKLY_PLAN: WeeklyPlan = { weekA: {}, weekB: {} }

export const STORAGE_KEYS = {
  races: 'stackt.races',
  profile: 'stackt.profile',
  units: 'stackt.units',
  notifications: 'stackt.notifications',
  trainingBlock: 'stackt.trainingBlock',
  sessions: 'stackt.sessions',
  raceBannerDismissed: 'stackt.raceBannerDismissed',
  templates: 'stackt.templates',
  weeklyPlan: 'stackt.weeklyPlan',
  /**
   * Date/slot cells (formatted "YYYY-MM-DD|AM") that were deliberately emptied by
   * deleting a plan-generated session there — regeneration must never refill them.
   */
  planExclusions: 'stackt.planExclusions',
} as const
