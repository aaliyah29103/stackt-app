import { useState } from 'react'
import { CalendarIcon, ChevronDownIcon } from '../assets/icons'
import {
  formatFullDayLabel,
  formatISODate,
  formatMonthYear,
  formatWeekOfLabel,
  getCalendarGrid,
  getTodayISODate,
  parseISODate,
  parseLooseDate,
} from '../lib/date'

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

type DateInputProps = {
  /** ISO date (YYYY-MM-DD), or '' when nothing is selected yet. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Show the weekday name in the trigger's label (e.g. "Monday, Aug 17, 2026"). */
  showWeekday?: boolean
}

function DateInput({
  value,
  onChange,
  placeholder = 'Select a date',
  className,
  showWeekday = false,
}: DateInputProps) {
  const [open, setOpen] = useState(false)
  // `value` is normally a clean ISO string ("YYYY-MM-DD"), but a field that
  // existed before this picker did (e.g. Training Block's start date) may still
  // hold whatever loosely-formatted text was typed into the old free-text
  // input. parseLooseDate handles both, so the picker never renders "Invalid
  // Date" garbage for stale data — it just treats it as this component's plan
  // to normalize on the next selection.
  const parsedValue = value ? parseLooseDate(value) : null
  const [viewDate, setViewDate] = useState(
    () => parsedValue ?? parseISODate(getTodayISODate()),
  )

  const openPicker = () => {
    setViewDate(parsedValue ?? parseISODate(getTodayISODate()))
    setOpen(true)
  }

  const selectDay = (day: Date) => {
    onChange(formatISODate(day))
    setOpen(false)
  }

  const changeMonth = (offset: number) => {
    setViewDate((current) => {
      const next = new Date(current)
      next.setDate(1)
      next.setMonth(next.getMonth() + offset)
      return next
    })
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const grid = getCalendarGrid(year, month)
  const todayIso = getTodayISODate()
  const selectedIso = parsedValue ? formatISODate(parsedValue) : null

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className={
          className ??
          'flex h-12 w-full items-center justify-between rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 focus:border-accent focus:outline-none'
        }
      >
        <span className={parsedValue ? 'font-medium text-ink' : 'text-gray-400'}>
          {parsedValue
            ? showWeekday
              ? formatFullDayLabel(parsedValue)
              : formatWeekOfLabel(parsedValue)
            : value || placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close date picker"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-white px-6 pt-3 pb-8 shadow-[0_-8px_24px_rgba(0,0,0,0.15)]">
            <div className="flex justify-center pb-4">
              <span className="h-1 w-9 rounded-full bg-gray-300" />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
                className="flex h-9 w-9 items-center justify-center text-gray-400"
              >
                <ChevronDownIcon className="h-2.5 w-3.5 rotate-90" />
              </button>
              <span className="text-base font-bold text-ink">
                {formatMonthYear(viewDate)}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
                className="flex h-9 w-9 items-center justify-center text-gray-400"
              >
                <ChevronDownIcon className="h-2.5 w-3.5 -rotate-90" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-y-1">
              {WEEKDAY_LABELS.map((label, index) => (
                <span
                  key={index}
                  className="py-1 text-center text-[10px] font-bold tracking-widest text-gray-400 uppercase"
                >
                  {label}
                </span>
              ))}
              {grid.map((day) => {
                const iso = formatISODate(day)
                const inMonth = day.getMonth() === month
                const isToday = iso === todayIso
                const isSelected = iso === selectedIso
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm ${
                      isSelected
                        ? 'bg-accent font-bold text-white'
                        : isToday
                          ? 'border-2 border-ink font-bold text-ink'
                          : inMonth
                            ? 'font-medium text-ink'
                            : 'text-gray-300'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => selectDay(parseISODate(todayIso))}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border-2 border-gray-300 border-dashed text-sm font-bold text-gray-600"
            >
              Jump to Today
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default DateInput
