import type { MotorSide } from '../types/domain'
import { MOTOR_PIN_ENA, MOTOR_PIN_ENB, MOTOR_PIN_IN1, MOTOR_PIN_IN2, MOTOR_PIN_IN3, MOTOR_PIN_IN4 } from './pins'

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

// Display label text lives in i18n/translations.ts (catalog.motor.<side>.label).
export const motorCatalog: MotorCatalogEntry[] = [
  { side: 'left', in1Pin: MOTOR_PIN_IN1, in2Pin: MOTOR_PIN_IN2, enablePin: MOTOR_PIN_ENA, priceCredits: 40, weightGrams: 15, position: { x: -35, y: -22 } },
  { side: 'right', in1Pin: MOTOR_PIN_IN3, in2Pin: MOTOR_PIN_IN4, enablePin: MOTOR_PIN_ENB, priceCredits: 40, weightGrams: 15, position: { x: -35, y: 22 } },
]

export function getMotorCatalogEntry(side: MotorSide): MotorCatalogEntry {
  const entry = motorCatalog.find((candidate) => candidate.side === side)
  if (!entry) throw new Error(`No motor catalog entry for side "${side}"`)
  return entry
}
