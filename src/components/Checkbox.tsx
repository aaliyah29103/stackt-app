import { CheckIcon } from '../assets/icons'

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
          checked ? 'bg-accent' : 'bg-gray-300'
        }`}
      >
        {checked && <CheckIcon className="h-3 w-2.5 text-white" />}
      </span>
      <span className="text-sm font-bold text-ink">{label}</span>
    </button>
  )
}

export default Checkbox
