import { describe, expect, it } from 'vitest'
import { evaluateLevelState } from './LevelRuntime'
import { createInitialSimState } from './SimState'
import { ROBOT_RADIUS_PX } from '../../utils/constants'
import type { Level } from '../../types/domain'

const level: Level = {
  id: 'test-level',
  name: 'Test',
  difficulty: 'beginner',
  trackPath: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 0, y: 0, headingDeg: 0 },
  finishZone: { x: 100, y: 0, radius: 10 },
  timeLimitMs: 10_000,
  parConditions: { threeStarTimeMs: 3000, twoStarTimeMs: 6000, maxOffTrackEventsForThreeStars: 0 },
}

function runningState(overrides: Partial<ReturnType<typeof createInitialSimState>> = {}) {
  return { ...createInitialSimState({ x: 0, y: 0, headingDeg: 0 }), status: 'running' as const, ...overrides }
}

describe('evaluateLevelState', () => {
  it('reports no outcome while not running', () => {
    expect(evaluateLevelState(runningState({ status: 'idle' }), level)).toEqual({ kind: 'none' })
  })

  it('reports no outcome mid-track with no fail conditions met', () => {
    expect(evaluateLevelState(runningState({ pose: { x: 20, y: 0, headingDeg: 0 } }), level)).toEqual({
      kind: 'none',
    })
  })

  it('fails on collision', () => {
    expect(evaluateLevelState(runningState({ collided: true }), level)).toEqual({
      kind: 'failed',
      reason: 'collision',
    })
  })

  it('fails after too long continuously off-track', () => {
    expect(evaluateLevelState(runningState({ offTrackMs: 3000 }), level)).toEqual({
      kind: 'failed',
      reason: 'off-track',
    })
  })

  it('fails on timeout', () => {
    expect(evaluateLevelState(runningState({ elapsedMs: 10_000 }), level)).toEqual({
      kind: 'failed',
      reason: 'timeout',
    })
  })

  it('passes with 3 stars when fast and clean', () => {
    const outcome = evaluateLevelState(
      runningState({ pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 2000, offTrackEventCount: 0 }),
      level,
    )
    expect(outcome).toEqual({ kind: 'passed', completionTimeMs: 2000, stars: 3 })
  })

  it('passes with 2 stars when under the two-star time but too slow or too messy for 3', () => {
    const outcome = evaluateLevelState(
      runningState({ pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 5000, offTrackEventCount: 1 }),
      level,
    )
    expect(outcome).toEqual({ kind: 'passed', completionTimeMs: 5000, stars: 2 })
  })

  it('passes with 1 star when finishing slower than the two-star time', () => {
    const outcome = evaluateLevelState(
      runningState({ pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 9000 }),
      level,
    )
    expect(outcome).toEqual({ kind: 'passed', completionTimeMs: 9000, stars: 1 })
  })

  it('passes even when the off-track fail threshold is crossed the same tick it reaches the finish', () => {
    const outcome = evaluateLevelState(
      runningState({ pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 5000, offTrackMs: 3000 }),
      level,
    )
    expect(outcome.kind).toBe('passed')
  })

  it('passes even when the time limit is reached the same tick it reaches the finish', () => {
    const outcome = evaluateLevelState(
      runningState({ pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 10_000 }),
      level,
    )
    expect(outcome.kind).toBe('passed')
  })

  it('passes once the robot body overlaps the finish zone, not just its exact center point', () => {
    // finish radius is 10; the robot's own footprint (ROBOT_RADIUS_PX) extends that reach, same
    // as obstacle collision does — so a center still short of the zone's own radius should count.
    const outcome = evaluateLevelState(
      runningState({ pose: { x: 100 - (10 + ROBOT_RADIUS_PX - 1), y: 0, headingDeg: 0 }, elapsedMs: 2000 }),
      level,
    )
    expect(outcome.kind).toBe('passed')
  })
})
