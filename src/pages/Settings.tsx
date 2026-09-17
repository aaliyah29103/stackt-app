import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ActivityBadgeIcon,
  BackArrowIcon,
  EditIcon,
  ChevronDownIcon,
  TrashIcon,
} from '../assets/icons'
import { Button } from '../components/Button'
import Pill from '../components/Pill'
import Toggle from '../components/Toggle'
import ConfirmDialog from '../components/ConfirmDialog'
import SettingsSection from '../components/SettingsSection'
import SettingsRow from '../components/SettingsRow'
import Toast from '../components/Toast'
import { appendBlankRace, raceDateLabel, raceDisplayName } from '../lib/race'
import { useLocalStorage } from '../lib/useLocalStorage'
import {
  BODY_AREAS,
  DEFAULT_PROFILE,
  DEFAULT_TRAINING_BLOCK,
  SEX_OPTIONS,
  STORAGE_KEYS,
  TRAINING_EXPERIENCE_OPTIONS,
  type BodyArea,
  type NotificationsPreferences,
  type Profile,
  type RaceEntry,
  type TrainingBlockSettings,
  type TrainingExperience,
  type UnitsPreferences,
  type WorkoutTemplate,
} from '../types'

function toggleArea(list: BodyArea[], area: BodyArea): BodyArea[] {
  return list.includes(area) ? list.filter((a) => a !== area) : [...list, area]
}

const DEFAULT_UNITS: UnitsPreferences = {
  distance: 'km',
  weight: 'kg',
}

const DEFAULT_NOTIFICATIONS: NotificationsPreferences = {
  conflictCheckIns: true,
}

const RECOVERY_CAPACITY_LABELS: Record<TrainingExperience, string> = {
  Slower: 'Slower (48h)',
  Average: 'Average (36h)',
  Faster: 'Faster (24h)',
}

function trainingBlockSummary(settings: TrainingBlockSettings) {
  const length =
    settings.mode === 'auto'
      ? 'Auto'
      : `Manual${settings.manualWeeks ? ` · ${settings.manualWeeks}wk` : ''}`
  const alternate = settings.alternateWeeks ? 'A/B weeks on' : 'A/B weeks off'
  return `${length} · ${alternate}`
}

