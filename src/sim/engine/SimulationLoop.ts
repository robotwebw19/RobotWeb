import type { Obstacle, SensorConfig } from '../../types/domain'
import type { SimSpeed } from './SimulationClock'
import type { SimState } from './SimState'
import type { TrackModel } from './TrackModel'
import { stepPose } from './RobotPhysics'
import { sampleAllSensors } from './SensorSampling'
import { findCollidingObstacle } from './CollisionDetection'

export interface SimulationLoopDeps {
  track: TrackModel
  obstacles: Obstacle[]
  sensors: SensorConfig[]
  robotRadiusPx: number
  wheelBasePx: number
  /** See types/domain.ts Level.lineInversionBoundaryY. */
  lineInversionBoundaryY?: number
}

export interface SimulationLoopHandlers {
  getSimState: () => SimState
  getSpeed: () => SimSpeed
  applyPatch: (patch: Partial<SimState>) => void
  /**
   * Invoked once per tick, before physics, with the elapsed-time value that tick will commit.
   * Used to pump the Arduino interpreter (hooks/useInterpreterConsole.ts) so this frame's
   * setMotorSpeed()/moveForward()/etc calls land before physics reads motor speeds below.
   */
  beforePhysicsTick?: (currentElapsedMs: number) => void
}

/**
 * Framework-agnostic requestAnimationFrame driver. Reads/writes simulation state only through
 * the injected handlers (backed by the zustand simulationStore in practice, see
 * hooks/useSimulation.ts) so this class stays independently testable via `stepOnce`.
 */
export class SimulationLoop {
  private readonly deps: SimulationLoopDeps
  private readonly handlers: SimulationLoopHandlers
  private rafId: number | null = null
  private lastTimestamp: number | null = null

  constructor(deps: SimulationLoopDeps, handlers: SimulationLoopHandlers) {
    this.deps = deps
    this.handlers = handlers
  }

  start(): void {
    if (this.rafId !== null) return
    this.lastTimestamp = null
    const loop = (timestamp: number) => {
      if (this.lastTimestamp !== null) {
        const realDeltaMs = timestamp - this.lastTimestamp
        if (this.handlers.getSimState().status === 'running') {
          this.tick(realDeltaMs)
        }
      }
      this.lastTimestamp = timestamp
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.lastTimestamp = null
  }

  /** Advances the simulation by one fixed-size tick regardless of run/pause status — backs the Step control. */
  stepOnce(fixedRealDtMs = 16): void {
    this.tick(fixedRealDtMs)
  }

  private tick(realDeltaMs: number): void {
    const speed = this.handlers.getSpeed()
    const simDeltaMs = realDeltaMs * speed
    const dtSeconds = simDeltaMs / 1000
    const currentElapsedMs = this.handlers.getSimState().elapsedMs + simDeltaMs

    this.handlers.beforePhysicsTick?.(currentElapsedMs)
    const prev = this.handlers.getSimState() // re-read: beforePhysicsTick may have updated motor speeds

    const nextPose = stepPose(
      prev.pose,
      prev.leftMotorSpeed,
      prev.rightMotorSpeed,
      this.deps.wheelBasePx,
      dtSeconds,
    )
    const sensorReadings = sampleAllSensors(
      nextPose,
      this.deps.sensors,
      this.deps.track,
      this.deps.obstacles,
      this.deps.lineInversionBoundaryY,
    )
    const collided = findCollidingObstacle(nextPose, this.deps.robotRadiusPx, this.deps.obstacles) !== null
    const onTrack = this.deps.track.isOnTrack(nextPose)
    const startingNewOffTrackExcursion = !onTrack && prev.offTrackMs === 0

    this.handlers.applyPatch({
      pose: nextPose,
      elapsedMs: currentElapsedMs,
      offTrackMs: onTrack ? 0 : prev.offTrackMs + simDeltaMs,
      offTrackEventCount: prev.offTrackEventCount + (startingNewOffTrackExcursion ? 1 : 0),
      sensorReadings,
      collided,
    })
  }
}
