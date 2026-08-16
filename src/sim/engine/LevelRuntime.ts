import type { Level } from '../../types/domain'
import type { SimState } from './SimState'
import { MAX_OFF_TRACK_MS_BEFORE_FAIL, ROBOT_RADIUS_PX } from '../../utils/constants'

export type LevelOutcome =
  | { kind: 'none' }
  | { kind: 'failed'; reason: 'off-track' | 'collision' | 'timeout' }
  | { kind: 'passed'; completionTimeMs: number; stars: 1 | 2 | 3 }

function computeStars(completionTimeMs: number, offTrackEventCount: number, par: Level['parConditions']): 1 | 2 | 3 {
  if (completionTimeMs <= par.threeStarTimeMs && offTrackEventCount <= par.maxOffTrackEventsForThreeStars) return 3
  if (completionTimeMs <= par.twoStarTimeMs) return 2
  return 1
}

/**
 * Pure pass/fail/star evaluation against the current sim state — no side effects. The reactive
 * wiring (hooks/useLevelProgress.ts) calls this each tick and is the sole writer to
 * ILevelResultRepository, so a result can only come from an actual completed run.
 */
export function evaluateLevelState(simState: SimState, level: Level): LevelOutcome {
  if (simState.status !== 'running') return { kind: 'none' }

  if (simState.collided) return { kind: 'failed', reason: 'collision' }

  // Reaching the finish zone always wins over a fail condition that trips in this same tick
  // (e.g. off-track/timeout thresholds crossed the instant the robot arrives) — the robot did
  // reach the finish, so that's what gets reported.
  //
  // The robot has a physical footprint (ROBOT_RADIUS_PX), same as obstacle collision below — so
  // "reached" means the robot's body overlaps the zone, not that its center point threads the
  // needle of the zone's own (usually much smaller) radius.
  const dx = simState.pose.x - level.finishZone.x
  const dy = simState.pose.y - level.finishZone.y
  if (Math.hypot(dx, dy) <= level.finishZone.radius + ROBOT_RADIUS_PX) {
    return {
      kind: 'passed',
      completionTimeMs: simState.elapsedMs,
      stars: computeStars(simState.elapsedMs, simState.offTrackEventCount, level.parConditions),
    }
  }

  if (simState.offTrackMs >= MAX_OFF_TRACK_MS_BEFORE_FAIL) return { kind: 'failed', reason: 'off-track' }
  if (simState.elapsedMs >= level.timeLimitMs) return { kind: 'failed', reason: 'timeout' }

  return { kind: 'none' }
}
