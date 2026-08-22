import type { SensorType } from '../types/domain'
import { DIGITAL_PINS } from './pins'

export interface SensorCatalogEntry {
  type: SensorType
  priceCredits: number
  weightGrams: number
  availablePins: string[]
}

// Display label/description text lives in i18n/translations.ts (catalog.<type>.label/description)
// so the catalog stays language-agnostic — see components/sensors/EquipmentCard.tsx.
export const sensorCatalog: SensorCatalogEntry[] = [
  {
    type: 'ir',
    priceCredits: 50,
    weightGrams: 5,
    // Digital-only (IR analog mode was removed) — wired to a digital pin like a real
    // photointerrupter/reflectance module, not an analog input.
    availablePins: DIGITAL_PINS,
  },
  {
    type: 'ultrasonic',
    priceCredits: 150,
    weightGrams: 12,
    availablePins: DIGITAL_PINS.slice(0, 6),
  },
]

export function getCatalogEntry(type: SensorType): SensorCatalogEntry {
  const entry = sensorCatalog.find((candidate) => candidate.type === type)
  if (!entry) throw new Error(`No catalog entry for sensor type "${type}"`)
  return entry
}
