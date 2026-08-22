import { nanoid } from 'nanoid'
import type { SensorConfig, SensorType } from '../types/domain'
import { getCatalogEntry } from './sensorCatalog'
import { sensorPins } from './sensorPins'
import { IR_ROW_SPACING_PX } from '../utils/constants'

function usedPinsOf(sensors: SensorConfig[]): Set<string> {
  return new Set(sensors.flatMap(sensorPins))
}

/**
 * Builds a fresh evenly-spaced row of `count` IR units, picking pins that avoid `nonIrSensors`.
 * Callers replace their existing IR sensors with this row (see SensorConfigurator's "Apply").
 */
export function buildIrRow(count: number, nonIrSensors: SensorConfig[]): SensorConfig[] {
  const usedPins = usedPinsOf(nonIrSensors)
  const availablePins = getCatalogEntry('ir').availablePins.filter((pin) => !usedPins.has(pin))
  const totalWidth = IR_ROW_SPACING_PX * (count - 1)

  const row: SensorConfig[] = []
  for (let i = 0; i < count && i < availablePins.length; i++) {
    row.push({
      id: nanoid(),
      type: 'ir',
      pin: availablePins[i],
      position: { x: 40, y: -totalWidth / 2 + i * IR_ROW_SPACING_PX },
    })
  }
  return row
}

/**
 * Adds a single sensor of the given type, capped at one of each type, using the next free pin(s).
 * Ultrasonic needs two — Trig (`pin`) and Echo (`echoPin`) — a real HC-SR04's two-wire interface.
 * Every other type just needs one.
 */
export function addSingleSensor(type: SensorType, sensors: SensorConfig[]): SensorConfig[] {
  if (sensors.some((sensor) => sensor.type === type)) return sensors

  const usedPins = usedPinsOf(sensors)
  const candidates = getCatalogEntry(type).availablePins.filter((pin) => !usedPins.has(pin))

  if (type === 'ultrasonic') {
    if (candidates.length < 2) return sensors
    const [pin, echoPin] = candidates
    return [...sensors, { id: nanoid(), type, pin, echoPin, position: { x: 45, y: 0 } }]
  }

  const pin = candidates[0]
  if (!pin) return sensors
  return [...sensors, { id: nanoid(), type, pin, position: { x: 45, y: 0 } }]
}
