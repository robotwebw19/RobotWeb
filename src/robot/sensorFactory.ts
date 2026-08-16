import { nanoid } from 'nanoid'
import type { IrMode, SensorConfig, SensorType } from '../types/domain'
import { getCatalogEntry } from './sensorCatalog'
import { IR_ROW_SPACING_PX } from '../utils/constants'

/**
 * Builds a fresh evenly-spaced row of `count` IR units, picking pins that avoid `nonIrSensors`.
 * Callers replace their existing IR sensors with this row (see SensorConfigurator's "Apply").
 */
export function buildIrRow(count: number, mode: IrMode, nonIrSensors: SensorConfig[]): SensorConfig[] {
  const usedPins = new Set(nonIrSensors.map((sensor) => sensor.pin))
  const availablePins = getCatalogEntry('ir').availablePins.filter((pin) => !usedPins.has(pin))
  const totalWidth = IR_ROW_SPACING_PX * (count - 1)

  const row: SensorConfig[] = []
  for (let i = 0; i < count && i < availablePins.length; i++) {
    row.push({
      id: nanoid(),
      type: 'ir',
      pin: availablePins[i],
      position: { x: 40, y: -totalWidth / 2 + i * IR_ROW_SPACING_PX },
      irMode: mode,
    })
  }
  return row
}

/** Adds a single ultrasonic/color sensor, capped at one of each type, using the next free pin. */
export function addSingleSensor(type: SensorType, sensors: SensorConfig[]): SensorConfig[] {
  if (sensors.some((sensor) => sensor.type === type)) return sensors

  const usedPins = new Set(sensors.map((sensor) => sensor.pin))
  const pin = getCatalogEntry(type).availablePins.find((candidate) => !usedPins.has(candidate))
  if (!pin) return sensors

  return [...sensors, { id: nanoid(), type, pin, position: { x: 45, y: 0 } }]
}
