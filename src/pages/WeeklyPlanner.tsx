import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  FlagIcon,
  LinkIcon,
  PlusSmallIcon,
  QuestionMarkIcon,
  TrashIcon,
  WarningIcon,
} from '../assets/icons'
import ConfirmDialog from '../components/ConfirmDialog'
import LogEntryChoice from '../components/LogEntryChoice'
import Toast from '../components/Toast'
import { findConflictPairs } from '../lib/conflict'
import {
  addDays,
  formatISODate,
  formatWeekOfLabel,
  getActiveWeek,
  getMonday,
  resolveAbReferenceDate,
  startOfDay,
} from '../lib/date'
import { DISCIPLINE_COLORS } from '../lib/disciplineColors'
import {
  raceColor,
  raceDateLabel,
  raceDisplayName,
  sortRacesBySoonest,
} from '../lib/race'
import { useLocalStorage } from '../lib/useLocalStorage'
import { dateSlotKey } from '../lib/weeklyPlan'
import {
  DEFAULT_PROFILE,
  DEFAULT_TRAINING_BLOCK,
  SLOTS,
  STORAGE_KEYS,
  type Discipline,
  type LoggedSession,
  type Profile,
  type RaceEntry,
  type Slot,
  type TrainingBlockSettings,
} from '../types'

const SESSION_CARD_CLASS =
  'flex h-16 w-full flex-col items-center justify-center gap-0.5 rounded-lg border border-gray-700 bg-ink p-2'

function sessionCardContent(
  session: LoggedSession,
  isConflicting: boolean,
  onConflictClick: () => void,
) {
  const colors = DISCIPLINE_COLORS[session.discipline]
  return (
    <>
      <span className="flex items-center gap-1">
        <span
          className={`text-[10px] font-bold tracking-wide uppercase ${colors.text}`}
        >
          {session.discipline}
        </span>
        {isConflicting && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onConflictClick()
            }}
            aria-label="Recovery conflict — tap to review"
            title="Recovery conflict — too little rest since a shared body area was last loaded"
            className="text-warning"
          >
            <WarningIcon className="h-2.5 w-2.5" />
          </button>
        )}
      </span>
      <span className="text-center text-sm font-bold text-white">
        {session.summary}
      </span>
    </>
  )
}

/**
 * Groups a slot's sessions by shared linkGroupId — linked pairs render together,
 * everything else renders as its own single-item group.
 */
function groupBySlotLink(slotSessions: LoggedSession[]): LoggedSession[][] {
  const groups: LoggedSession[][] = []
  const seen = new Set<string>()
  slotSessions.forEach((session) => {
    if (seen.has(session.id)) return
    if (session.linkGroupId) {
      const group = slotSessions.filter(
        (s) => s.linkGroupId === session.linkGroupId,
      )
      group.forEach((s) => seen.add(s.id))
      groups.push(group)
    } else {
      seen.add(session.id)
      groups.push([session])
    }
  })
  return groups
}

type SessionCardProps = {
  session: LoggedSession
  onDelete: () => void
  onLink?: () => void
  isConflicting: boolean
  onConflictClick: () => void
}

