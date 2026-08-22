import { describe, expect, it } from 'vitest'
import { SimulationLoop, type SimulationLoopDeps, type SimulationLoopHandlers } from './SimulationLoop'
import { TrackModel } from './TrackModel'
import { createInitialSimState } from './SimState'
import type { SimState } from './SimState'

function buildLoop(
  overridesDeps: Partial<SimulationLoopDeps> = {},
  buildHandlerOverrides?: (ctx: { getState: () => SimState; setState: (s: SimState) => void }) => Partial<SimulationLoopHandlers>,
) {
  const track = new TrackModel([
    [
      { x: 0, y: 0 },
      { x: 500, y: 0 },
    ],
  ])
  let state: SimState = { ...createInitialSimState({ x: 0, y: 0, headingDeg: 0 }), status: 'running' }
  const getState = () => state
  const setState = (s: SimState) => (state = s)

  const loop = new SimulationLoop(
    {
      track,
      obstacles: [],
      sensors: [],
      robotRadiusPx: 40,
      wheelBasePx: 60,
      ...overridesDeps,
    },
    {
      getSimState: getState,
      getSpeed: () => 1,
      applyPatch: (patch) => {
        state = { ...state, ...patch }
      },
      ...buildHandlerOverrides?.({ getState, setState }),
    },
  )
  return { loop, getState, setState }
}

describe('SimulationLoop.stepOnce', () => {
  it('advances pose and elapsed time using current motor speeds', () => {
    const { loop, getState, setState } = buildLoop()
    setState({ ...getState(), leftMotorSpeed: 100, rightMotorSpeed: 100 })

    loop.stepOnce(16)

    const state = getState()
    expect(state.elapsedMs).toBeCloseTo(16)
    expect(state.pose.x).toBeCloseTo(1.6) // 100px/s * 0.016s
  })

  it('resets offTrackMs to 0 while on track and accumulates it while off track', () => {
    const { loop, getState, setState } = buildLoop()
    setState({ ...getState(), pose: { x: 0, y: 100, headingDeg: 0 }, leftMotorSpeed: 0, rightMotorSpeed: 0 })

    loop.stepOnce(500)
    expect(getState().offTrackMs).toBeCloseTo(500)

    setState({ ...getState(), pose: { x: 0, y: 0, headingDeg: 0 } })
    loop.stepOnce(16)
    expect(getState().offTrackMs).toBe(0)
  })

  it('flags collided when the robot overlaps an obstacle', () => {
    const { loop, getState } = buildLoop({ obstacles: [{ x: 0, y: 0, radius: 10 }] })
    loop.stepOnce(1)
    expect(getState().collided).toBe(true)
  })

  it('applies beforePhysicsTick motor-speed changes within the same tick, before physics runs', () => {
    const { loop, getState } = buildLoop({}, ({ getState, setState }) => ({
      // Simulates the interpreter driver committing setMotorSpeed(100,100) mid-frame.
      beforePhysicsTick: () => setState({ ...getState(), leftMotorSpeed: 100, rightMotorSpeed: 100 }),
    }))
    loop.stepOnce(16)
    expect(getState().pose.x).toBeCloseTo(1.6) // 100px/s * 0.016s, not 0
  })

  it('passes the elapsed time this tick will commit to beforePhysicsTick', () => {
    let receivedElapsedMs: number | null = null
    const { loop } = buildLoop({}, () => ({
      beforePhysicsTick: (elapsedMs) => (receivedElapsedMs = elapsedMs),
    }))
    loop.stepOnce(16)
    expect(receivedElapsedMs).toBeCloseTo(16)
  })
})
