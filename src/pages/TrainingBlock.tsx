import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BackArrowIcon } from '../assets/icons'
import { Button } from '../components/Button'
import DateInput from '../components/DateInput'
import SegmentedToggle from '../components/SegmentedToggle'
import SettingsSection from '../components/SettingsSection'
import TemplatePicker from '../components/TemplatePicker'
import Toggle from '../components/Toggle'
import { getTodayISODate } from '../lib/date'
import { useLocalStorage } from '../lib/useLocalStorage'
import { generateWeeklyPlanSessions } from '../lib/weeklyPlan'
import {
  DAYS,
  DEFAULT_TRAINING_BLOCK,
  DEFAULT_WEEKLY_PLAN,
  SLOTS,
  STORAGE_KEYS,
  type DayAbbrev,
  type LoggedSession,
  type RaceEntry,
  type Slot,
  type TrainingBlockSettings,
  type WeeklyPlan,
  type WeeklyPlanWeek,
  type WorkoutTemplate,
} from '../types'

const MODES = ['auto', 'manual'] as const
const MODE_LABELS: Record<(typeof MODES)[number], string> = {
  auto: 'Auto — from race date',
  manual: 'Manual — set my own length',
}

type WeeklyPlanGridProps = {
  week: WeeklyPlanWeek
  templates: WorkoutTemplate[]
  onChangeSlot: (day: DayAbbrev, slot: Slot, templateId: string | null) => void
}

