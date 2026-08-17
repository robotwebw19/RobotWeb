import { useEffect, useMemo, useRef } from 'react'
import type { ColorZone, Obstacle, SensorConfig, StartPosition, Vector2 } from '../types/domain'
import { TrackModel } from '../sim/engine/TrackModel'
import { SimulationLoop } from '../sim/engine/SimulationLoop'
import { useSimulationStore } from '../state/simulationStore'
import { ROBOT_RADIUS_PX, ROBOT_WHEEL_BASE_PX } from '../utils/constants'

export interface UseSimulationParams {
  trackPath: Vector2[][]
  obstacles: Obstacle[]
  colorZones: ColorZone[]
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
 * trackPath/obstacles/colorZones/sensors — this effect rebuilds the loop whenever their
 * identity changes. `onBeforePhysicsTick` may change freely across renders without rebuilding
 * the loop — it's read through a ref.
 */
export function useSimulation({
  trackPath,
  obstacles,
  colorZones,
  sensors,
  startPosition,
  lineInversionBoundaryY,
  onBeforePhysicsTick,
}: UseSimulationParams) {
  const setStatus = useSimulationStore((state) => state.setStatus)
  const resetToPose = useSimulationStore((state) => state.resetToPose)

  const track = useMemo(() => new TrackModel(trackPath), [trackPath])
  const loopRef = useRef<SimulationLoop | null>(null)
  const { x: startX, y: startY, headingDeg: startHeadingDeg } = startPosition

  const onBeforePhysicsTickRef = useRef(onBeforePhysicsTick)
  onBeforePhysicsTickRef.current = onBeforePhysicsTick

  useEffect(() => {
    const loop = new SimulationLoop(
      {
        track,
        obstacles,
        colorZones,
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
    resetToPose({ x: startX, y: startY, headingDeg: startHeadingDeg })
    loop.start()

    return () => {
      loop.stop()
      loopRef.current = null
    }
  }, [track, obstacles, colorZones, sensors, startX, startY, startHeadingDeg, lineInversionBoundaryY, resetToPose])

  return {
    run: () => setStatus('running'),
    pause: () => setStatus('paused'),
    reset: () => resetToPose({ x: startX, y: startY, headingDeg: startHeadingDeg }),
    step: () => loopRef.current?.stepOnce(),
  }
}
