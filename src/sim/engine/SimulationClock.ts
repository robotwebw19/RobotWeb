export type SimSpeed = 0.5 | 1 | 2 | 4

/** Converts real animation-frame time into simulated time at a chosen speed multiplier. */
export class SimulationClock {
  private speed: SimSpeed = 1
  private simElapsedMs = 0

  setSpeed(speed: SimSpeed): void {
    this.speed = speed
  }

  getSpeed(): SimSpeed {
    return this.speed
  }

  getElapsedMs(): number {
    return this.simElapsedMs
  }

  /** Advances the clock by a real-time delta and returns the equivalent simulated-time delta. */
  tick(realDeltaMs: number): number {
    const simDeltaMs = realDeltaMs * this.speed
    this.simElapsedMs += simDeltaMs
    return simDeltaMs
  }

  reset(): void {
    this.simElapsedMs = 0
  }
}
