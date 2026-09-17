import Pill from './Pill'
import { DISCIPLINE_COLORS } from '../lib/disciplineColors'
import { DISCIPLINES, type Discipline } from '../types'

type DisciplinePickerProps = {
  selected: Discipline | null
  onSelect: (discipline: Discipline) => void
}

function DisciplinePicker({ selected, onSelect }: DisciplinePickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DISCIPLINES.map((discipline) => {
        const colors = DISCIPLINE_COLORS[discipline]
        return (
          <Pill
            key={discipline}
            selected={selected === discipline}
            onClick={() => onSelect(discipline)}
            selectedClassName={`${colors.border} ${colors.bg} ${colors.text}`}
          >
            {discipline}
          </Pill>
        )
      })}
    </div>
  )
}

export default DisciplinePicker
