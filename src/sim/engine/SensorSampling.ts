import type { Obstacle, SensorConfig, Vector2 } from '../../types/domain'
import { add, rotate } from '../math/vector2'
import { rayCircleIntersectionDistance } from '../math/geometry'
import { LINE_HALF_WIDTH_PX, PX_PER_CM, ULTRASONIC_MAX_RANGE_CM } from '../../utils/constants'
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

export type SensorReading = number

/** Reads every configured sensor against the current robot pose and level geometry. */
export function sampleAllSensors(
  pose: Pose,
  sensors: SensorConfig[],
  track: TrackModel,
  obstacles: Obstacle[],
  lineInversionBoundaryY?: number,
): Record<string, SensorReading> {
  const readings: Record<string, SensorReading> = {}

  for (const sensor of sensors) {
    const worldPos = sensorWorldPosition(pose, sensor)

    if (sensor.type === 'ir') {
      readings[sensor.id] = sampleIrDigital(worldPos, track, lineInversionBoundaryY)
    } else {
      const beamHeadingDeg = pose.headingDeg + (sensor.mountAngleDeg ?? 0)
      readings[sensor.id] = sampleUltrasonicCm(worldPos, beamHeadingDeg, obstacles)
    }
  }

  return readings
}
