import { describe, expect, it } from 'vitest'
import { findCollidingObstacle } from './CollisionDetection'

describe('findCollidingObstacle', () => {
  it('finds an obstacle whose circle overlaps the robot circle', () => {
    const obstacles = [{ x: 50, y: 0, radius: 10 }]
    const hit = findCollidingObstacle({ x: 0, y: 0, headingDeg: 0 }, 45, obstacles)
    expect(hit).toBe(obstacles[0])
  })

  it('returns null when no obstacle is within combined radii', () => {
    const obstacles = [{ x: 100, y: 0, radius: 10 }]
    const hit = findCollidingObstacle({ x: 0, y: 0, headingDeg: 0 }, 20, obstacles)
    expect(hit).toBeNull()
  })
})
