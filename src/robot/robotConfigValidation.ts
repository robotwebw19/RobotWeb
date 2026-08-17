import type { MotorConfig, SensorConfig } from '../types/domain'
import { getCatalogEntry } from './sensorCatalog'
import { getMotorCatalogEntry } from './motorCatalog'
import { sensorPins } from './sensorPins'

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

  const pins: string[] = [...sensors.flatMap(sensorPins), ...motors.flatMap((m) => [m.in1Pin, m.in2Pin, m.enablePin])]

  for (const pin of pins) {
    if (seenPins.has(pin)) {
      errors.push({ key: 'validation.duplicatePin', vars: { pin } })
    }
    seenPins.add(pin)
  }

  if (sensors.length === 0) {
    errors.push({ key: 'validation.noSensors' })
  }

  if (!motors.some((m) => m.side === 'left') || !motors.some((m) => m.side === 'right')) {
    errors.push({ key: 'validation.missingMotors' })
  }

  return { valid: errors.length === 0, errors }
}
