import type { Pose } from './RobotPhysics'
import type { SimStatus } from './SimState'

/** Wire format both the student side (useRaceTrackBroadcast) and the admin side
 * (AdminRaceTrackTab) must agree on — one Supabase Realtime Broadcast channel per level, no
 * database writes, since this is ephemeral live-position data, not something to persist. */
export interface RaceTrackRobotPayload {
  studentId: string
  displayName: string
  firstName: string
  studentNumber: string
  pose: Pose
  status: SimStatus
  elapsedMs: number
}

export const RACE_TRACK_BROADCAST_EVENT = 'robot'

/** How often a running student's client sends a position update. */
export const RACE_TRACK_BROADCAST_INTERVAL_MS = 200

/** Admin side drops a robot from the live view if it hasn't broadcast in this long — covers a
 * tab closing/crashing without ever sending a final "stopped" message. */
export const RACE_TRACK_STALE_MS = 4000

export function raceTrackChannelName(levelId: string): string {
  return `race-track:${levelId}`
}
