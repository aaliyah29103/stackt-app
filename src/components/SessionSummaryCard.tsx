import type { ReactNode } from 'react'
import { formatDayOption, parseISODate } from '../lib/date'
import { DISCIPLINE_COLORS } from '../lib/disciplineColors'
import type { LoggedSession } from '../types'

type SessionSummaryCardProps = {
  session: LoggedSession
  /** Small leading badge icon (e.g. a warning triangle) — omit for a plain card. */
  badgeIcon?: ReactNode
  /** Accent border/tint — used to mark a card as the recommended/primary option. */
  highlighted?: boolean
  /** Makes the whole card a tappable button (e.g. "choose this session"). */
  onClick?: () => void
}

/**
 * Compact discipline/day/slot/summary card for a single session — shared by
 * the Conflict Flagged detail screen and the Prioritization Assistant so both
 * represent "here's a specific session" the same way.
 */
function SessionSummaryCard({
  session,
  badgeIcon,
  highlighted = false,
  onClick,
}: SessionSummaryCardProps) {
  const colors = DISCIPLINE_COLORS[session.discipline]

  const content = (
    <>
      {badgeIcon && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning">
          {badgeIcon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <span
          className={`inline-block rounded px-2 py-1 text-[10px] font-black tracking-wide uppercase ${colors.bg} ${colors.text}`}
        >
          {session.discipline}
        </span>
        <p className="mt-2 text-sm font-bold text-ink">
          {formatDayOption(parseISODate(session.date))} · {session.slot}
        </p>
        <p className="mt-1 text-sm text-gray-600">{session.summary}</p>
      </div>
    </>
  )

  const className = `flex w-full items-start gap-3 rounded-2xl border p-4 text-left ${
    highlighted ? 'border-accent bg-accent/5' : 'border-gray-200 bg-white'
  }`

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

export default SessionSummaryCard
