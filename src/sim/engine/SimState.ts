import type { SensorReading } from './SensorSampling'
import type { Pose } from './RobotPhysics'

export type SimStatus = 'idle' | 'running' | 'paused' | 'passed' | 'failed'

export interface SimState {
  pose: Pose
  leftMotorSpeed: number
  rightMotorSpeed: number
  elapsedMs: number
  /** Milliseconds spent continuously off-track right now; resets to 0 the moment any IR sensor is back on track. */
  offTrackMs: number
  /** Count of distinct off-track excursions this run — used for star rating, not the fail threshold. */
  offTrackEventCount: number
  status: SimStatus
  sensorReadings: Record<string, SensorReading>
  collided: boolean
}

export function createInitialSimState(startPose: Pose): SimState {
  return {
    pose: startPose,
    leftMotorSpeed: 0,
    rightMotorSpeed: 0,
    elapsedMs: 0,
    offTrackMs: 0,
    offTrackEventCount: 0,
    status: 'idle',
    sensorReadings: {},
    collided: false,
  }
}
