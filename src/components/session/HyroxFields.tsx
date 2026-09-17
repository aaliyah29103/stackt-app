import { PlusSmallIcon, RemoveIcon } from '../../assets/icons'
import { makeDetailId } from '../../lib/session'
import { HYROX_ROW_TYPES, type HyroxBlock, type HyroxDetail } from '../../types'

type HyroxFieldsProps = {
  value: HyroxDetail
  onChange: (value: HyroxDetail) => void
}

function createRow() {
  return {
    id: makeDetailId(),
    type: 'Distance' as const,
    name: '',
    value: '',
    sets: '1',
    rest: '',
  }
}

function createBlock(rowCount: number): HyroxBlock {
  return { id: makeDetailId(), rows: Array.from({ length: rowCount }, createRow) }
}

function HyroxFields({ value, onChange }: HyroxFieldsProps) {
  const { rounds, blocks } = value

  const updateRow = (
    blockId: number,
    rowId: number,
    field: 'type' | 'name' | 'value' | 'sets' | 'rest',
    fieldValue: string,
  ) => {
    onChange({
      ...value,
      blocks: blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              rows: block.rows.map((row) =>
                row.id === rowId ? { ...row, [field]: fieldValue } : row,
              ),
            }
          : block,
      ),
    })
  }

  const addBlock = () => {
    onChange({ ...value, blocks: [...blocks, createBlock(1)] })
  }

  const addSuperset = () => {
    onChange({ ...value, blocks: [...blocks, createBlock(2)] })
  }

  const addRowToBlock = (blockId: number) => {
    onChange({
      ...value,
      blocks: blocks.map((block) =>
        block.id === blockId
          ? { ...block, rows: [...block.rows, createRow()] }
          : block,
      ),
    })
  }

  const removeRow = (blockId: number, rowId: number) => {
    onChange({
      ...value,
      blocks: blocks
        .map((block) =>
          block.id === blockId
            ? { ...block, rows: block.rows.filter((row) => row.id !== rowId) }
            : block,
        )
        .filter((block) => block.rows.length > 0),
    })
  }

  const removeBlock = (blockId: number) => {
    if (blocks.length <= 1) return
    onChange({ ...value, blocks: blocks.filter((block) => block.id !== blockId) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Rounds
        </h2>
        <input
          type="text"
          value={rounds}
          onChange={(event) => onChange({ ...value, rounds: event.target.value })}
          placeholder="5"
          className="mt-3 h-12 w-full rounded-xl border-2 border-gray-300 border-dashed bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-4">
        {blocks.map((block) => {
          const isSuperset = block.rows.length > 1
          return (
            <div
              key={block.id}
              className={
                isSuperset
                  ? 'flex flex-col gap-2 rounded-xl border-2 border-ink p-3'
                  : 'flex flex-col gap-2'
              }
            >
              {isSuperset && (
                <span className="text-[10px] font-bold tracking-widest text-accent uppercase">
                  Superset
                </span>
              )}
              {block.rows.map((row) => (
                <div key={row.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <select
                      value={row.type}
                      onChange={(event) =>
                        updateRow(block.id, row.id, 'type', event.target.value)
                      }
                      className="h-11 w-24 shrink-0 rounded-xl border-2 border-gray-300 bg-white px-1 text-center text-[10px] font-bold text-gray-700 uppercase focus:border-accent focus:outline-none"
                    >
                      {HYROX_ROW_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={row.name ?? ''}
                      onChange={(event) =>
                        updateRow(block.id, row.id, 'name', event.target.value)
                      }
                      placeholder="Movement"
                      className="h-11 min-w-0 flex-1 rounded-xl border-2 border-gray-300 border-dashed bg-white px-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(block.id, row.id)}
                      aria-label="Remove row"
                      className="text-gray-400"
                    >
                      <RemoveIcon className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pl-[104px]">
                    <input
                      type="text"
                      value={row.value}
                      onChange={(event) =>
                        updateRow(block.id, row.id, 'value', event.target.value)
                      }
                      placeholder="e.g. 500m"
                      className="h-10 min-w-0 flex-[1.4] rounded-xl border-2 border-gray-300 border-dashed bg-white px-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                    />
                    <input
                      type="text"
                      value={row.sets ?? '1'}
                      onChange={(event) =>
                        updateRow(block.id, row.id, 'sets', event.target.value)
                      }
                      aria-label="Sets"
                      placeholder="Sets"
                      className="h-10 w-12 shrink-0 rounded-xl border-2 border-gray-300 border-dashed bg-white px-1 text-center text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                    />
                    <input
                      type="text"
                      value={row.rest ?? ''}
                      onChange={(event) =>
                        updateRow(block.id, row.id, 'rest', event.target.value)
                      }
                      placeholder="Rest"
                      className="h-10 min-w-0 flex-1 rounded-xl border-2 border-gray-300 border-dashed bg-white px-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => addRowToBlock(block.id)}
                  className="flex items-center gap-2 text-xs font-bold text-gray-500"
                >
                  <PlusSmallIcon className="h-2.5 w-2" />
                  {isSuperset ? 'Add to superset' : 'Add row'}
                </button>
                {isSuperset && (
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="text-xs font-bold text-gray-400"
                  >
                    Remove superset
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={addBlock}
          className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-500 uppercase"
        >
          <PlusSmallIcon className="h-2.5 w-2" />
          Add row
        </button>
        <button
          type="button"
          onClick={addSuperset}
          className="flex items-center gap-2 text-sm font-bold tracking-wide text-accent uppercase"
        >
          <PlusSmallIcon className="h-2.5 w-2" />
          Add superset
        </button>
      </div>
    </div>
  )
}

export default HyroxFields
