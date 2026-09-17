import { useNavigate } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'
import { AddIcon, LibraryIcon } from '../assets/icons'
import type { Discipline, Slot } from '../types'

type LogEntryChoiceProps = {
  open: boolean
  onClose: () => void
  /** Pre-fills the target date/slot when a specific slot was tapped. */
  date?: string
  slot?: Slot
  /** Pre-filters the Workout Library when the tapped slot already implies one. */
  discipline?: Discipline
}

/**
 * Shown wherever a new session can be started ("+Add" on a slot, or the global
 * "+" menu's "Log a session"): lets the user choose between starting from a
 * saved template or a blank session, instead of always landing on the blank
 * Log a Session form with template selection buried inside it.
 */
function LogEntryChoice({
  open,
  onClose,
  date,
  slot,
  discipline,
}: LogEntryChoiceProps) {
  const navigate = useNavigate()

  const baseParams = new URLSearchParams()
  if (date) baseParams.set('date', date)
  if (slot) baseParams.set('slot', slot)

  const goToLibrary = () => {
    const params = new URLSearchParams(baseParams)
    params.set('pick', '1')
    if (discipline) params.set('discipline', discipline)
    onClose()
    navigate(`/workout-library?${params.toString()}`)
  }

  const goToBlank = () => {
    onClose()
    const query = baseParams.toString()
    navigate(`/log${query ? `?${query}` : ''}`)
  }

  return (
    <ConfirmDialog
      open={open}
      variant="neutral"
      title="Log a Session"
      description="Start from a saved workout, or create a brand new one."
      onDismiss={onClose}
      options={[
        {
          label: 'Select from Workout Library',
          icon: <LibraryIcon className="h-4 w-4" />,
          onSelect: goToLibrary,
          emphasis: 'primary',
        },
        {
          label: 'Create new workout',
          icon: <AddIcon className="h-4 w-4" />,
          onSelect: goToBlank,
        },
      ]}
    />
  )
}

export default LogEntryChoice
