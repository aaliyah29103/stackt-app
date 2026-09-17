import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BackArrowIcon } from '../assets/icons'
import { Button } from '../components/Button'
import Pill from '../components/Pill'
import SegmentedToggle from '../components/SegmentedToggle'
import SessionSummaryCard from '../components/SessionSummaryCard'
import { findConflictPairs } from '../lib/conflict'
import { addDays, formatDayOption, formatISODate, getMonday, startOfDay } from '../lib/date'
import {
  FEELING_OPTIONS,
  TIME_AVAILABLE_OPTIONS,
  buildPrioritizeRequestPayload,
  getSessionsForDay,
  type Feeling,
  type PrioritizeResponsePayload,
} from '../lib/prioritize'
import { useLocalStorage } from '../lib/useLocalStorage'
import {
  DEFAULT_PROFILE,
  STORAGE_KEYS,
  type LoggedSession,
  type Profile,
  type RaceEntry,
} from '../types'

function timeLabel(minutes: number): string {
  const isLast = minutes === TIME_AVAILABLE_OPTIONS[TIME_AVAILABLE_OPTIONS.length - 1]
  return isLast ? `${minutes}+ min` : `${minutes} min`
}

function recommendationHeading(recommendation: PrioritizeResponsePayload['recommendation']): string {
  switch (recommendation) {
    case 'rest':
      return 'Recommendation: rest'
    case 'either':
      return 'Recommendation: either works'
    case 'session':
      return 'Recommendation'
  }
}

function Prioritize() {
  const navigate = useNavigate()
  const [sessions] = useLocalStorage<LoggedSession[]>(STORAGE_KEYS.sessions, [])
  const [profile] = useLocalStorage<Profile>(STORAGE_KEYS.profile, DEFAULT_PROFILE)
  const [races] = useLocalStorage<RaceEntry[]>(STORAGE_KEYS.races, [])

  const today = startOfDay(new Date())
  const weekStart = getMonday(today)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [timeAvailable, setTimeAvailable] = useState<number>(TIME_AVAILABLE_OPTIONS[1])
  const [physicalFeeling, setPhysicalFeeling] = useState<Feeling>('OK')
  const [mentalFeeling, setMentalFeeling] = useState<Feeling>('OK')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PrioritizeResponsePayload | null>(null)

  const selectedDateISO = formatISODate(selectedDate)
  const candidates = getSessionsForDay(sessions, selectedDateISO)

  const recoveryProfile = {
    trainingExperience: profile.trainingExperience,
    injuryProneAreas: profile.injuryProneAreas ?? [],
    nursingInjuryAreas: profile.nursingInjuryAreas ?? [],
  }
  const conflictingIds = new Set<string>()
  findConflictPairs(sessions, recoveryProfile).forEach((pair) => {
    conflictingIds.add(pair.sessionA.id)
    conflictingIds.add(pair.sessionB.id)
  })

  const submit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload = buildPrioritizeRequestPayload({
        timeAvailableMinutes: timeAvailable,
        physicalFeeling,
        mentalFeeling,
        note,
        recoveryCapacity: profile.trainingExperience,
        injuryProneAreas: profile.injuryProneAreas ?? [],
        nursingInjuryAreas: profile.nursingInjuryAreas ?? [],
        allSessions: sessions,
        races,
        referenceDate: selectedDate,
        conflictingIds,
      })
      const response = await fetch('/api/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? `Request failed (${response.status})`)
        return
      }
      setResult(data)
    } catch {
      setError('Network error — please try again.')
    } finally {
      setLoading(false)
    }
  }

  const goToSession = (id: string) => navigate(`/log?sessionId=${id}`)

  return (
    <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
      <Link
        to="/"
        aria-label="Back to Weekly Planner"
        className="flex h-10 w-10 items-center justify-center text-gray-400"
      >
        <BackArrowIcon className="h-5 w-4.5" />
      </Link>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">
        What should I prioritize?
      </h1>

      {!result && (
        <p className="mt-2 text-sm text-gray-500">
          A few quick questions so the recommendation actually reflects where
          you're at right now.
        </p>
      )}

      {!result && (
        <section className="mt-8">
          <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            Day
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {weekDates.map((date) => {
              const iso = formatISODate(date)
              const label = date
                .toLocaleDateString('en-US', { weekday: 'short' })
                .toUpperCase()
              return (
                <Pill
                  key={iso}
                  selected={selectedDateISO === iso}
                  onClick={() => setSelectedDate(date)}
                >
                  {label}
                </Pill>
              )
            })}
          </div>
        </section>
      )}

      {candidates.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">
          No sessions scheduled on {formatDayOption(selectedDate)} to
          prioritize between — pick a different day, or nothing's on the
          calendar yet.
        </p>
      ) : !result ? (
        <>
          <section className="mt-6">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Time available
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIME_AVAILABLE_OPTIONS.map((minutes) => (
                <Pill
                  key={minutes}
                  selected={timeAvailable === minutes}
                  onClick={() => setTimeAvailable(minutes)}
                >
                  {timeLabel(minutes)}
                </Pill>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Physical feeling
            </h2>
            <div className="mt-3">
              <SegmentedToggle
                options={FEELING_OPTIONS}
                value={physicalFeeling}
                onChange={setPhysicalFeeling}
              />
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Mental / stress feeling
            </h2>
            <div className="mt-3">
              <SegmentedToggle
                options={FEELING_OPTIONS}
                value={mentalFeeling}
                onChange={setMentalFeeling}
              />
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Anything else? (optional)
            </h2>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. legs feel heavy, stressed about work..."
              rows={3}
              className="mt-3 w-full rounded-xl border-2 border-ink bg-white px-4 py-3 text-sm text-ink placeholder:text-gray-400 focus:outline-none"
            />
          </section>

          <Button className="mt-8" disabled={loading} onClick={submit}>
            {loading ? 'Thinking…' : 'Get a recommendation'}
          </Button>

          {error && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="mt-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {recommendationHeading(result.recommendation)}
            </h2>
            <p className="mt-2 text-sm text-gray-700">{result.reasoning}</p>
          </section>

          <div className="mt-6 flex flex-col gap-3">
            {candidates.map((session) => (
              <SessionSummaryCard
                key={session.id}
                session={session}
                highlighted={
                  result.recommendation === 'session' &&
                  result.recommendedSessionId === session.id
                }
                onClick={() => goToSession(session.id)}
              />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button variant="subtle" onClick={() => setResult(null)}>
              Ask again
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Prioritize
