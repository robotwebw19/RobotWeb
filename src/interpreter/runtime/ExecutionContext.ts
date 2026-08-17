import { RuntimeError } from './errors'
import { ALL_PINS } from '../../robot/pins'

export type RuntimeValue = number | boolean | string
export type PinDirection = 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'

const ARDUINO_CONSTANTS: Record<string, RuntimeValue> = {
  HIGH: 1,
  LOW: 0,
  INPUT: 0,
  OUTPUT: 1,
  INPUT_PULLUP: 2,
}

/** A busy loop() that runs this many statements without calling delay() is almost certainly a bug. */
const BUSY_LOOP_STATEMENT_CEILING = 100_000

/** Variable scopes, pin bookkeeping, and delay/busy-loop guard state for one interpreter run. */
export class ExecutionContext {
  private scopes: Map<string, RuntimeValue>[] = [new Map()]
  private pinModes = new Map<string, PinDirection>()
  private digitalPinStates = new Map<string, 0 | 1>()
  private analogPinStates = new Map<string, number>()

  waitUntilSimMs: number | null = null
  statementCountThisIteration = 0

  constructor() {
    for (const [name, value] of Object.entries(ARDUINO_CONSTANTS)) {
      this.declare(name, value)
    }
    // Real Arduino pin identifiers (A0, D7, ...) are numeric board constants; here they're
    // string constants equal to their own name, since pins are string ids throughout this app.
    // Declaring the full board's pin names (not just wired ones) lets an unwired-pin reference
    // reach ArduinoRuntimeAPI's "no sensor wired to pin X" check instead of a generic
    // undeclared-variable error.
    for (const pin of ALL_PINS) {
      this.declare(pin, pin)
    }
  }

  pushScope(): void {
    this.scopes.push(new Map())
  }

  popScope(): void {
    this.scopes.pop()
  }

  declare(name: string, value: RuntimeValue): void {
    this.scopes[this.scopes.length - 1].set(name, value)
  }

  assign(name: string, value: RuntimeValue, line?: number): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        this.scopes[i].set(name, value)
        return
      }
    }
    throw new RuntimeError(`Assignment to undeclared variable "${name}"`, line)
  }

  get(name: string, line?: number): RuntimeValue {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes[i]
      if (scope.has(name)) return scope.get(name) as RuntimeValue
    }
    throw new RuntimeError(`Reference to undeclared variable "${name}"`, line)
  }

  setPinMode(pin: string, direction: PinDirection): void {
    this.pinModes.set(pin, direction)
  }

  getPinMode(pin: string): PinDirection | undefined {
    return this.pinModes.get(pin)
  }

  setDigitalPinState(pin: string, value: 0 | 1): void {
    this.digitalPinStates.set(pin, value)
  }

  /** Defaults to 0 (LOW) — a pin a student hasn't written yet reads as LOW, same as real
   * hardware without a pull-up. Used by pulseIn() to see a color sensor's current S2/S3
   * filter-select state, set by the student's own prior digitalWrite calls this tick. */
  getDigitalPinState(pin: string): 0 | 1 {
    return this.digitalPinStates.get(pin) ?? 0
  }

  setAnalogPinState(pin: string, value: number): void {
    this.analogPinStates.set(pin, value)
  }

  /** Defaults to 0 — an ENA/ENB PWM pin a student hasn't written yet reads as 0 (motor off). */
  getAnalogPinState(pin: string): number {
    return this.analogPinStates.get(pin) ?? 0
  }

  /** Called on every executed leaf statement; throws if a loop() iteration runs away without delay(). */
  countStatement(line?: number): void {
    this.statementCountThisIteration++
    if (this.statementCountThisIteration > BUSY_LOOP_STATEMENT_CEILING) {
      throw new RuntimeError(
        `Possible infinite loop: loop() ran over ${BUSY_LOOP_STATEMENT_CEILING} statements without calling delay(). Add a delay() or check your loop condition.`,
        line,
      )
    }
  }

  /** delay() resets the busy-loop counter — legitimate Arduino sketches pace themselves with delay(). */
  resetStatementCounter(): void {
    this.statementCountThisIteration = 0
  }
}
