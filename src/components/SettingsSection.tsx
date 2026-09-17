import type { ReactNode } from 'react'

type SettingsSectionProps = {
  title: string
  description?: string
  /** Rendered below the bordered card — e.g. a section-level Save button. */
  footer?: ReactNode
  children: ReactNode
}

function SettingsSection({
  title,
  description,
  footer,
  children,
}: SettingsSectionProps) {
  return (
    <section className="w-full">
      <h2 className="px-1 text-[11px] font-bold tracking-widest text-gray-500 uppercase">
        {title}
      </h2>
      {description && (
        <p className="mt-1 px-1 text-[13px] text-gray-400">{description}</p>
      )}
      <div className="mt-2 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {children}
      </div>
      {footer}
    </section>
  )
}

export default SettingsSection
