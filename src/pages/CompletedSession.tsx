import { Link, useSearchParams } from 'react-router-dom'
import { BackArrowIcon, CheckIcon } from '../assets/icons'
import { formatDayOption, parseISODate } from '../lib/date'
import { DISCIPLINE_COLORS } from '../lib/disciplineColors'
import { paceLabelForDiscipline } from '../lib/session'
import { useLocalStorage } from '../lib/useLocalStorage'
import { STORAGE_KEYS, type LoggedSession } from '../types'

function SessionDetailFields({ session }: { session: LoggedSession }) {
  const { detail } = session
  if (!detail) return null

  const labelClass =
    'text-[10px] font-bold tracking-widest text-gray-400 uppercase'

  if (detail.kind === 'strength') {
    return (
      <section className="mt-8">
        <h2 className={labelClass}>Exercises</h2>
        <div className="mt-3 flex flex-col gap-4">
          {detail.exercises.map((exercise) => (
            <div key={exercise.id}>
              <p className="text-sm font-bold text-ink">
                {exercise.name || 'Untitled exercise'}
              </p>
              <div className="mt-1 flex flex-col gap-1">
                {exercise.sets.map((set, index) => (
                  <p key={set.id} className="text-sm text-gray-700">
                    Set {index + 1}: {set.reps || '—'} reps @{' '}
                    {set.weight || '—'}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (detail.kind === 'interval') {
    const { interval } = detail
    const paceLabel = paceLabelForDiscipline(session.discipline)
    return (
      <section className="mt-8">
        <h2 className={labelClass}>Workout Detail</h2>
        <div className="mt-3 flex flex-col gap-1">
          {interval.mode === 'steady' ? (
            <>
              <p className="text-sm text-gray-700">
                Distance: {interval.steadyDistance || '—'}
              </p>
              <p className="text-sm text-gray-700">
                {paceLabel}: {interval.steadyPace || '—'}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Repeats: {interval.repeats || '—'}
              </p>
              {interval.structure === 'uniform' ? (
                <p className="text-sm text-gray-700">
                  {interval.uniformRow.distance || '—'} @{' '}
                  {interval.uniformRow.pace || '—'} · Rest{' '}
                  {interval.uniformRow.rest || '—'}
                </p>
              ) : (
                <div className="mt-1 flex flex-col gap-1">
                  {interval.customRows.map((row, index) => (
                    <p key={row.id} className="text-sm text-gray-700">
                      {index + 1}. {row.distance || '—'} @ {row.pace || '—'} ·
                      Rest {row.rest || '—'}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    )
  }

  const { hyrox } = detail
  return (
    <section className="mt-8">
      <h2 className={labelClass}>Workout Detail</h2>
      <div className="mt-3 flex flex-col gap-3">
        <p className="text-sm text-gray-700">Rounds: {hyrox.rounds || '—'}</p>
        {hyrox.blocks.map((block) => (
          <div key={block.id} className="flex flex-col gap-1">
            {block.rows.length > 1 && (
              <p className="text-[10px] font-bold tracking-widest text-accent uppercase">
                Superset
              </p>
            )}
            {block.rows.map((row) => {
              const sets = row.sets ?? '1'
              const setsCount = Number(sets)
              const showSets = Number.isFinite(setsCount) && setsCount > 1
              return (
                <div key={row.id}>
                  <p className="text-sm font-bold text-ink">
                    {row.name || 'Untitled movement'}
                  </p>
                  <p className="text-sm text-gray-700">
                    {row.type}: {row.value || '—'}
                    {showSets ? ` × ${sets} sets` : ''} · Rest:{' '}
                    {row.rest || '—'}
                  </p>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

function CompletedSession() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [sessions] = useLocalStorage<LoggedSession[]>(STORAGE_KEYS.sessions, [])
  const session = sessions.find((s) => s.id === id)

  return (
    <div className="min-h-full bg-gray-100 px-6 pt-6 pb-24">
      <Link
        to="/"
        aria-label="Back to Weekly Planner"
        className="flex h-10 w-10 items-center justify-center text-gray-400"
      >
        <BackArrowIcon className="h-5 w-4.5" />
      </Link>

      {!session ? (
        <p className="mt-8 text-sm text-gray-500">
          This session couldn't be found — it may have been deleted.
        </p>
      ) : (
        <>
          <span className="mt-6 flex w-fit items-center gap-1.5 rounded-full bg-success-bg py-1.5 pr-3 pl-2 text-xs font-bold text-success">
            <CheckIcon className="h-2.5 w-2" />
            Completed
          </span>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-ink">
            Session Details
          </h1>

          <section className="mt-8">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Discipline
            </h2>
            <span
              className={`mt-3 inline-block rounded px-2 py-1 text-[10px] font-black tracking-wide uppercase ${DISCIPLINE_COLORS[session.discipline].bg} ${DISCIPLINE_COLORS[session.discipline].text}`}
            >
              {session.discipline}
            </span>
          </section>

          <section className="mt-8 flex gap-4">
            <div className="flex-1">
              <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Day
              </h2>
              <p className="mt-3 text-sm font-medium text-ink">
                {formatDayOption(parseISODate(session.date))}
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Slot
              </h2>
              <p className="mt-3 text-sm font-medium text-ink">
                {session.slot}
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Session Focus
            </h2>
            <p className="mt-3 text-sm text-gray-700">{session.summary}</p>
          </section>

          <SessionDetailFields session={session} />

          <Link
            to={`/log?sessionId=${session.id}`}
            className="mt-8 inline-block border-b-2 border-accent pb-0.5 text-sm font-bold text-accent"
          >
            Edit
          </Link>
        </>
      )}
    </div>
  )
}

export default CompletedSession
