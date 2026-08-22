import type { MotorSide } from '../types/domain'

export interface MotorCatalogEntry {
  side: MotorSide
  in1Pin: string
  in2Pin: string
  enablePin: string
  priceCredits: number
  weightGrams: number
  /** Fixed robot-local mount position (rear corners) — see SensorConfig.position for the frame. */
  position: { x: number; y: number }
}

// Fixed L298N driver wiring, drawn from the same D2-D13/A0-A7 board pins as sensors (not
// dedicated IN1/IN2/ENA-style names) — pinMode/digitalWrite/analogWrite treat them identically.
// Display label text lives in i18n/translations.ts (catalog.motor.<side>.label).
export const motorCatalog: MotorCatalogEntry[] = [
  { side: 'left', in1Pin: 'D10', in2Pin: 'D11', enablePin: 'A0', priceCredits: 40, weightGrams: 15, position: { x: -35, y: -22 } },
  { side: 'right', in1Pin: 'D12', in2Pin: 'D13', enablePin: 'A1', priceCredits: 40, weightGrams: 15, position: { x: -35, y: 22 } },
]

export function getMotorCatalogEntry(side: MotorSide): MotorCatalogEntry {
  const entry = motorCatalog.find((candidate) => candidate.side === side)
  if (!entry) throw new Error(`No motor catalog entry for side "${side}"`)
  return entry
}
