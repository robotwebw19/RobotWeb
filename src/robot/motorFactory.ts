import { nanoid } from 'nanoid'
import type { MotorConfig, MotorSide } from '../types/domain'
import { getMotorCatalogEntry } from './motorCatalog'

/** Adds the left/right motor, capped at one per side (matches addSingleSensor's toggle pattern). */
export function addMotor(side: MotorSide, motors: MotorConfig[]): MotorConfig[] {
  if (motors.some((motor) => motor.side === side)) return motors
  const entry = getMotorCatalogEntry(side)
  return [...motors, { id: nanoid(), side, pin: entry.pin, position: entry.position }]
}

export function removeMotor(side: MotorSide, motors: MotorConfig[]): MotorConfig[] {
  return motors.filter((motor) => motor.side !== side)
}
