import type {
  Discipline,
  HyroxDetail,
  IntervalDetail,
  SessionDetail,
  StrengthExercise,
} from '../types'

let nextId = 0
export function makeDetailId(): number {
  nextId += 1
  return nextId
}

/** The "More detail" pace/speed field label for a given discipline. */
export function paceLabelForDiscipline(discipline: Discipline): string {
  switch (discipline) {
    case 'Run':
      return 'Pace (min/km)'
    case 'Bike':
      return 'Speed (km/h)'
    case 'Swim':
      return 'Pace (min/100m)'
    default:
      return 'Pace'
  }
}

export function createEmptyStrengthExercises(): StrengthExercise[] {
  return [
    { id: makeDetailId(), name: '', sets: [{ id: makeDetailId(), reps: '', weight: '' }] },
  ]
}

export function createEmptyIntervalDetail(): IntervalDetail {
  return {
    mode: 'steady',
    steadyDistance: '',
    steadyPace: '',
    repeats: '',
    structure: 'uniform',
    uniformRow: { id: makeDetailId(), distance: '', pace: '', rest: '' },
    customRows: [{ id: makeDetailId(), distance: '', pace: '', rest: '' }],
  }
}

/**
 * Materializes a new session's detail from a template: exercise/movement names and
 * planned structure (sets, target reps, distance, pace, rest, HYROX prescriptions)
 * carry over, but Strength weight — the one value that's genuinely different every
 * time you actually lift — is left blank so it's filled in live during the workout.
 * Every id is regenerated so multiple sessions built from the same template never
 * share identity.
 */
export function detailFromTemplate(
  detail: SessionDetail | undefined,
): SessionDetail | undefined {
  if (!detail) return undefined
  switch (detail.kind) {
    case 'strength':
      return {
        kind: 'strength',
        exercises: detail.exercises.map((exercise) => ({
          id: makeDetailId(),
          name: exercise.name,
          sets: exercise.sets.map((set) => ({
            id: makeDetailId(),
            reps: set.reps,
            weight: '',
          })),
        })),
      }
    case 'interval':
      return {
        kind: 'interval',
        interval: {
          ...detail.interval,
          uniformRow: { ...detail.interval.uniformRow, id: makeDetailId() },
          customRows: detail.interval.customRows.map((row) => ({
            ...row,
            id: makeDetailId(),
          })),
        },
      }
    case 'hyrox':
      return {
        kind: 'hyrox',
        hyrox: {
          rounds: detail.hyrox.rounds,
          blocks: detail.hyrox.blocks.map((block) => ({
            id: makeDetailId(),
            rows: block.rows.map((row) => ({ ...row, id: makeDetailId() })),
          })),
        },
      }
  }
}

export function createEmptyHyroxDetail(): HyroxDetail {
  return {
    rounds: '',
    blocks: [
      {
        id: makeDetailId(),
        rows: [
          {
            id: makeDetailId(),
            type: 'Distance',
            name: '',
            value: '',
            sets: '1',
            rest: '',
          },
        ],
      },
    ],
  }
}
