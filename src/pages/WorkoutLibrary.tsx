import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BackArrowIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../assets/icons'
import ConfirmDialog from '../components/ConfirmDialog'
import { LinkButton } from '../components/Button'
import Pill from '../components/Pill'
import { DISCIPLINE_COLORS } from '../lib/disciplineColors'
import { useLocalStorage } from '../lib/useLocalStorage'
import {
  DISCIPLINES,
  STORAGE_KEYS,
  type Discipline,
  type WorkoutTemplate,
} from '../types'

const FILTERS = ['All', ...DISCIPLINES] as const
type Filter = (typeof FILTERS)[number]

function isDiscipline(value: string | null): value is Discipline {
  return DISCIPLINES.includes(value as Discipline)
}

function WorkoutLibrary() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // "Pick mode": reached via "+Add" or the global "+" menu's "Select from
  // Workout Library" — tapping a template here starts a session from it,
  // rather than the normal browse/edit/delete-only behavior.
  const isPicking = searchParams.get('pick') === '1'
  const pickDate = searchParams.get('date')
  const pickSlot = searchParams.get('slot')
  const [templates, setTemplates] = useLocalStorage<WorkoutTemplate[]>(
    STORAGE_KEYS.templates,
    [],
  )
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>(() => {
    const discipline = searchParams.get('discipline')
    return isDiscipline(discipline) ? discipline : 'All'
  })
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const selectTemplate = (templateId: string) => {
    const params = new URLSearchParams()
    if (pickDate) params.set('date', pickDate)
    if (pickSlot) params.set('slot', pickSlot)
    params.set('templateId', templateId)
    navigate(`/log?${params.toString()}`)
  }

  const filtered = templates.filter((template) => {
    const matchesFilter = filter === 'All' || template.discipline === filter
    const query = search.trim().toLowerCase()
    const matchesSearch =
      !query ||
      template.name.toLowerCase().includes(query) ||
      template.focus.toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  const pendingDeleteTemplate = templates.find(
    (template) => template.id === pendingDeleteId,
  )

  const confirmDelete = () => {
    if (!pendingDeleteId) return
    setTemplates((current) =>
      current.filter((template) => template.id !== pendingDeleteId),
    )
    setPendingDeleteId(null)
  }

  return (
    <div className="min-h-full bg-gray-100 px-4 pt-6 pb-24">
      <div className="flex items-center gap-2 px-2">
        <Link
          to={isPicking ? '/' : '/settings'}
          aria-label={isPicking ? 'Back to Weekly Planner' : 'Back to Settings'}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-gray-400"
        >
          <BackArrowIcon className="h-5 w-4.5" />
        </Link>
        <h1 className="text-lg font-extrabold text-ink">
          {isPicking ? 'Select a Workout' : 'Workout Library'}
        </h1>
      </div>

      <div className="relative mt-6 px-2">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-6 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search saved workouts..."
          className="h-12 w-full rounded-xl bg-gray-100 pr-4 pl-11 text-sm text-ink placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-2 pb-1">
        {FILTERS.map((option) => (
          <Pill
            key={option}
            selected={filter === option}
            onClick={() => setFilter(option)}
            selectedClassName="border-ink bg-ink text-white"
            unselectedClassName="border-gray-200 bg-gray-100 text-gray-600"
          >
            {option}
          </Pill>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 px-2">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            {templates.length === 0
              ? 'No saved workouts yet.'
              : 'No workouts match your search.'}
          </p>
        )}

        {filtered.map((template) => {
          const colors = DISCIPLINE_COLORS[template.discipline]
          return (
            <div
              key={template.id}
              onClick={
                isPicking ? () => selectTemplate(template.id) : undefined
              }
              role={isPicking ? 'button' : undefined}
              tabIndex={isPicking ? 0 : undefined}
              aria-label={isPicking ? `Use ${template.name}` : undefined}
              className={`flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 ${
                isPicking ? 'cursor-pointer' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <span
                  className={`inline-block rounded px-2 py-1 text-[10px] font-black tracking-wide uppercase ${colors.bg} ${colors.text}`}
                >
                  {template.discipline}
                </span>
                <p className="mt-1 truncate text-base font-bold text-ink">
                  {template.name}
                </p>
                <p className="truncate text-xs font-medium text-gray-500">
                  {template.focus || 'No focus set'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    navigate(`/log/template?id=${template.id}`)
                  }}
                  aria-label={`Edit ${template.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-accent"
                >
                  <EditIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setPendingDeleteId(template.id)
                  }}
                  aria-label={`Delete ${template.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 px-2">
        <LinkButton
          to="/log/template"
          variant="outline"
          icon={<PlusIcon className="h-4 w-3.5" />}
        >
          Create New Workout
        </LinkButton>
      </div>

      <ConfirmDialog
        open={!!pendingDeleteTemplate}
        title="Delete Workout"
        description="Are you sure you want to delete this workout? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  )
}

export default WorkoutLibrary
