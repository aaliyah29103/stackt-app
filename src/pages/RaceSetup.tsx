import { Link, useNavigate } from 'react-router-dom'
import { BackArrowIcon, PlusSmallIcon, RemoveIcon } from '../assets/icons'
import { Button } from '../components/Button'
import DateInput from '../components/DateInput'
import Pill from '../components/Pill'
import { appendBlankRace, createBlankRace } from '../lib/race'
import { useLocalStorage } from '../lib/useLocalStorage'
import { RACE_TYPES, STORAGE_KEYS, type RaceEntry } from '../types'

function RaceSetup() {
  const navigate = useNavigate()
  const [races, setRaces] = useLocalStorage<RaceEntry[]>(STORAGE_KEYS.races, () => [
    createBlankRace(),
  ])

  const updateRace = (id: string, changes: Partial<Omit<RaceEntry, 'id'>>) => {
    setRaces((current) =>
      current.map((race) => (race.id === id ? { ...race, ...changes } : race)),
    )
  }

  const addRace = () => {
    setRaces(appendBlankRace)
  }

  const removeRace = (id: string) => {
    setRaces((current) =>
      current.length > 1 ? current.filter((race) => race.id !== id) : current,
    )
  }

  const canContinue = races.some((race) => race.raceType !== null)

  return (
    <div className="min-h-full bg-gray-100 px-6 pt-6 pb-28">
      <Link
        to="/"
        aria-label="Back to Weekly Planner"
        className="flex h-10 w-10 items-center justify-center text-gray-400"
      >
        <BackArrowIcon className="h-5 w-4.5" />
      </Link>

      <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">
        What are you training for?
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Add each race or event you're training for. You can add more than
        one.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {races.map((race) => (
          <div
            key={race.id}
            className="relative flex flex-col gap-6 rounded-2xl border-2 border-gray-400 bg-white p-6 shadow-sm"
          >
            {races.length > 1 && (
              <button
                type="button"
                onClick={() => removeRace(race.id)}
                aria-label="Remove race"
                className="absolute top-4 right-4 text-gray-400"
              >
                <RemoveIcon className="h-3.5 w-3.5" />
              </button>
            )}

            <div>
              <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Race Type
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {RACE_TYPES.map((type) => (
                  <Pill
                    key={type}
                    selected={race.raceType === type}
                    onClick={() => updateRace(race.id, { raceType: type })}
                    selectedClassName="border-accent bg-accent text-white"
                  >
                    {type}
                  </Pill>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Date
              </h2>
              <div className="mt-3">
                <DateInput
                  value={race.date}
                  onChange={(value) => updateRace(race.id, { date: value })}
                  placeholder="e.g. Sep 6, 2026"
                />
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Label (Optional)
              </h2>
              <input
                type="text"
                value={race.label}
                onChange={(event) =>
                  updateRace(race.id, { label: event.target.value })
                }
                placeholder="e.g. HYROX London"
                className="mt-3 h-12 w-full rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRace}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 border-dashed bg-white/50 py-4 text-sm font-bold text-gray-500"
        >
          <PlusSmallIcon className="h-3 w-2.5" />
          Add another race
        </button>
      </div>

      <div className="mt-8">
        <Button
          variant="dark"
          disabled={!canContinue}
          onClick={() => navigate('/')}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

export default RaceSetup