function Settings() {
  const navigate = useNavigate()

  const [profile, setProfile] = useLocalStorage<Profile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE,
  )
  const [races, setRaces] = useLocalStorage<RaceEntry[]>(
    STORAGE_KEYS.races,
    [],
  )
  const [units, setUnits] = useLocalStorage<UnitsPreferences>(
    STORAGE_KEYS.units,
    DEFAULT_UNITS,
  )
  const [notifications, setNotifications] =
    useLocalStorage<NotificationsPreferences>(
      STORAGE_KEYS.notifications,
      DEFAULT_NOTIFICATIONS,
    )
  const [trainingBlock, setTrainingBlock] = useLocalStorage<TrainingBlockSettings>(
    STORAGE_KEYS.trainingBlock,
    DEFAULT_TRAINING_BLOCK,
  )
  const [templates, setTemplates] = useLocalStorage<WorkoutTemplate[]>(
    STORAGE_KEYS.templates,
    [],
  )

  // "About You" is a draft/Save section: edits only touch this local state
  // until "Save" commits them to `profile` (and localStorage) all at once.
  // Unmounting (navigating away) without saving simply discards the draft.
  const [profileDraft, setProfileDraft] = useState<Profile>(() => ({
    ...profile,
    // Legacy stored profiles predate these two fields — default them rather
    // than crash on the missing arrays.
    injuryProneAreas: profile.injuryProneAreas ?? [],
    nursingInjuryAreas: profile.nursingInjuryAreas ?? [],
  }))
  const [showProfileSaved, setShowProfileSaved] = useState(false)

  const saveProfile = () => {
    setProfile(profileDraft)
    setShowProfileSaved(true)
    setTimeout(() => setShowProfileSaved(false), 2000)
  }

  const [pendingDeleteRaceId, setPendingDeleteRaceId] = useState<
    string | null
  >(null)
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false)
  const pendingDeleteRace = races.find(
    (race) => race.id === pendingDeleteRaceId,
  )

  const addRace = () => {
    setRaces(appendBlankRace)
    navigate('/race-setup')
  }

  const confirmDeleteRace = () => {
    if (!pendingDeleteRaceId) return
    setRaces((current) =>
      current.filter((race) => race.id !== pendingDeleteRaceId),
    )
    setPendingDeleteRaceId(null)
  }

  const clearData = () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
    setProfile(DEFAULT_PROFILE)
    setProfileDraft(DEFAULT_PROFILE)
    setRaces([])
    setUnits(DEFAULT_UNITS)
    setNotifications(DEFAULT_NOTIFICATIONS)
    setTrainingBlock(DEFAULT_TRAINING_BLOCK)
    setTemplates([])
  }

  const confirmClearData = () => {
    clearData()
    setShowClearDataConfirm(false)
  }

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
        Profile &amp; Settings
      </h1>

      <div className="mt-6 flex flex-col gap-8">
        <SettingsSection
          title="About You"
          description="Optional — helps tailor conflict and recovery guidance."
          footer={
            <div className="mt-2 flex justify-end">
              <Button variant="subtle" onClick={saveProfile}>
                Save
              </Button>
            </div>
          }
        >
          <SettingsRow label="Name">
            <input
              type="text"
              value={profileDraft.name}
              onChange={(event) =>
                setProfileDraft((p) => ({ ...p, name: event.target.value }))
              }
              placeholder="Add"
              className="w-24 text-right text-[15px] text-gray-400 placeholder:text-gray-300 focus:outline-none"
            />
          </SettingsRow>

          <SettingsRow label="Age">
            <input
              type="text"
              inputMode="numeric"
              value={profileDraft.age}
              onChange={(event) =>
                setProfileDraft((p) => ({ ...p, age: event.target.value }))
              }
              placeholder="Add"
              className="w-24 text-right text-[15px] text-gray-400 placeholder:text-gray-300 focus:outline-none"
            />
          </SettingsRow>

          <SettingsRow label="Sex">
            <select
              value={profileDraft.sex}
              onChange={(event) =>
                setProfileDraft((p) => ({
                  ...p,
                  sex: event.target.value as Profile['sex'],
                }))
              }
              className={`bg-transparent text-center text-[15px] focus:outline-none ${
                profileDraft.sex === 'Prefer not to say'
                  ? 'text-gray-400'
                  : 'text-ink'
              }`}
            >
              {SEX_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </SettingsRow>

          <SettingsRow label="Height">
            <input
              type="text"
              value={profileDraft.height}
              onChange={(event) =>
                setProfileDraft((p) => ({ ...p, height: event.target.value }))
              }
              placeholder="Add"
              className="w-24 text-right text-[15px] text-gray-400 placeholder:text-gray-300 focus:outline-none"
            />
          </SettingsRow>

          <SettingsRow label="Recovery Capacity">
            <select
              value={profileDraft.trainingExperience}
              onChange={(event) =>
                setProfileDraft((p) => ({
                  ...p,
                  trainingExperience: event.target
                    .value as Profile['trainingExperience'],
                }))
              }
              className={`bg-transparent text-[15px] focus:outline-none ${
                profileDraft.trainingExperience
                  ? 'text-center font-semibold text-ink'
                  : 'text-right text-gray-300'
              }`}
            >
              <option value="">Add</option>
              {TRAINING_EXPERIENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {RECOVERY_CAPACITY_LABELS[option]}
                </option>
              ))}
            </select>
          </SettingsRow>

          <div className="flex flex-col gap-2 border-b border-gray-100 p-4">
            <span className="text-[15px] font-medium text-ink">
              Injury-prone areas
            </span>
            <p className="text-[13px] text-gray-400">
              Permanent — areas that need extra recovery time every time.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {BODY_AREAS.map((area) => (
                <Pill
                  key={area}
                  selected={profileDraft.injuryProneAreas.includes(area)}
                  onClick={() =>
                    setProfileDraft((p) => ({
                      ...p,
                      injuryProneAreas: toggleArea(p.injuryProneAreas, area),
                    }))
                  }
                >
                  {area}
                </Pill>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 p-4">
            <span className="text-[15px] font-medium text-ink">
              Currently nursing an injury
            </span>
            <p className="text-[13px] text-gray-400">
              Temporary — toggle on or off any time as it changes.
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {BODY_AREAS.map((area) => (
                <Pill
                  key={area}
                  selected={profileDraft.nursingInjuryAreas.includes(area)}
                  onClick={() =>
                    setProfileDraft((p) => ({
                      ...p,
                      nursingInjuryAreas: toggleArea(
                        p.nursingInjuryAreas,
                        area,
                      ),
                    }))
                  }
                >
                  {area}
                </Pill>
              ))}
            </div>
          </div>
        </SettingsSection>

        <section className="w-full">
          <h2 className="px-1 text-[11px] font-bold tracking-widest text-gray-500 uppercase">
            Race Goals
          </h2>
          <div className="mt-2 flex flex-col gap-3">
            {races.length === 0 && (
              <p className="px-1 text-sm text-gray-400">
                No races added yet.
              </p>
            )}
            {races.map((race) => (
              <div
                key={race.id}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="text-base font-bold text-ink">
                    {raceDisplayName(race)}
                  </p>
                  <p className="text-[13px] text-gray-400">
                    {raceDateLabel(race)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigate('/race-setup')}
                    aria-label={`Edit ${raceDisplayName(race)}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-accent"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDeleteRaceId(race.id)}
                    aria-label={`Delete ${raceDisplayName(race)}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRace}
            className="mt-3 text-sm font-bold text-accent"
          >
            + Add another race
          </button>
        </section>

        <SettingsSection title="Training">
          <SettingsRow
            label="Workout Library"
            onClick={() => navigate('/workout-library')}
          >
            <span className="flex items-center gap-2">
              <span className="text-[13px] text-gray-400">
                {templates.length} saved
              </span>
              <ChevronDownIcon className="h-2 w-3 -rotate-90 text-gray-400" />
            </span>
          </SettingsRow>
          <SettingsRow
            label="Training block"
            onClick={() => navigate('/training-block')}
            last
          >
            <span className="flex items-center gap-2">
              <span className="text-[13px] text-gray-400">
                {trainingBlockSummary(trainingBlock)}
              </span>
              <ChevronDownIcon className="h-2 w-3 -rotate-90 text-gray-400" />
            </span>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Units">
          <SettingsRow label="Distance">
            <select
              value={units.distance}
              onChange={(event) =>
                setUnits((u) => ({
                  ...u,
                  distance: event.target.value as UnitsPreferences['distance'],
                }))
              }
              className="bg-transparent text-center text-[15px] text-gray-600 focus:outline-none"
            >
              <option value="km">Kilometers</option>
              <option value="mi">Miles</option>
            </select>
          </SettingsRow>
          <SettingsRow label="Weight" last>
            <select
              value={units.weight}
              onChange={(event) =>
                setUnits((u) => ({
                  ...u,
                  weight: event.target.value as UnitsPreferences['weight'],
                }))
              }
              className="bg-transparent text-center text-[15px] text-gray-600 focus:outline-none"
            >
              <option value="kg">Kilograms</option>
              <option value="lb">Pounds</option>
            </select>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow label="Conflict check-ins" last>
            <Toggle
              checked={notifications.conflictCheckIns}
              onChange={(checked) =>
                setNotifications((n) => ({ ...n, conflictCheckIns: checked }))
              }
              label="Conflict check-ins"
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Integrations">
          <SettingsRow
            label="Strava"
            icon={<ActivityBadgeIcon className="h-5 w-5 text-orange-500" />}
            disabled
            last
          >
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Coming soon
            </span>
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Data">
          <button
            type="button"
            onClick={() => setShowClearDataConfirm(true)}
            className="w-full p-4 text-center text-[15px] font-semibold text-red-500"
          >
            Clear my data
          </button>
        </SettingsSection>
      </div>

      <Toast message="Profile saved" show={showProfileSaved} />

      <ConfirmDialog
        open={!!pendingDeleteRace}
        title="Delete Race"
        description={`Are you sure you want to delete ${
          pendingDeleteRace ? raceDisplayName(pendingDeleteRace) : 'this race'
        }? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteRace}
        onCancel={() => setPendingDeleteRaceId(null)}
      />

      <ConfirmDialog
        open={showClearDataConfirm}
        title="Clear All Data"
        description="This will permanently erase all your sessions, workout templates, races, and settings. This action cannot be undone."
        confirmLabel="Clear Data"
        variant="danger"
        onConfirm={confirmClearData}
        onCancel={() => setShowClearDataConfirm(false)}
      />
    </div>
  )
}

export default Settings
