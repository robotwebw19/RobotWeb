import { useTranslation } from '../../i18n/useTranslation'

interface PinAssignmentSelectProps {
  value: string
  options: string[]
  usedPins: string[]
  onChange: (pin: string) => void
}

export function PinAssignmentSelect({ value, options, usedPins, onChange }: PinAssignmentSelectProps) {
  const { t } = useTranslation()
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={t('sensors.pin')}>
      {options.map((pin) => (
        <option key={pin} value={pin} disabled={usedPins.includes(pin) && pin !== value}>
          {pin}
        </option>
      ))}
    </select>
  )
}
