import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BackArrowIcon, ChevronDownIcon } from '../assets/icons'
import { Button } from '../components/Button'
import Checkbox from '../components/Checkbox'
import DateInput from '../components/DateInput'
import DisciplinePicker from '../components/DisciplinePicker'
import HyroxFields from '../components/session/HyroxFields'
import IntervalFields from '../components/session/IntervalFields'
import StrengthFields from '../components/session/StrengthFields'
import TemplatePicker from '../components/TemplatePicker'
import { getDefaultSlot, getTodayISODate } from '../lib/date'
import {
  createEmptyHyroxDetail,
  createEmptyIntervalDetail,
  createEmptyStrengthExercises,
  detailFromTemplate,
  paceLabelForDiscipline,
} from '../lib/session'
import { useLocalStorage } from '../lib/useLocalStorage'
import {
  SLOTS,
  STORAGE_KEYS,
  type Discipline,
  type HyroxDetail,
  type IntervalDetail,
  type LoggedSession,
  type SessionDetail,
  type Slot,
  type StrengthExercise,
  type WorkoutTemplate,
} from '../types'

function isValidISODate(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isSlot(value: string | null): value is Slot {
  return SLOTS.includes(value as Slot)
}

type LogSessionProps = {
  templateMode?: boolean
}

function LogSession({ templateMode = false }: LogSessionProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editingTemplateId = templateMode ? searchParams.get('id') : null
  const editingSessionId = templateMode ? null : searchParams.get('sessionId')
  // Arriving from "Select from Workout Library" (via the "+Add" / global "+"
  // choice) rather than picking a template from the in-page dropdown.
  const initialTemplateId =
    !templateMode && !editingSessionId ? searchParams.get('templateId') : null

  const [templates, setTemplates] = useLocalStorage<WorkoutTemplate[]>(
    STORAGE_KEYS.templates,
    [],
  )
  const editingTemplate = editingTemplateId
    ? templates.find((t) => t.id === editingTemplateId)
    : undefined

  const [sessions, setSessions] = useLocalStorage<LoggedSession[]>(
    STORAGE_KEYS.sessions,
    [],
  )
  const editingSession = editingSessionId
    ? sessions.find((s) => s.id === editingSessionId)
    : undefined

  const [discipline, setDiscipline] = useState<Discipline | null>(
    editingTemplate?.discipline ?? editingSession?.discipline ?? null,
  )
  const [date, setDate] = useState<string>(() => {
    if (editingSession) return editingSession.date
    const param = searchParams.get('date')
    return isValidISODate(param) ? param : getTodayISODate()
  })
  const [slot, setSlot] = useState<Slot>(() => {
    if (editingSession) return editingSession.slot
    const param = searchParams.get('slot')
    return isSlot(param) ? param : getDefaultSlot()
  })
  const [focus, setFocus] = useState(
    editingTemplate?.focus ?? editingSession?.summary ?? '',
  )

  const initialDetail = editingSession?.detail ?? editingTemplate?.detail
  const [showDetail, setShowDetail] = useState(!!initialDetail)
  const [strengthExercises, setStrengthExercises] = useState<
    StrengthExercise[]
  >(() =>
    initialDetail?.kind === 'strength'
      ? initialDetail.exercises
      : createEmptyStrengthExercises(),
  )
  const [intervalDetail, setIntervalDetail] = useState<IntervalDetail>(() =>
    initialDetail?.kind === 'interval'
      ? initialDetail.interval
      : createEmptyIntervalDetail(),
  )
  const [hyroxDetail, setHyroxDetail] = useState<HyroxDetail>(() =>
    initialDetail?.kind === 'hyrox'
      ? initialDetail.hyrox
      : createEmptyHyroxDetail(),
  )

  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState(
    editingTemplate?.name ?? '',
  )

  const [startTemplateId, setStartTemplateId] = useState<string | null>(null)

  const applyTemplate = (templateId: string | null) => {
    setStartTemplateId(templateId)
    const template = templateId
      ? templates.find((t) => t.id === templateId)
      : undefined
    if (!template) return
    setDiscipline(template.discipline)
    setFocus(template.focus)
    const detail = detailFromTemplate(template.detail)
    setStrengthExercises(
      detail?.kind === 'strength'
        ? detail.exercises
        : createEmptyStrengthExercises(),
    )
    setIntervalDetail(
      detail?.kind === 'interval'
        ? detail.interval
        : createEmptyIntervalDetail(),
    )
    setHyroxDetail(
      detail?.kind === 'hyrox' ? detail.hyrox : createEmptyHyroxDetail(),
    )
    setShowDetail(!!detail)
  }

  useEffect(() => {
    if (initialTemplateId) applyTemplate(initialTemplateId)
    // Only ever fire once, right after arriving via a templateId in the URL.
  }, [])

  const renderDetailFields = () => {
    if (!discipline) return null
    switch (discipline) {
      case 'Strength':
        return (
          <StrengthFields
            value={strengthExercises}
            onChange={setStrengthExercises}
          />
        )
      case 'Run':
      case 'Bike':
      case 'Swim':
        return (
          <IntervalFields
            paceLabel={paceLabelForDiscipline(discipline)}
            value={intervalDetail}
            onChange={setIntervalDetail}
          />
        )
      case 'WOD':
        return <HyroxFields value={hyroxDetail} onChange={setHyroxDetail} />
    }
  }

  const buildDetail = (): SessionDetail | undefined => {
    if (!discipline) return undefined
    switch (discipline) {
      case 'Strength':
        return { kind: 'strength', exercises: strengthExercises }
      case 'Run':
      case 'Bike':
      case 'Swim':
        return { kind: 'interval', interval: intervalDetail }
      case 'WOD':
        return { kind: 'hyrox', hyrox: hyroxDetail }
    }
  }

  const saveSession = () => {
    if (!discipline) return
    const summary = focus.trim() || discipline
    const detail = buildDetail()
    if (editingSession) {
      setSessions((current) =>
        current.map((s) =>
          s.id === editingSession.id
            ? {
                ...s,
                date,
                slot,
                discipline,
                summary,
                detail,
                // Any manual edit detaches this session from the Weekly Plan so a
                // future regeneration never overwrites what the user changed.
                planGenerated: false,
              }
            : s,
        ),
      )
    } else {
      const session: LoggedSession = {
        id: crypto.randomUUID(),
        date,
        slot,
        discipline,
        summary,
        detail,
        completed: false,
      }
      setSessions((current) => [...current, session])
    }
    if (saveAsTemplate) {
      const template: WorkoutTemplate = {
        id: crypto.randomUUID(),
        discipline,
        name: templateName.trim() || discipline,
        focus: focus.trim(),
        detail,
      }
      setTemplates((current) => [...current, template])
    }
    navigate('/', { state: { toast: 'Session saved' } })
  }

  const saveTemplate = () => {
    if (!discipline) return
    const name = templateName.trim() || discipline
    const detail = buildDetail()
    if (editingTemplate) {
      setTemplates((current) =>
        current.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, discipline, name, focus: focus.trim(), detail }
            : t,
        ),
      )
    } else {
      const template: WorkoutTemplate = {
        id: crypto.randomUUID(),
        discipline,
        name,
        focus: focus.trim(),
        detail,
      }
      setTemplates((current) => [...current, template])
    }
    navigate('/workout-library')
  }

  return (
    <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
      <Link
        to={templateMode ? '/workout-library' : '/'}
        aria-label={
          templateMode ? 'Back to Workout Library' : 'Back to Weekly Planner'
        }
        className="flex h-10 w-10 items-center justify-center text-gray-400"
      >
        <BackArrowIcon className="h-5 w-4.5" />
      </Link>

      <h1 className="mt-8 text-3xl font-black tracking-tight text-ink">
        {templateMode
          ? editingTemplate
            ? 'Edit template'
            : 'Create a template'
          : editingSession
            ? 'Edit session'
            : 'Log a session'}
      </h1>

      {!templateMode && !editingSession && templates.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Start from template
          </h2>
          <div className="mt-3">
            <TemplatePicker
              templates={templates}
              value={startTemplateId}
              onChange={applyTemplate}
            />
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Discipline
        </h2>
        <div className="mt-3">
          <DisciplinePicker selected={discipline} onSelect={setDiscipline} />
        </div>
      </section>

      {templateMode ? (
        <section className="mt-8">
          <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Template Name
          </h2>
          <input
            type="text"
            value={templateName}
            onChange={(event) => setTemplateName(event.target.value)}
            placeholder="Ironman block — Leg day"
            className="mt-3 h-12 w-full rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
          />
        </section>
      ) : (
        <section className="mt-8">
          <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Day
          </h2>
          <div className="mt-3">
            <DateInput
              value={date}
              onChange={setDate}
              showWeekday
              className="flex h-12 w-full items-center justify-between rounded-xl border-2 border-ink bg-white px-4 text-sm font-medium text-ink focus:outline-none"
            />
          </div>

          <h2 className="mt-6 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Slot
          </h2>
          <div className="mt-3 flex h-12 gap-2">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={`flex-1 rounded-xl border-2 text-xs font-bold transition-colors ${
                  slot === s
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-gray-300 border-dashed bg-white text-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Session Focus
        </h2>
        <input
          type="text"
          value={focus}
          onChange={(event) => setFocus(event.target.value)}
          placeholder="Legs — squat + RDL"
          className="mt-3 h-12 w-full rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
        />
      </section>

      <button
        type="button"
        disabled={!discipline}
        onClick={() => setShowDetail((value) => !value)}
        className="mt-8 flex h-12 w-full items-center justify-between rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm font-bold text-gray-700 disabled:text-gray-300"
      >
        More detail
        <ChevronDownIcon
          className={`h-2 w-3 text-gray-400 transition-transform ${
            showDetail ? 'rotate-180' : ''
          }`}
        />
      </button>

      {showDetail && discipline && (
        <section className="mt-6">{renderDetailFields()}</section>
      )}

      {!templateMode && (
        <>
          <div className="mt-6">
            <Checkbox
              checked={saveAsTemplate}
              onChange={setSaveAsTemplate}
              label="Also save as a template"
            />
          </div>

          {saveAsTemplate && (
            <section className="mt-6 rounded-2xl border-2 border-ink bg-gray-200 p-5">
              <h2 className="text-[10px] font-bold tracking-widest text-gray-600 uppercase">
                Template Name
              </h2>
              <input
                type="text"
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Ironman block — Leg day"
                className="mt-3 h-12 w-full rounded-xl border-2 border-ink bg-white px-4 text-sm text-ink placeholder:text-gray-400 focus:outline-none"
              />
            </section>
          )}
        </>
      )}

      <Button
        disabled={!discipline}
        className="mt-8"
        onClick={templateMode ? saveTemplate : saveSession}
      >
        {templateMode ? 'Save template' : 'Save session'}
      </Button>
    </div>
  )
}

export default LogSession