function SessionCard({
  session,
  onDelete,
  onLink,
  isConflicting,
  onConflictClick,
}: SessionCardProps) {
  return (
    <div className="relative h-16 w-full">
      {session.completed ? (
        <Link to={`/session?id=${session.id}`} className={SESSION_CARD_CLASS}>
          {sessionCardContent(session, isConflicting, onConflictClick)}
        </Link>
      ) : (
        <div className={SESSION_CARD_CLASS}>
          {sessionCardContent(session, isConflicting, onConflictClick)}
        </div>
      )}
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${session.discipline} session`}
        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400"
      >
        <TrashIcon className="h-2.5 w-2.5" />
      </button>
      {onLink && (
        <button
          type="button"
          onClick={onLink}
          aria-label={`Link ${session.discipline} session`}
          className="absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400"
        >
          <LinkIcon className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  )
}

type LinkedGroupProps = {
  sessions: LoggedSession[]
  onDeleteSession: (id: string) => void
  onUnlink: () => void
  conflictingIds: Set<string>
  onConflictClick: (sessionId: string) => void
}

function LinkedGroup({
  sessions,
  onDeleteSession,
  onUnlink,
  conflictingIds,
  onConflictClick,
}: LinkedGroupProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-accent bg-accent/5 p-2">
      <div className="flex items-center justify-between px-1">
        <span className="flex items-center gap-1 text-[9px] font-bold tracking-widest text-accent uppercase">
          <LinkIcon className="h-2.5 w-2.5" />
          Linked
        </span>
        <button
          type="button"
          onClick={onUnlink}
          className="text-[9px] font-bold tracking-widest text-gray-400 uppercase"
        >
          Unlink
        </button>
      </div>
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onDelete={() => onDeleteSession(session.id)}
          isConflicting={conflictingIds.has(session.id)}
          onConflictClick={() => onConflictClick(session.id)}
        />
      ))}
    </div>
  )
}

function WeeklyPlanner() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('Session saved')

  useEffect(() => {
    const state = location.state as { toast?: string } | null
    if (!state?.toast) return
    setToastMessage(state.toast)
    setShowToast(true)
    // Clear the navigation state so a manual page reload doesn't re-trigger the toast.
    navigate(location.pathname, { replace: true })
    const timeout = setTimeout(() => setShowToast(false), 2000)
    return () => clearTimeout(timeout)
    // Only ever fire once, right after arriving with fresh navigation state.
  }, [])

  const [sessions, setSessions] = useLocalStorage<LoggedSession[]>(
    STORAGE_KEYS.sessions,
    [],
  )
  const [, setPlanExclusions] = useLocalStorage<string[]>(
    STORAGE_KEYS.planExclusions,
    [],
  )
  const [trainingBlock] = useLocalStorage<TrainingBlockSettings>(
    STORAGE_KEYS.trainingBlock,
    DEFAULT_TRAINING_BLOCK,
  )
  const [races] = useLocalStorage<RaceEntry[]>(STORAGE_KEYS.races, [])
  const [profile] = useLocalStorage<Profile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE,
  )
  const [bannerDismissed, setBannerDismissed] = useLocalStorage<boolean>(
    STORAGE_KEYS.raceBannerDismissed,
    false,
  )
  const [weekOffset, setWeekOffset] = useState(0)
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<
    string | null
  >(null)
  const [pendingLinkSessionId, setPendingLinkSessionId] = useState<
    string | null
  >(null)
  const [pendingAddContext, setPendingAddContext] = useState<{
    date: string
    slot: Slot
    discipline?: Discipline
  } | null>(null)

  const today = startOfDay(new Date())
  const weekStart = addDays(getMonday(today), weekOffset * 7)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const abWeekLabel = (() => {
    if (!trainingBlock.alternateWeeks) return null
    const reference = resolveAbReferenceDate(trainingBlock, races)
    const week = getActiveWeek(reference, weekStart)
    if (!week) return null
    const weekName = week === 'A' ? trainingBlock.weekALabel : trainingBlock.weekBLabel
    return weekName ? `Week ${week} — ${weekName}` : `Week ${week}`
  })()

  const toggleDayCompleted = (dateStr: string) => {
    setSessions((current) => {
      const daySessions = current.filter((session) => session.date === dateStr)
      const allCompleted =
        daySessions.length > 0 &&
        daySessions.every((session) => session.completed)
      return current.map((session) =>
        session.date === dateStr
          ? { ...session, completed: !allCompleted }
          : session,
      )
    })
  }

  const weekSessions = sessions.filter((session) =>
    weekDates.some((d) => formatISODate(d) === session.date),
  )
  const hasAnySessions = weekSessions.length > 0

  // Computed against every session, not just this visible week, so a conflict
  // spanning into an adjacent day/week (just outside the calendar grid shown
  // here) is still caught — not only same-day pairs.
  const conflictPairs = findConflictPairs(sessions, {
    trainingExperience: profile.trainingExperience,
    injuryProneAreas: profile.injuryProneAreas ?? [],
    nursingInjuryAreas: profile.nursingInjuryAreas ?? [],
  })
  const conflictingIds = new Set<string>()
  conflictPairs.forEach((pair) => {
    conflictingIds.add(pair.sessionA.id)
    conflictingIds.add(pair.sessionB.id)
  })
  const goToConflictPair = (pair: (typeof conflictPairs)[number]) =>
    navigate(`/conflict?a=${pair.sessionA.id}&b=${pair.sessionB.id}`)
  const handleConflictClick = (sessionId: string) => {
    const pair = conflictPairs.find(
      (p) => p.sessionA.id === sessionId || p.sessionB.id === sessionId,
    )
    if (pair) goToConflictPair(pair)
  }
  const weekConflictPairs = conflictPairs.filter(
    (pair) =>
      weekDates.some((d) => formatISODate(d) === pair.sessionA.date) ||
      weekDates.some((d) => formatISODate(d) === pair.sessionB.date),
  )

  const pendingDeleteSession = sessions.find(
    (session) => session.id === pendingDeleteSessionId,
  )

  const confirmDeleteSession = () => {
    if (!pendingDeleteSessionId) return
    if (pendingDeleteSession?.planGenerated) {
      // Deliberately vacated by the user — the Weekly Plan must never refill this
      // exact date/slot again, same as editing or moving it detaches it.
      const key = dateSlotKey(pendingDeleteSession.date, pendingDeleteSession.slot)
      setPlanExclusions((current) =>
        current.includes(key) ? current : [...current, key],
      )
    }
    setSessions((current) =>
      current.filter((session) => session.id !== pendingDeleteSessionId),
    )
    setPendingDeleteSessionId(null)
  }

  const pendingLinkSession = sessions.find(
    (session) => session.id === pendingLinkSessionId,
  )
  const linkCandidates = pendingLinkSession
    ? sessions.filter(
        (session) =>
          session.date === pendingLinkSession.date &&
          session.slot === pendingLinkSession.slot &&
          session.id !== pendingLinkSession.id &&
          !session.linkGroupId,
      )
    : []

  const confirmLink = (candidateId: string) => {
    if (!pendingLinkSessionId) return
    const groupId = crypto.randomUUID()
    setSessions((current) =>
      current.map((session) =>
        session.id === pendingLinkSessionId || session.id === candidateId
          ? { ...session, linkGroupId: groupId }
          : session,
      ),
    )
    setPendingLinkSessionId(null)
  }

  const unlinkGroup = (groupId: string) => {
    setSessions((current) =>
      current.map((session) =>
        session.linkGroupId === groupId
          ? { ...session, linkGroupId: undefined }
          : session,
      ),
    )
  }

  const configuredRaces = races.filter(
    (race) => race.raceType || race.date || race.label,
  )
  const topRaces = sortRacesBySoonest(configuredRaces).slice(0, 2)

  return (
    <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
      {!bannerDismissed && (
        <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setBannerDismissed(true)}
            className="absolute top-3 right-3 text-gray-400"
          >
            <CloseIcon className="h-4 w-3" />
          </button>

          <div className="flex gap-3 pr-6">
            <FlagIcon className="mt-1 h-4 w-3.5 shrink-0 text-gray-400" />
            <div>
              <h2 className="text-lg font-bold text-ink">Add a race goal</h2>
              <p className="mt-1 text-sm text-gray-500">
                Anchor your week to an upcoming race.
                <br />
                Optional — skip and log sessions freely.
              </p>
            </div>
          </div>

          <div className="mt-3 flex gap-4">
            <Link
              to="/race-setup"
              className="border-b-2 border-accent pb-0.5 text-sm font-bold text-accent"
            >
              Set up a race
            </Link>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="text-sm font-bold text-gray-400"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((value) => value - 1)}
          aria-label="Previous week"
          className="flex h-8 w-8 items-center justify-center text-gray-400"
        >
          <ChevronDownIcon className="h-2 w-3 rotate-90" />
        </button>
        <div className="text-center">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            Week of {formatWeekOfLabel(weekStart)}
          </p>
          {abWeekLabel && (
            <p className="mt-1 text-xs font-bold tracking-wide text-accent uppercase">
              {abWeekLabel}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setWeekOffset((value) => value + 1)}
          aria-label="Next week"
          className="flex h-8 w-8 items-center justify-center text-gray-400"
        >
          <ChevronDownIcon className="h-2 w-3 -rotate-90" />
        </button>
      </div>

      {topRaces.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {topRaces.map((race) => {
            const colors = raceColor(race)
            return (
              <div
                key={race.id}
                className={`flex-1 rounded-md border px-3 py-1.5 ${colors.border} ${colors.bg}`}
              >
                <p
                  className={`truncate text-[10px] font-bold tracking-wide uppercase ${colors.text}`}
                >
                  {raceDisplayName(race)}
                </p>
                <p className="truncate text-xs font-bold text-ink">
                  {raceDateLabel(race)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <h3 className="mt-4 text-xl font-bold text-ink">
        {hasAnySessions
          ? "This week's sessions"
          : 'Log your sessions below'}
      </h3>

      <div className="mt-4 flex gap-4 px-2">
        <span className="w-[60px] text-xs font-bold text-gray-400 uppercase">
          Day
        </span>
        <span className="flex-1 text-center text-xs font-bold text-gray-400 uppercase">
          AM
        </span>
        <span className="flex-1 text-center text-xs font-bold text-gray-400 uppercase">
          PM
        </span>
      </div>

      <ul className="mt-2 flex flex-col gap-3">
        {weekDates.map((date) => {
          const dateStr = formatISODate(date)
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
          const daySessions = sessions.filter(
            (session) => session.date === dateStr,
          )
          const hasSessions = daySessions.length > 0
          const isFuture = date > today
          const allCompleted =
            hasSessions && daySessions.every((session) => session.completed)
          const checkboxInteractive = hasSessions && !isFuture

          return (
            <li key={dateStr} className="flex items-start gap-4">
              <div className="flex w-[60px] flex-col items-center gap-1 pt-0">
                <button
                  type="button"
                  disabled={!checkboxInteractive}
                  onClick={() => toggleDayCompleted(dateStr)}
                  aria-label={
                    allCompleted
                      ? `Mark ${dayLabel} incomplete`
                      : `Mark ${dayLabel} complete`
                  }
                  className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
                    allCompleted
                      ? 'bg-success'
                      : 'border-2 border-gray-300 bg-white'
                  } ${checkboxInteractive ? '' : 'opacity-50'}`}
                >
                  {allCompleted && (
                    <CheckIcon className="h-3 w-2.5 text-white" />
                  )}
                </button>
                <span className="text-sm font-bold text-gray-500 uppercase">
                  {dayLabel}
                </span>
              </div>

              {SLOTS.map((slot) => {
                const slotSessions = daySessions.filter(
                  (s) => s.slot === slot,
                )
                const groups = groupBySlotLink(slotSessions)
                const isEmpty = groups.length === 0

                return (
                  <div
                    key={slot}
                    className={`flex flex-1 flex-col gap-2 ${isEmpty ? '' : 'relative'}`}
                  >
                    {groups.map((group) =>
                      group.length > 1 ? (
                        <LinkedGroup
                          key={group[0].linkGroupId}
                          sessions={group}
                          onDeleteSession={(id) =>
                            setPendingDeleteSessionId(id)
                          }
                          onUnlink={() =>
                            unlinkGroup(group[0].linkGroupId as string)
                          }
                          conflictingIds={conflictingIds}
                          onConflictClick={handleConflictClick}
                        />
                      ) : (
                        <SessionCard
                          key={group[0].id}
                          session={group[0]}
                          onDelete={() =>
                            setPendingDeleteSessionId(group[0].id)
                          }
                          onLink={
                            slotSessions.some(
                              (s) => !s.linkGroupId && s.id !== group[0].id,
                            )
                              ? () => setPendingLinkSessionId(group[0].id)
                              : undefined
                          }
                          isConflicting={conflictingIds.has(group[0].id)}
                          onConflictClick={() =>
                            handleConflictClick(group[0].id)
                          }
                        />
                      ),
                    )}
                    {isEmpty ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAddContext({ date: dateStr, slot })
                        }
                        className="flex h-16 w-full items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 bg-white"
                      >
                        <PlusSmallIcon className="h-3 w-2.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-400">
                          Add
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setPendingAddContext({
                            date: dateStr,
                            slot,
                            discipline: slotSessions[0].discipline,
                          })
                        }
                        aria-label="Add another session to this slot"
                        className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-700 bg-gray-900 text-gray-400 opacity-40 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                      >
                        <PlusSmallIcon className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                )
              })}
            </li>
          )
        })}
      </ul>

      <p className="mt-6 px-8 text-center text-[10px] text-gray-400">
        Want alternating weeks or a fixed block length? Set that up anytime in
        Settings.
      </p>

      {weekConflictPairs.length > 0 && (
        <button
          type="button"
          onClick={() => goToConflictPair(weekConflictPairs[0])}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-warning/30 bg-warning-bg px-4 py-3 text-sm font-bold text-warning"
        >
          <WarningIcon className="h-3.5 w-3.5" />
          {weekConflictPairs.length}{' '}
          {weekConflictPairs.length === 1 ? 'conflict' : 'conflicts'} this
          week — tap to review
        </button>
      )}

      <Toast message={toastMessage} show={showToast} />

      <ConfirmDialog
        open={!!pendingDeleteSession}
        title="Delete Session"
        description="Are you sure you want to delete this session? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteSession}
        onCancel={() => setPendingDeleteSessionId(null)}
      />

      {pendingLinkSession && (
        <>
          <button
            type="button"
            aria-label="Cancel linking"
            onClick={() => setPendingLinkSessionId(null)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white px-6 pt-3 pb-10 shadow-[0_-8px_24px_rgba(0,0,0,0.15)]">
            <div className="flex justify-center pb-6">
              <span className="h-1 w-9 rounded-full bg-gray-300" />
            </div>

            <h2 className="text-center text-lg font-bold text-ink">
              Link Sessions
            </h2>
            <p className="mt-1 text-center text-sm text-gray-500">
              Choose a session to link with {pendingLinkSession.discipline} —{' '}
              {pendingLinkSession.summary}. Linked sessions run back-to-back
              with zero rest between them, like a brick.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {linkCandidates.length === 0 ? (
                <p className="text-center text-sm text-gray-400">
                  No other unlinked sessions in this slot yet.
                </p>
              ) : (
                linkCandidates.map((candidate) => {
                  const colors = DISCIPLINE_COLORS[candidate.discipline]
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => confirmLink(candidate.id)}
                      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left"
                    >
                      <span
                        className={`rounded px-2 py-1 text-[10px] font-black tracking-wide uppercase ${colors.bg} ${colors.text}`}
                      >
                        {candidate.discipline}
                      </span>
                      <span className="text-base font-bold text-ink">
                        {candidate.summary}
                      </span>
                    </button>
                  )
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => setPendingLinkSessionId(null)}
              className="mt-6 w-full py-3 text-center text-base font-bold text-gray-500"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <LogEntryChoice
        open={!!pendingAddContext}
        onClose={() => setPendingAddContext(null)}
        date={pendingAddContext?.date}
        slot={pendingAddContext?.slot}
        discipline={pendingAddContext?.discipline}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 mx-auto flex w-full max-w-md justify-end px-6">
        <Link
          to="/prioritize"
          aria-label="What should I prioritize?"
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg"
        >
          <QuestionMarkIcon className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}

export default WeeklyPlanner
