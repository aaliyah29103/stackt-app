import { PlusSmallIcon, RemoveIcon } from '../../assets/icons'
import { makeDetailId } from '../../lib/session'
import type { IntervalDetail, IntervalRow } from '../../types'

type IntervalFieldsProps = {
  paceLabel: string
  value: IntervalDetail
  onChange: (value: IntervalDetail) => void
}

function createRow(): IntervalRow {
  return { id: makeDetailId(), distance: '', pace: '', rest: '' }
}

const fieldClass =
  'h-12 rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none'

const toggleClass = (active: boolean) =>
  `flex-1 rounded-xl border-2 text-xs font-bold uppercase transition-colors ${
    active
      ? 'border-accent bg-accent/10 text-accent'
      : 'border-gray-300 border-dashed bg-white text-gray-400'
  }`

const labelClass =
  'text-[10px] font-bold tracking-widest text-gray-400 uppercase'

function IntervalFields({ paceLabel, value, onChange }: IntervalFieldsProps) {
  const {
    mode,
    steadyDistance,
    steadyPace,
    repeats,
    structure,
    uniformRow,
    customRows,
  } = value

  const updateUniformRow = (
    field: keyof Omit<IntervalRow, 'id'>,
    fieldValue: string,
  ) => {
    onChange({ ...value, uniformRow: { ...uniformRow, [field]: fieldValue } })
  }

  const updateCustomRow = (
    id: number,
    field: keyof Omit<IntervalRow, 'id'>,
    fieldValue: string,
  ) => {
    onChange({
      ...value,
      customRows: customRows.map((row) =>
        row.id === id ? { ...row, [field]: fieldValue } : row,
      ),
    })
  }

  const addCustomRow = () => {
    onChange({ ...value, customRows: [...customRows, createRow()] })
  }

  const removeCustomRow = (id: number) => {
    if (customRows.length <= 1) return
    onChange({
      ...value,
      customRows: customRows.filter((row) => row.id !== id),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className={labelClass}>Structure</h2>
        <div className="mt-3 flex h-12 gap-2">
          {(['steady', 'intervals'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ ...value, mode: option })}
              className={toggleClass(mode === option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {mode === 'steady' ? (
        <div className="flex gap-4">
          <div className="flex-1">
            <h2 className={labelClass}>Distance</h2>
            <input
              type="text"
              value={steadyDistance}
              onChange={(event) =>
                onChange({ ...value, steadyDistance: event.target.value })
              }
              placeholder="10 km"
              className={`mt-3 w-full ${fieldClass}`}
            />
          </div>
          <div className="flex-1">
            <h2 className={labelClass}>{paceLabel}</h2>
            <input
              type="text"
              value={steadyPace}
              onChange={(event) =>
                onChange({ ...value, steadyPace: event.target.value })
              }
              placeholder="5:00"
              className={`mt-3 w-full ${fieldClass}`}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className={labelClass}>Repeats</h2>
            <input
              type="text"
              value={repeats}
              onChange={(event) =>
                onChange({ ...value, repeats: event.target.value })
              }
              placeholder="6"
              className={`mt-3 w-full ${fieldClass}`}
            />
          </div>

          <div>
            <h2 className={labelClass}>Pattern</h2>
            <div className="mt-3 flex h-12 gap-2">
              {(['uniform', 'custom'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ ...value, structure: option })}
                  className={toggleClass(structure === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {structure === 'uniform' ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={uniformRow.distance}
                onChange={(event) =>
                  updateUniformRow('distance', event.target.value)
                }
                placeholder="400m"
                className={`min-w-0 flex-1 text-center ${fieldClass}`}
              />
              <input
                type="text"
                value={uniformRow.pace}
                onChange={(event) =>
                  updateUniformRow('pace', event.target.value)
                }
                placeholder={paceLabel}
                className={`min-w-0 flex-1 text-center ${fieldClass}`}
              />
              <input
                type="text"
                value={uniformRow.rest}
                onChange={(event) =>
                  updateUniformRow('rest', event.target.value)
                }
                placeholder="Rest"
                className={`min-w-0 flex-1 text-center ${fieldClass}`}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 pl-8 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                <span className="flex-1 text-center">Dist / Time</span>
                <span className="flex-1 text-center">{paceLabel}</span>
                <span className="flex-1 text-center">Rest</span>
              </div>
              {customRows.map((row, index) => (
                <div key={row.id} className="flex items-center gap-2">
                  <span className="w-6 text-[10px] font-bold text-gray-400">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={row.distance}
                    onChange={(event) =>
                      updateCustomRow(row.id, 'distance', event.target.value)
                    }
                    className="h-11 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-2 text-center text-sm text-ink focus:border-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    value={row.pace}
                    onChange={(event) =>
                      updateCustomRow(row.id, 'pace', event.target.value)
                    }
                    className="h-11 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-2 text-center text-sm text-ink focus:border-accent focus:outline-none"
                  />
                  <input
                    type="text"
                    value={row.rest}
                    onChange={(event) =>
                      updateCustomRow(row.id, 'rest', event.target.value)
                    }
                    className="h-11 min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-2 text-center text-sm text-ink focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomRow(row.id)}
                    aria-label="Remove rep"
                    className="text-gray-400"
                  >
                    <RemoveIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCustomRow}
                className="mt-1 flex items-center gap-2 text-xs font-bold text-gray-500"
              >
                <PlusSmallIcon className="h-2.5 w-2" />
                Add rep
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default IntervalFields
