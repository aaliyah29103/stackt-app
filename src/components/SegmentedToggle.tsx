type SegmentedToggleProps<T extends string> = {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  getLabel?: (value: T) => string
}

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  getLabel,
}: SegmentedToggleProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`h-12 flex-1 rounded-xl border-2 px-3 text-xs font-bold uppercase transition-colors ${
            value === option
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-gray-300 border-dashed bg-white text-gray-400'
          }`}
        >
          {getLabel ? getLabel(option) : option}
        </button>
      ))}
    </div>
  )
}

export default SegmentedToggle
