import { describe, expect, it } from 'vitest'
import { flattenQuadraticBezier } from './bezier'

describe('flattenQuadraticBezier', () => {
  it('starts and ends exactly at the given endpoints', () => {
    const points = flattenQuadraticBezier({ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 }, 10)
    expect(points[0]).toEqual({ x: 0, y: 0 })
    expect(points[points.length - 1]).toEqual({ x: 100, y: 0 })
  })

  it('produces segments+1 points and bulges toward the control point at the midpoint', () => {
    const points = flattenQuadraticBezier({ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 }, 10)
    expect(points).toHaveLength(11)
    // At t=0.5, a quadratic Bezier is at 0.25*start + 0.5*control + 0.25*end.
    expect(points[5].y).toBeCloseTo(50)
  })
})
