import type { ReactNode } from 'react'

type PillProps = {
  selected: boolean
  onClick: () => void
  children: ReactNode
  selectedClassName?: string
  unselectedClassName?: string
}

const DEFAULT_SELECTED = 'border-accent bg-accent/10 text-accent'
const DEFAULT_UNSELECTED = 'border-gray-300 border-dashed bg-white text-gray-700'

function Pill({
  selected,
  onClick,
  children,
  selectedClassName = DEFAULT_SELECTED,
  unselectedClassName = DEFAULT_UNSELECTED,
}: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-12 rounded-full border-2 px-4 text-sm font-bold transition-colors ${
        selected ? selectedClassName : unselectedClassName
      }`}
    >
      {children}
    </button>
  )
}

export default Pill
