import type { WorkoutTemplate } from '../types'

type TemplatePickerProps = {
  templates: WorkoutTemplate[]
  value: string | null
  onChange: (templateId: string | null) => void
  placeholder?: string
  className?: string
}

function TemplatePicker({
  templates,
  value,
  onChange,
  placeholder = '— None —',
  className,
}: TemplatePickerProps) {
  return (
    <select
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
      className={
        className ??
        'h-11 w-full rounded-xl border-2 border-gray-300 bg-white px-3 text-center text-sm text-gray-700 focus:border-accent focus:outline-none'
      }
    >
      <option value="">{placeholder}</option>
      {templates.map((template) => (
        <option key={template.id} value={template.id}>
          {template.discipline} · {template.name}
        </option>
      ))}
    </select>
  )
}

export default TemplatePicker
