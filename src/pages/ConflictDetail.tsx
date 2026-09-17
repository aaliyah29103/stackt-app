import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BackArrowIcon, CalendarIcon, EditIcon, WarningIcon } from '../assets/icons'
import { Button } from '../components/Button'
import SessionSummaryCard from '../components/SessionSummaryCard'
import {
  areaThresholdHours,
  getSessionAreas,
  hoursBetweenSessions,
  sessionTimestamp,
  suggestNonConflictingSlot,
} from '../lib/conflict'
import { formatDayOption, parseISODate } from '../lib/date'
import { useLocalStorage } from '../lib/useLocalStorage'
import {
  DEFAULT_PROFILE,
  STORAGE_KEYS,
  type LoggedSession,
  type Profile,
} from '../types'

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function ConflictDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const idA = searchParams.get('a')
  const idB = searchParams.get('b')

  const [sessions, setSessions] = useLocalStorage<LoggedSession[]>(
    STORAGE_KEYS.sessions,
    [],
  )
  const [profile] = useLocalStorage<Profile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE,
  )
  const [keptAsIs, setKeptAsIs] = useState(false)

  const sessionA = sessions.find((s) => s.id === idA)
  const sessionB = sessions.find((s) => s.id === idB)

  const backLink = (
    <Link
      to="/"
      aria-label="Back to Weekly Planner"
      className="flex h-10 w-10 items-center justify-center text-gray-400"
    >
      <BackArrowIcon className="h-5 w-4.5" />
    </Link>
  )

  if (!sessionA || !sessionB) {
    return (
      <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
        {backLink}
        <p className="mt-8 text-sm text-gray-500">
          This conflict couldn't be found — one of the sessions may have been
          moved or deleted.
        </p>
      </div>
    )
  }

  const recoveryProfile = {
    trainingExperience: profile.trainingExperience,
    injuryProneAreas: profile.injuryProneAreas ?? [],
    nursingInjuryAreas: profile.nursingInjuryAreas ?? [],
  }

  const areasA = getSessionAreas(sessionA)
  const areasB = getSessionAreas(sessionB)
  const sharedAreas = areasA.filter((area) => areasB.includes(area))
  const gapHours = Math.round(hoursBetweenSessions(sessionA, sessionB))
  const flaggedAreas = sharedAreas.filter(
    (area) => gapHours < areaThresholdHours(area, recoveryProfile),
  )

  if (flaggedAreas.length === 0) {
    return (
      <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
        {backLink}
        <p className="mt-8 text-sm text-gray-500">
          This conflict no longer applies — one of the sessions may have
          changed since it was flagged.
        </p>
      </div>
    )
  }

  const requiredHours = Math.max(
    ...flaggedAreas.map((area) => areaThresholdHours(area, recoveryProfile)),
  )

  const [earlier, later] =
    sessionTimestamp(sessionA) <= sessionTimestamp(sessionB)
      ? [sessionA, sessionB]
      : [sessionB, sessionA]

  const moveSuggestion = suggestNonConflictingSlot(
    earlier,
    later,
    requiredHours,
    sessions,
  )

  const moveLater = () => {
    if (!moveSuggestion) return
    setSessions((current) =>
      current.map((s) =>
        s.id === later.id
          ? {
              ...s,
              date: moveSuggestion.date,
              slot: moveSuggestion.slot,
              planGenerated: false,
            }
          : s,
      ),
    )
    navigate('/', { state: { toast: 'Session moved' } })
  }

  const editEarlierLighter = () => {
    navigate(`/log?sessionId=${earlier.id}`)
  }

  const areaList = joinWithAnd(flaggedAreas.map((area) => area.toLowerCase()))
  const areaNoun = flaggedAreas.length === 1 ? 'area' : 'areas'

  return (
    <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
      {backLink}

      <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">
        Conflict Flagged
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        <SessionSummaryCard
          session={earlier}
          badgeIcon={<WarningIcon className="h-3.5 w-3.5" />}
        />
        <SessionSummaryCard
          session={later}
          badgeIcon={<WarningIcon className="h-3.5 w-3.5" />}
        />
      </div>

      <p className="mt-4 text-sm font-bold text-ink">
        Scheduled {gapHours} {gapHours === 1 ? 'hour' : 'hours'} apart
      </p>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
        <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Why this was flagged
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          Both sessions load your {areaList} {areaNoun}. Stacking that kind of
          load without enough recovery time in between is a common
          contributor to overuse injury.
        </p>
      </section>

      {!keptAsIs ? (
        <div className="mt-6 flex flex-col gap-3">
          {moveSuggestion && (
            <Button variant="solid" onClick={moveLater}>
              <CalendarIcon className="h-4 w-4" />
              Move {later.discipline} to{' '}
              {formatDayOption(parseISODate(moveSuggestion.date))}
            </Button>
          )}
          <Button variant="outline" onClick={editEarlierLighter}>
            <EditIcon className="h-4 w-4" />
            Edit {earlier.discipline} to a lighter version
          </Button>
          <Button
            variant="subtle"
            className="self-center"
            onClick={() => setKeptAsIs(true)}
          >
            Keep as is — I'll manage it
          </Button>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-gray-200 bg-gray-100 p-4 text-sm text-gray-600">
          We'll check in with you after {formatDayOption(parseISODate(later.date))}.
        </p>
      )}
    </div>
  )
}

export default ConflictDetail
