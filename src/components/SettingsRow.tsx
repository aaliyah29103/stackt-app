import type { ReactNode } from 'react'

type SettingsRowProps = {
  label: string
  icon?: ReactNode
  children?: ReactNode
  onClick?: () => void
  last?: boolean
  disabled?: boolean
}

function SettingsRow({
  label,
  icon,
  children,
  onClick,
  last = false,
  disabled = false,
}: SettingsRowProps) {
  const className = `flex w-full items-center justify-between gap-4 p-4 text-left ${
    last ? '' : 'border-b border-gray-100'
  } ${disabled ? 'opacity-40' : ''}`

  const content = (
    <>
      <span className="flex items-center gap-3">
        {icon}
        <span className="text-[15px] font-medium text-ink">{label}</span>
      </span>
      {children}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={className}
      >
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

export default SettingsRow
