import { describe, expect, it } from 'vitest'
import { seedLevels } from '../data/seedLevels'
import { parseProgram } from '../interpreter/parser/parser'
import { Interpreter } from '../interpreter/runtime/Interpreter'
import { ArduinoRuntimeAPI } from '../interpreter/runtime/ArduinoRuntimeAPI'
import { TrackModel } from '../sim/engine/TrackModel'
import { stepPose, type Pose } from '../sim/engine/RobotPhysics'
import { sampleAllSensors, type SensorReading } from '../sim/engine/SensorSampling'
import { findCollidingObstacle } from '../sim/engine/CollisionDetection'
import { ROBOT_RADIUS_PX, ROBOT_WHEEL_BASE_PX, MAX_OFF_TRACK_MS_BEFORE_FAIL, MAX_STATEMENTS_PER_FRAME } from '../utils/constants'
import type { Level, RequiredEquipmentItem, SensorConfig } from '../types/domain'

/**
 * Rebuilds robot sensors from a level's requiredEquipment, using the same IR row spacing the
 * Sensor Configurator produces for a 2-sensor row, so the solution's assumed pin layout
 * (A0/A1 digital, etc.) is faithfully reproduced.
 */
function sensorsFromEquipment(equipment: RequiredEquipmentItem[]): SensorConfig[] {
  const sensors: SensorConfig[] = []
  const irOffsets = [-6, 6]
  let irIndex = 0
  for (const item of equipment) {
    if (item.kind !== 'sensor') continue
    if (item.type === 'ir') {
      sensors.push({
        id: item.pin,
        type: 'ir',
        pin: item.pin,
        position: { x: 40, y: irOffsets[irIndex] ?? 0 },
        irMode: item.irMode,
      })
      irIndex++
    } else if (item.type === 'ultrasonic') {
      sensors.push({ id: item.pin, type: 'ultrasonic', pin: item.pin, position: { x: 45, y: 0 } })
    } else {
      sensors.push({ id: item.pin, type: 'color', pin: item.pin, position: { x: 45, y: 0 } })
    }
  }
  return sensors
}

interface PlaythroughResult {
  passed: boolean
  elapsedMs: number
  reason?: 'collision' | 'off-track' | 'timeout' | 'test-budget-exhausted' | 'runtime-error'
  error?: string
}

/**
 * Headless replay of a level's solution code through the real interpreter + physics + sensor
 * stack — the same pieces SimulationLoop/useInterpreterConsole wire together in the browser,
 * minus React/zustand. This is the strongest correctness check available without a live browser.
 */
function playLevel(level: Level, dtMs = 16, testBudgetMs = 45_000): PlaythroughResult {
  const track = new TrackModel(level.trackPath)
  const sensors = sensorsFromEquipment(level.requiredEquipment ?? [])

  let pose: Pose = { ...level.startPosition }
  let leftSpeed = 0
  let rightSpeed = 0
  let elapsedMs = 0
  let offTrackMs = 0
  let readings: Record<string, SensorReading> = sampleAllSensors(pose, sensors, track, level.obstacles, level.colorZones)

  const api = new ArduinoRuntimeAPI({
    sensors,
    getSensorReadings: () => readings,
    getElapsedMs: () => elapsedMs,
    setMotorSpeeds: (left, right) => {
      leftSpeed = left
      rightSpeed = right
    },
    onSerialOutput: () => {},
  })

  let interpreter: Interpreter
  try {
    interpreter = new Interpreter(parseProgram(level.solutionCode ?? ''), api)
  } catch (error) {
    return { passed: false, elapsedMs: 0, reason: 'runtime-error', error: String(error) }
  }

  while (elapsedMs < testBudgetMs) {
    const nextElapsedMs = elapsedMs + dtMs
    try {
      interpreter.notifyElapsed(nextElapsedMs)
      for (let i = 0; i < MAX_STATEMENTS_PER_FRAME; i++) {
        if (interpreter.step() === 'waiting') break
      }
    } catch (error) {
      return { passed: false, elapsedMs, reason: 'runtime-error', error: String(error) }
    }

    pose = stepPose(pose, leftSpeed, rightSpeed, ROBOT_WHEEL_BASE_PX, dtMs / 1000)
    readings = sampleAllSensors(pose, sensors, track, level.obstacles, level.colorZones)
    elapsedMs = nextElapsedMs

    if (findCollidingObstacle(pose, ROBOT_RADIUS_PX, level.obstacles) !== null) {
      return { passed: false, elapsedMs, reason: 'collision' }
    }

    const dx = pose.x - level.finishZone.x
    const dy = pose.y - level.finishZone.y
    if (Math.hypot(dx, dy) <= level.finishZone.radius + ROBOT_RADIUS_PX) {
      return { passed: true, elapsedMs }
    }

    const onTrack = track.isOnTrack(pose)
    offTrackMs = onTrack ? 0 : offTrackMs + dtMs
    if (offTrackMs >= MAX_OFF_TRACK_MS_BEFORE_FAIL) {
      return { passed: false, elapsedMs, reason: 'off-track' }
    }

    if (elapsedMs >= level.timeLimitMs) {
      return { passed: false, elapsedMs, reason: 'timeout' }
    }
  }

  return { passed: false, elapsedMs, reason: 'test-budget-exhausted' }
}

describe('level solution playthroughs (headless simulation replay)', () => {
  for (const level of seedLevels) {
    it(`${level.id} solution reaches the finish zone`, () => {
      const result = playLevel(level)
      expect(result.passed, `${level.id} failed: ${JSON.stringify(result)}`).toBe(true)
    })
  }
})
