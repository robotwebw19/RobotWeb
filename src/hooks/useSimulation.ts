import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { Obstacle, SensorConfig, StartPosition, Vector2 } from '../types/domain'
import { TrackModel } from '../sim/engine/TrackModel'
import { SimulationLoop } from '../sim/engine/SimulationLoop'
import { sampleAllSensors } from '../sim/engine/SensorSampling'
import type { Pose } from '../sim/engine/RobotPhysics'
import { useSimulationStore } from '../state/simulationStore'
import { ROBOT_RADIUS_PX, ROBOT_WHEEL_BASE_PX } from '../utils/constants'

/** How long the robot visibly drives back to the start point on reset — see animateResetToStart. */
const RESET_DRIVE_BACK_MS = 750

/** Shortest signed angular distance from `fromDeg` to `toDeg`, so a heading near 350° animates
 * toward 0° by turning +10° rather than swinging all the way back through 180°. */
function shortestHeadingDeltaDeg(fromDeg: number, toDeg: number): number {
  let delta = (toDeg - fromDeg) % 360
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360
  return delta
}

/** Ease-in-out cubic — accelerates off the mark and brakes into the stop, like a real motor
 * spinning up and slowing down, instead of ease-out's instant-start snap. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/** Below this, the robot reads as already sitting at the target — not worth animating. */
const ALREADY_AT_TARGET_PX = 0.5
const ALREADY_AT_TARGET_DEG = 0.5

export interface UseSimulationParams {
  trackPath: Vector2[][]
  obstacles: Obstacle[]
  sensors: SensorConfig[]
  startPosition: StartPosition
  /** See types/domain.ts Level.lineInversionBoundaryY. */
  lineInversionBoundaryY?: number
  /** Called once per tick before physics, e.g. to pump the interpreter (see useInterpreterConsole). */
  onBeforePhysicsTick?: (currentElapsedMs: number) => void
}

/**
 * Wires a SimulationLoop to the simulationStore for the current level's geometry.
 * Callers should pass stable (e.g. module-level or memoized) array/object references for
 * trackPath/obstacles/sensors — this effect rebuilds the loop whenever their identity changes.
 * `onBeforePhysicsTick` may change freely across renders without rebuilding the loop — it's read
 * through a ref.
 */
export function useSimulation({
  trackPath,
  obstacles,
  sensors,
  startPosition,
  lineInversionBoundaryY,
  onBeforePhysicsTick,
}: UseSimulationParams) {
  const setStatus = useSimulationStore((state) => state.setStatus)
  const resetToPose = useSimulationStore((state) => state.resetToPose)
  const applyPatch = useSimulationStore((state) => state.applyPatch)

  const track = useMemo(() => new TrackModel(trackPath), [trackPath])
  const loopRef = useRef<SimulationLoop | null>(null)
  const { x: startX, y: startY, headingDeg: startHeadingDeg } = startPosition

  const onBeforePhysicsTickRef = useRef(onBeforePhysicsTick)
  onBeforePhysicsTickRef.current = onBeforePhysicsTick

  /**
   * A fresh SimState starts with empty sensorReadings (see createInitialSimState) — without this,
   * the first interpreter pump of a run sees every sensor as 0 before physics has sampled the
   * real pose, which is indistinguishable from an off-track reading and can corrupt any stateful
   * logic (e.g. color-inversion flip detection) that trusts tick-one sensor values.
   */
  const resetSimToStart = useCallback(() => {
    const startPose: Pose = { x: startX, y: startY, headingDeg: startHeadingDeg }
    resetToPose(startPose)
    applyPatch({
      sensorReadings: sampleAllSensors(startPose, sensors, track, obstacles, lineInversionBoundaryY),
    })
  }, [track, obstacles, sensors, startX, startY, startHeadingDeg, lineInversionBoundaryY, resetToPose, applyPatch])

  const resetAnimationRef = useRef<number | null>(null)

  /**
   * The public "reset" — animates the robot visibly driving back to the start point instead of
   * teleporting there in one frame (which read as a flicker, especially right as the pass/fail
   * outcome lands). Forces status off 'running' first so SimulationLoop's own tick can't fight
   * this animation's pose writes; resolves once resetSimToStart has applied the real, final reset
   * (fresh sensorReadings etc), so callers that need a clean slate before loading a program can
   * just await it.
   */
  const animateResetToStart = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (resetAnimationRef.current !== null) {
        cancelAnimationFrame(resetAnimationRef.current)
        resetAnimationRef.current = null
      }
      setStatus('idle')

      const fromPose = useSimulationStore.getState().simState.pose
      const targetPose: Pose = { x: startX, y: startY, headingDeg: startHeadingDeg }
      const headingDeltaDeg = shortestHeadingDeltaDeg(fromPose.headingDeg, targetPose.headingDeg)

      // Nothing to visibly drive back from (e.g. Run pressed on a level that's never moved, or
      // right after a Reset) — skip the animation instead of stalling every Run press behind a
      // needless 750ms wait when the robot is already sitting at the start point.
      if (
        Math.abs(fromPose.x - targetPose.x) < ALREADY_AT_TARGET_PX &&
        Math.abs(fromPose.y - targetPose.y) < ALREADY_AT_TARGET_PX &&
        Math.abs(headingDeltaDeg) < ALREADY_AT_TARGET_DEG
      ) {
        resetSimToStart()
        resolve()
        return
      }

      const startTime = performance.now()

      function step(now: number) {
        const t = Math.min(1, (now - startTime) / RESET_DRIVE_BACK_MS)
        const eased = easeInOutCubic(t)
        applyPatch({
          pose: {
            x: fromPose.x + (targetPose.x - fromPose.x) * eased,
            y: fromPose.y + (targetPose.y - fromPose.y) * eased,
            headingDeg: fromPose.headingDeg + headingDeltaDeg * eased,
          },
        })
        if (t < 1) {
          resetAnimationRef.current = requestAnimationFrame(step)
        } else {
          resetAnimationRef.current = null
          resetSimToStart()
          resolve()
        }
      }
      resetAnimationRef.current = requestAnimationFrame(step)
    })
  }, [startX, startY, startHeadingDeg, setStatus, applyPatch, resetSimToStart])

  useEffect(() => {
    return () => {
      if (resetAnimationRef.current !== null) cancelAnimationFrame(resetAnimationRef.current)
    }
  }, [])

  useEffect(() => {
    const loop = new SimulationLoop(
      {
        track,
        obstacles,
        sensors,
        robotRadiusPx: ROBOT_RADIUS_PX,
        wheelBasePx: ROBOT_WHEEL_BASE_PX,
        lineInversionBoundaryY,
      },
      {
        getSimState: () => useSimulationStore.getState().simState,
        getSpeed: () => useSimulationStore.getState().speed,
        applyPatch: (patch) => useSimulationStore.getState().applyPatch(patch),
        beforePhysicsTick: (elapsedMs) => onBeforePhysicsTickRef.current?.(elapsedMs),
      },
    )
    loopRef.current = loop
    resetSimToStart()
    loop.start()

    return () => {
      loop.stop()
      loopRef.current = null
    }
  }, [track, obstacles, sensors, lineInversionBoundaryY, resetSimToStart])

  return {
    run: () => setStatus('running'),
    pause: () => setStatus('paused'),
    reset: animateResetToStart,
    step: () => loopRef.current?.stepOnce(),
  }
}
