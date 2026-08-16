import type { MotorConfig, SensorConfig } from '../types/domain'
import { getCatalogEntry } from './sensorCatalog'
import { getMotorCatalogEntry } from './motorCatalog'

export type RobotConfigError =
  | { key: 'validation.duplicatePin'; vars: { pin: string } }
  | { key: 'validation.noSensors'; vars?: undefined }
  | { key: 'validation.missingMotors'; vars?: undefined }

export interface RobotConfigValidation {
  valid: boolean
  errors: RobotConfigError[]
}

export function totalCostCredits(sensors: SensorConfig[], motors: MotorConfig[] = []): number {
  const sensorCost = sensors.reduce((sum, sensor) => sum + getCatalogEntry(sensor.type).priceCredits, 0)
  const motorCost = motors.reduce((sum, motor) => sum + getMotorCatalogEntry(motor.side).priceCredits, 0)
  return sensorCost + motorCost
}

export function validateRobotConfig(sensors: SensorConfig[], motors: MotorConfig[] = []): RobotConfigValidation {
  const errors: RobotConfigError[] = []
  const seenPins = new Set<string>()

  for (const part of [...sensors, ...motors]) {
    if (seenPins.has(part.pin)) {
      errors.push({ key: 'validation.duplicatePin', vars: { pin: part.pin } })
    }
    seenPins.add(part.pin)
  }

  if (sensors.length === 0) {
    errors.push({ key: 'validation.noSensors' })
  }

  if (!motors.some((m) => m.side === 'left') || !motors.some((m) => m.side === 'right')) {
    errors.push({ key: 'validation.missingMotors' })
  }

  return { valid: errors.length === 0, errors }
}
