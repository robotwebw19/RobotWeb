import type { MotorSide } from '../types/domain'
import { MOTOR_PIN_LEFT, MOTOR_PIN_RIGHT } from './pins'

export interface MotorCatalogEntry {
  side: MotorSide
  pin: string
  priceCredits: number
  weightGrams: number
  /** Fixed robot-local mount position (rear corners) — see SensorConfig.position for the frame. */
  position: { x: number; y: number }
}

// Display label text lives in i18n/translations.ts (catalog.motor.<side>.label).
export const motorCatalog: MotorCatalogEntry[] = [
  { side: 'left', pin: MOTOR_PIN_LEFT, priceCredits: 40, weightGrams: 15, position: { x: -35, y: -22 } },
  { side: 'right', pin: MOTOR_PIN_RIGHT, priceCredits: 40, weightGrams: 15, position: { x: -35, y: 22 } },
]

export function getMotorCatalogEntry(side: MotorSide): MotorCatalogEntry {
  const entry = motorCatalog.find((candidate) => candidate.side === side)
  if (!entry) throw new Error(`No motor catalog entry for side "${side}"`)
  return entry
}
