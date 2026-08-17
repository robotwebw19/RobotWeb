import type { ColorZone, ColorZoneColor, Obstacle, SensorConfig, Vector2 } from '../../types/domain'
import { add, rotate } from '../math/vector2'
import { rayCircleIntersectionDistance } from '../math/geometry'
import {
  COLOR_CHANNEL_STRONG_PULSE_US,
  COLOR_CHANNEL_WEAK_PULSE_US,
  LINE_HALF_WIDTH_PX,
  PX_PER_CM,
  ULTRASONIC_MAX_RANGE_CM,
} from '../../utils/constants'
import type { Pose } from './RobotPhysics'
import type { TrackModel } from './TrackModel'

/** World-space position of a sensor mounted on the robot at the given pose. */
export function sensorWorldPosition(pose: Pose, sensor: SensorConfig): Vector2 {
  const rotatedOffset = rotate(sensor.position, pose.headingDeg)
  return add({ x: pose.x, y: pose.y }, rotatedOffset)
}

/**
 * A real digital line sensor has a fixed light/dark comparator threshold — it reports "dark
 * detected", not "on the line specifically". Normally the line is the dark thing (onLine XOR
 * false = onLine), so this is unaffected. Past `inversionBoundaryY` the line/ground colors swap
 * (white line, black ground), so the same fixed threshold now reads the opposite bit for the
 * same physical on-line/off-line situation (onLine XOR true = !onLine).
 */
export function sampleIrDigital(worldPos: Vector2, track: TrackModel, inversionBoundaryY?: number): 0 | 1 {
  const onLine = track.isOnTrack(worldPos, LINE_HALF_WIDTH_PX)
  const inverted = inversionBoundaryY !== undefined && worldPos.y >= inversionBoundaryY
  return onLine !== inverted ? 1 : 0
}

export function sampleColor(worldPos: Vector2, track: TrackModel, colorZones: ColorZone[]): ColorZoneColor {
  for (const zone of colorZones) {
    const dx = worldPos.x - zone.x
    const dy = worldPos.y - zone.y
    if (Math.hypot(dx, dy) <= zone.radius) return zone.color
  }
  return track.isOnTrack(worldPos) ? 'black' : 'white'
}

export type ColorChannel = 'red' | 'green' | 'blue'

/**
 * Synthesizes a TCS230-style per-channel pulse duration (µs) from the ground-truth surface
 * color a real one would optically read: the channel matching the true color pulses fast (a
 * short duration — strong signal from that photodiode filter); the other channels pulse slow.
 * White reflects every wavelength (all three channels strong); black absorbs them all (all
 * three weak) — same shape a student reading a real TCS230 has to reason through.
 */
export function colorChannelPulseUs(trueColor: ColorZoneColor, channel: ColorChannel): number {
  const strong = trueColor === 'white' || trueColor === channel
  return strong ? COLOR_CHANNEL_STRONG_PULSE_US : COLOR_CHANNEL_WEAK_PULSE_US
}

export function sampleUltrasonicCm(
  origin: Vector2,
  beamHeadingDeg: number,
  obstacles: Obstacle[],
  maxRangeCm: number = ULTRASONIC_MAX_RANGE_CM,
): number {
  const direction = rotate({ x: 1, y: 0 }, beamHeadingDeg)
  const maxRangePx = maxRangeCm * PX_PER_CM

  let nearestPx = maxRangePx
  for (const obstacle of obstacles) {
    const hitDistancePx = rayCircleIntersectionDistance(
      origin,
      direction,
      { x: obstacle.x, y: obstacle.y },
      obstacle.radius,
    )
    if (hitDistancePx !== null && hitDistancePx < nearestPx) {
      nearestPx = hitDistancePx
    }
  }

  return nearestPx / PX_PER_CM
}

export type SensorReading = number | ColorZoneColor

/** Reads every configured sensor against the current robot pose and level geometry. */
export function sampleAllSensors(
  pose: Pose,
  sensors: SensorConfig[],
  track: TrackModel,
  obstacles: Obstacle[],
  colorZones: ColorZone[],
  lineInversionBoundaryY?: number,
): Record<string, SensorReading> {
  const readings: Record<string, SensorReading> = {}

  for (const sensor of sensors) {
    const worldPos = sensorWorldPosition(pose, sensor)

    if (sensor.type === 'ir') {
      readings[sensor.id] = sampleIrDigital(worldPos, track, lineInversionBoundaryY)
    } else if (sensor.type === 'ultrasonic') {
      const beamHeadingDeg = pose.headingDeg + (sensor.mountAngleDeg ?? 0)
      readings[sensor.id] = sampleUltrasonicCm(worldPos, beamHeadingDeg, obstacles)
    } else {
      readings[sensor.id] = sampleColor(worldPos, track, colorZones)
    }
  }

  return readings
}