function WeeklyPlanGrid({ week, templates, onChangeSlot }: WeeklyPlanGridProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3 pl-10">
        {SLOTS.map((slot) => (
          <span
            key={slot}
            className="flex-1 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase"
          >
            {slot}
          </span>
        ))}
      </div>
      {DAYS.map((day) => (
        <div key={day} className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-xs font-bold text-gray-500 uppercase">
            {day}
          </span>
          <div className="flex flex-1 gap-3">
            {SLOTS.map((slot) => (
              <div key={slot} className="flex-1">
                <TemplatePicker
                  templates={templates}
                  value={week[`${day}-${slot}`] ?? null}
                  onChange={(templateId) =>
                    onChangeSlot(day, slot, templateId)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TrainingBlock() {
  const [settings, setSettings] = useLocalStorage<TrainingBlockSettings>(
    STORAGE_KEYS.trainingBlock,
    DEFAULT_TRAINING_BLOCK,
  )
  const [races] = useLocalStorage<RaceEntry[]>(STORAGE_KEYS.races, [])
  const hasRaceDate = races.some((race) => race.date.trim() !== '')

  const [weeklyPlan, setWeeklyPlan] = useLocalStorage<WeeklyPlan>(
    STORAGE_KEYS.weeklyPlan,
    DEFAULT_WEEKLY_PLAN,
  )
  const [templates] = useLocalStorage<WorkoutTemplate[]>(
    STORAGE_KEYS.templates,
    [],
  )
  const [sessions, setSessions] = useLocalStorage<LoggedSession[]>(
    STORAGE_KEYS.sessions,
    [],
  )
  const [planExclusions] = useLocalStorage<string[]>(
    STORAGE_KEYS.planExclusions,
    [],
  )
  const [generationMessage, setGenerationMessage] = useState<string | null>(
    null,
  )

  const updateSlot = (
    week: 'weekA' | 'weekB',
    day: DayAbbrev,
    slot: Slot,
    templateId: string | null,
  ) => {
    setWeeklyPlan((current) => {
      const nextWeek = { ...current[week] }
      const key = `${day}-${slot}` as const
      if (templateId) {
        nextWeek[key] = templateId
      } else {
        delete nextWeek[key]
      }
      return { ...current, [week]: nextWeek }
    })
  }

  const handleGenerate = () => {
    const result = generateWeeklyPlanSessions(
      settings,
      races,
      weeklyPlan,
      templates,
      sessions,
      planExclusions,
    )
    if (result.error) {
      setGenerationMessage(result.error)
      return
    }
    setSessions(result.sessions)
    const parts = [`${result.weeksGenerated} week${result.weeksGenerated === 1 ? '' : 's'} processed`]
    if (result.created) parts.push(`${result.created} created`)
    if (result.updated) parts.push(`${result.updated} updated`)
    if (result.removed) parts.push(`${result.removed} removed`)
    setGenerationMessage(parts.join(' · '))
  }

  return (
    <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
      <Link
        to="/settings"
        aria-label="Back to Settings"
        className="flex h-10 w-10 items-center justify-center text-gray-400"
      >
        <BackArrowIcon className="h-5 w-4.5" />
      </Link>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">
        Training block
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Block length and A/B week alternation are independent — set either,
        both, or neither.
      </p>

      <div className="mt-6 flex flex-col gap-8">
        <SettingsSection title="Block Length">
          <div className="flex flex-col gap-4 p-4">
            <SegmentedToggle
              options={MODES}
              value={settings.mode}
              onChange={(mode) => setSettings((s) => ({ ...s, mode }))}
              getLabel={(mode) => MODE_LABELS[mode]}
            />

            {settings.mode === 'auto' ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                {hasRaceDate ? (
                  <>
                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Calculated phase
                    </p>
                    <p className="mt-1 text-base font-bold text-ink">
                      Base phase · Week 4 of 12
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Add a race with a date in{' '}
                    <Link
                      to="/race-setup"
                      className="font-bold text-accent underline"
                    >
                      Race Setup
                    </Link>{' '}
                    to calculate your phase.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Block length (weeks)
                  </h2>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={settings.manualWeeks}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        manualWeeks: event.target.value,
                      }))
                    }
                    placeholder="e.g. 8"
                    className="mt-3 h-12 w-full rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Block start date
                  </h2>
                  <div className="mt-3">
                    <DateInput
                      value={settings.manualStartDate}
                      onChange={(value) =>
                        setSettings((s) => ({ ...s, manualStartDate: value }))
                      }
                      placeholder="e.g. Aug 17, 2026"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        <SettingsSection title="Weekly Pattern">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-ink">
                Alternate A/B weeks
              </span>
              <Toggle
                checked={settings.alternateWeeks}
                onChange={(checked) =>
                  setSettings((s) => ({
                    ...s,
                    alternateWeeks: checked,
                    // Captured once, the first time this is ever turned on — never
                    // overwritten afterward, so it stays a fixed reference point
                    // rather than drifting to "today" on every toggle.
                    abFallbackStartDate:
                      checked && !s.abFallbackStartDate
                        ? getTodayISODate()
                        : s.abFallbackStartDate,
                  }))
                }
                label="Alternate A/B weeks"
              />
            </div>

            {settings.alternateWeeks && (
              <div className="flex flex-col gap-3">
                <div>
                  <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Week A
                  </h2>
                  <input
                    type="text"
                    value={settings.weekALabel}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        weekALabel: event.target.value,
                      }))
                    }
                    placeholder="e.g. Squat focus"
                    className="mt-2 h-12 w-full rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    Week B
                  </h2>
                  <input
                    type="text"
                    value={settings.weekBLabel}
                    onChange={(event) =>
                      setSettings((s) => ({
                        ...s,
                        weekBLabel: event.target.value,
                      }))
                    }
                    placeholder="e.g. Deadlift focus"
                    className="mt-2 h-12 w-full rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        {settings.mode === 'manual' && (
          <SettingsSection
            title="Weekly Plan"
            description="Assign a saved template to each day/slot. Generates real, independent sessions for every future week of the block — editing or moving one afterward never affects the others."
          >
            <div className="flex flex-col gap-6 p-4">
              {templates.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Save a workout in the{' '}
                  <Link
                    to="/workout-library"
                    className="font-bold text-accent underline"
                  >
                    Workout Library
                  </Link>{' '}
                  first, then assign it here.
                </p>
              ) : settings.alternateWeeks ? (
                <>
                  <div>
                    <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Week A{settings.weekALabel ? ` — ${settings.weekALabel}` : ''}
                    </h2>
                    <div className="mt-3">
                      <WeeklyPlanGrid
                        week={weeklyPlan.weekA}
                        templates={templates}
                        onChangeSlot={(day, slot, templateId) =>
                          updateSlot('weekA', day, slot, templateId)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Week B{settings.weekBLabel ? ` — ${settings.weekBLabel}` : ''}
                    </h2>
                    <div className="mt-3">
                      <WeeklyPlanGrid
                        week={weeklyPlan.weekB}
                        templates={templates}
                        onChangeSlot={(day, slot, templateId) =>
                          updateSlot('weekB', day, slot, templateId)
                        }
                      />
                    </div>
                  </div>
                </>
              ) : (
                <WeeklyPlanGrid
                  week={weeklyPlan.weekA}
                  templates={templates}
                  onChangeSlot={(day, slot, templateId) =>
                    updateSlot('weekA', day, slot, templateId)
                  }
                />
              )}

              {templates.length > 0 && (
                <>
                  <Button onClick={handleGenerate}>Generate sessions</Button>
                  {generationMessage && (
                    <p className="text-sm text-gray-500">{generationMessage}</p>
                  )}
                </>
              )}
            </div>
          </SettingsSection>
        )}
      </div>
    </div>
  )
}

export default TrainingBlock
