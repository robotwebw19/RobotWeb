import type { ColorZone, ColorZoneColor, Obstacle, SensorConfig, Vector2 } from '../../types/domain'
import { add, rotate } from '../math/vector2'
import { rayCircleIntersectionDistance } from '../math/geometry'
import { IR_SENSE_RADIUS_PX, LINE_HALF_WIDTH_PX, PX_PER_CM, ULTRASONIC_MAX_RANGE_CM } from '../../utils/constants'
import type { Pose } from './RobotPhysics'
import type { TrackModel } from './TrackModel'

/** World-space position of a sensor mounted on the robot at the given pose. */
export function sensorWorldPosition(pose: Pose, sensor: SensorConfig): Vector2 {
  const rotatedOffset = rotate(sensor.position, pose.headingDeg)
  return add({ x: pose.x, y: pose.y }, rotatedOffset)
}

export function sampleIrDigital(worldPos: Vector2, track: TrackModel): 0 | 1 {
  return track.isOnTrack(worldPos, LINE_HALF_WIDTH_PX) ? 1 : 0
}

export function sampleIrAnalog(worldPos: Vector2, track: TrackModel): number {
  const distance = track.distanceToNearestPoint(worldPos)
  const falloff = 1 - distance / IR_SENSE_RADIUS_PX
  return Math.round(Math.max(0, Math.min(1, falloff)) * 1023)
}

export function sampleColor(worldPos: Vector2, track: TrackModel, colorZones: ColorZone[]): ColorZoneColor {
  for (const zone of colorZones) {
    const dx = worldPos.x - zone.x
    const dy = worldPos.y - zone.y
    if (Math.hypot(dx, dy) <= zone.radius) return zone.color
  }
  return track.isOnTrack(worldPos) ? 'black' : 'white'
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
): Record<string, SensorReading> {
  const readings: Record<string, SensorReading> = {}

  for (const sensor of sensors) {
    const worldPos = sensorWorldPosition(pose, sensor)

    if (sensor.type === 'ir') {
      readings[sensor.id] =
        sensor.irMode === 'analog' ? sampleIrAnalog(worldPos, track) : sampleIrDigital(worldPos, track)
    } else if (sensor.type === 'ultrasonic') {
      const beamHeadingDeg = pose.headingDeg + (sensor.mountAngleDeg ?? 0)
      readings[sensor.id] = sampleUltrasonicCm(worldPos, beamHeadingDeg, obstacles)
    } else {
      readings[sensor.id] = sampleColor(worldPos, track, colorZones)
    }
  }

  return readings
}
