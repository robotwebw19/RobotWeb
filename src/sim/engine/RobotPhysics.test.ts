import { describe, expect, it } from 'vitest'
import { stepPose } from './RobotPhysics'

const WHEEL_BASE = 60

describe('stepPose', () => {
  it('drives straight when both wheel speeds match', () => {
    const result = stepPose({ x: 0, y: 0, headingDeg: 0 }, 100, 100, WHEEL_BASE, 1)
    expect(result.x).toBeCloseTo(100)
    expect(result.y).toBeCloseTo(0)
    expect(result.headingDeg).toBeCloseTo(0)
  })

  it('turns in place with zero net displacement when wheel speeds are equal and opposite', () => {
    const result = stepPose({ x: 5, y: 5, headingDeg: 0 }, -50, 50, WHEEL_BASE, 1)
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(5)
    // omega = (50 - -50) / 60 rad/s -> ~95.49 deg over 1s
    expect(result.headingDeg).toBeCloseTo(95.493, 2)
  })

  it('follows an arc when wheel speeds differ', () => {
    const result = stepPose({ x: 0, y: 0, headingDeg: 0 }, 50, 100, WHEEL_BASE, 1)
    // v = 75 px/s, omega = 50/60 rad/s -> ~47.746 deg over 1s
    expect(result.headingDeg).toBeCloseTo(47.746, 2)
    expect(result.x).toBeCloseTo(75)
    expect(result.y).toBeCloseTo(0)
  })

  it('moves along the current heading direction, not just world axes', () => {
    const result = stepPose({ x: 0, y: 0, headingDeg: 90 }, 100, 100, WHEEL_BASE, 1)
    expect(result.x).toBeCloseTo(0, 5)
    expect(result.y).toBeCloseTo(100, 5)
  })
})
