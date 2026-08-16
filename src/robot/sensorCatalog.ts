import type { IrMode, SensorType } from '../types/domain'
import { ANALOG_PINS, DIGITAL_PINS } from './pins'

export interface SensorCatalogEntry {
  type: SensorType
  priceCredits: number
  weightGrams: number
  availablePins: string[]
}

// Display label/description text lives in i18n/translations.ts (catalog.<type>.label/description)
// so the catalog stays language-agnostic — see components/sensors/SensorCatalogCard.tsx.
export const sensorCatalog: SensorCatalogEntry[] = [
  {
    type: 'ir',
    priceCredits: 50,
    weightGrams: 5,
    availablePins: ANALOG_PINS,
  },
  {
    type: 'ultrasonic',
    priceCredits: 150,
    weightGrams: 12,
    availablePins: DIGITAL_PINS.slice(0, 6),
  },
  {
    type: 'color',
    priceCredits: 200,
    weightGrams: 8,
    availablePins: DIGITAL_PINS.slice(6, 12),
  },
]

export function getCatalogEntry(type: SensorType): SensorCatalogEntry {
  const entry = sensorCatalog.find((candidate) => candidate.type === type)
  if (!entry) throw new Error(`No catalog entry for sensor type "${type}"`)
  return entry
}

export const IR_COUNT_OPTIONS = [2, 3, 5, 8] as const
export const IR_MODE_OPTIONS: IrMode[] = ['digital', 'analog']
