type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex h-6 w-11 shrink-0 items-center rounded-full px-1 transition-colors ${
        checked ? 'justify-end bg-success' : 'justify-start bg-gray-300'
      }`}
    >
      <span className="h-4 w-4 rounded-full bg-white" />
    </button>
  )
}

export default Toggle
