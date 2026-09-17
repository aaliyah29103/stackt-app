import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddIcon, BookmarkIcon, LibraryIcon, RaceIcon } from '../assets/icons'
import ConfirmDialog from './ConfirmDialog'
import LogEntryChoice from './LogEntryChoice'
import { appendBlankRace } from '../lib/race'
import { useLocalStorage } from '../lib/useLocalStorage'
import { STORAGE_KEYS, type RaceEntry } from '../types'

type AddMenuProps = {
  open: boolean
  onClose: () => void
}

const OPTIONS = [
  {
    label: 'Log a session',
    to: '/log',
    Icon: AddIcon,
  },
  {
    label: 'Create a template',
    to: '/log/template',
    Icon: BookmarkIcon,
  },
  {
    label: 'Workout Library',
    to: '/workout-library',
    Icon: LibraryIcon,
  },
  {
    label: 'Add a target race',
    to: '/race-setup',
    Icon: RaceIcon,
    // Always land on a fresh blank race, same as Settings' "+ Add another race" —
    // otherwise this entry point shows an existing race pre-filled with no visual
    // cue it isn't blank, and editing it silently overwrites that race in place.
    appendBlankRace: true,
  },
] as const

function AddMenu({ open, onClose }: AddMenuProps) {
  const navigate = useNavigate()
  const [, setRaces] = useLocalStorage<RaceEntry[]>(STORAGE_KEYS.races, [])
  const [showLogChoice, setShowLogChoice] = useState(false)

  const handleSelect = (option: (typeof OPTIONS)[number]) => {
    onClose()
    // "Log a session" forks into "from a template" vs "blank" instead of
    // always landing straight on the blank Log a Session form.
    if (option.to === '/log') {
      setShowLogChoice(true)
      return
    }
    if ('appendBlankRace' in option && option.appendBlankRace) {
      setRaces(appendBlankRace)
    }
    navigate(option.to)
  }

  return (
    <>
      <ConfirmDialog
        open={open}
        variant="neutral"
        title="Add to Your Plan"
        description="Choose what you'd like to do next."
        onDismiss={onClose}
        options={OPTIONS.map((option) => ({
          label: option.label,
          icon: <option.Icon className="h-4 w-4" />,
          onSelect: () => handleSelect(option),
        }))}
      />

      <LogEntryChoice
        open={showLogChoice}
        onClose={() => setShowLogChoice(false)}
      />
    </>
  )
}

export default AddMenu
