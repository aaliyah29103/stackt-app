import { PlusSmallIcon, RemoveIcon } from '../../assets/icons'
import { makeDetailId } from '../../lib/session'
import type { StrengthExercise } from '../../types'

function createSet() {
  return { id: makeDetailId(), reps: '', weight: '' }
}

function createExercise(): StrengthExercise {
  return { id: makeDetailId(), name: '', sets: [createSet()] }
}

type StrengthFieldsProps = {
  value: StrengthExercise[]
  onChange: (value: StrengthExercise[]) => void
}

function StrengthFields({ value: exercises, onChange }: StrengthFieldsProps) {
  const updateName = (id: number, name: string) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, name } : exercise,
      ),
    )
  }

  const updateSet = (
    exerciseId: number,
    setId: number,
    field: 'reps' | 'weight',
    value: string,
  ) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set,
              ),
            }
          : exercise,
      ),
    )
  }

  const addSet = (exerciseId: number) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, createSet()] }
          : exercise,
      ),
    )
  }

  const removeSet = (exerciseId: number, setId: number) => {
    onChange(
      exercises.map((exercise) =>
        exercise.id === exerciseId && exercise.sets.length > 1
          ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
          : exercise,
      ),
    )
  }

  const addExercise = () => {
    onChange([...exercises, createExercise()])
  }

  const duplicateExercise = (exerciseId: number) => {
    const index = exercises.findIndex((exercise) => exercise.id === exerciseId)
    if (index === -1) return
    const original = exercises[index]
    const copy: StrengthExercise = {
      id: makeDetailId(),
      name: original.name,
      sets: original.sets.map((set) => ({ ...set, id: makeDetailId() })),
    }
    onChange([
      ...exercises.slice(0, index + 1),
      copy,
      ...exercises.slice(index + 1),
    ])
  }

  const removeExercise = (exerciseId: number) => {
    if (exercises.length <= 1) return
    onChange(exercises.filter((exercise) => exercise.id !== exerciseId))
  }

  return (
    <div className="flex flex-col gap-6">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={exercise.name}
              onChange={(event) => updateName(exercise.id, event.target.value)}
              placeholder="Exercise name"
              className="h-12 min-w-0 flex-1 rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm font-bold text-ink placeholder:font-normal placeholder:text-gray-400 focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => duplicateExercise(exercise.id)}
              aria-label="Duplicate exercise"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-400"
            >
              <PlusSmallIcon className="h-3 w-2.5" />
            </button>
            <button
              type="button"
              onClick={() => removeExercise(exercise.id)}
              aria-label="Delete exercise"
              className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400"
            >
              <RemoveIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-3 pl-[60px] text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              <span className="w-16 text-center">Reps</span>
              <span className="w-20 text-center">Weight</span>
            </div>
            {exercise.sets.map((set, index) => (
              <div key={set.id} className="flex items-center gap-3">
                <span className="w-12 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                  Set {index + 1}
                </span>
                <input
                  type="text"
                  value={set.reps}
                  onChange={(event) =>
                    updateSet(exercise.id, set.id, 'reps', event.target.value)
                  }
                  className="h-11 w-16 rounded-xl border border-gray-300 bg-white text-center text-sm text-ink focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={set.weight}
                  onChange={(event) =>
                    updateSet(exercise.id, set.id, 'weight', event.target.value)
                  }
                  className="h-11 w-20 rounded-xl border border-gray-300 bg-white text-center text-sm text-ink focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeSet(exercise.id, set.id)}
                  aria-label="Remove set"
                  className="text-gray-400"
                >
                  <RemoveIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSet(exercise.id)}
              className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-500"
            >
              <PlusSmallIcon className="h-2.5 w-2" />
              Add set
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addExercise}
        className="flex items-center justify-center gap-2 text-sm font-bold tracking-wide text-gray-500 uppercase"
      >
        <PlusSmallIcon className="h-2.5 w-2" />
        Add exercise
      </button>
    </div>
  )
}

export default StrengthFields
