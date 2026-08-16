import { describe, expect, it } from 'vitest'
import { SimulationClock } from './SimulationClock'

describe('SimulationClock', () => {
  it('advances simulated time at 1x by the real delta', () => {
    const clock = new SimulationClock()
    const simDelta = clock.tick(16)
    expect(simDelta).toBe(16)
    expect(clock.getElapsedMs()).toBe(16)
  })

  it('scales simulated time by the speed multiplier', () => {
    const clock = new SimulationClock()
    clock.setSpeed(4)
    const simDelta = clock.tick(16)
    expect(simDelta).toBe(64)
    expect(clock.getElapsedMs()).toBe(64)
  })

  it('resets elapsed time back to zero', () => {
    const clock = new SimulationClock()
    clock.tick(100)
    clock.reset()
    expect(clock.getElapsedMs()).toBe(0)
  })
})
