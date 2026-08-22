import type { MotorConfig, SensorConfig } from '../../types/domain'
import type { SensorReading } from '../../sim/engine/SensorSampling'
import { MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT, SPEED_OF_SOUND_CM_PER_US } from '../../utils/constants'
import { RuntimeError } from './errors'
import type { ExecutionContext, RuntimeValue } from './ExecutionContext'
import { asNumber, asString } from './values'

export interface ArduinoRuntimeDeps {
  sensors: SensorConfig[]
  motors: MotorConfig[]
  getSensorReadings: () => Record<string, SensorReading>
  getElapsedMs: () => number
  onSerialOutput: (text: string) => void
}

function formatSerialValue(value: RuntimeValue): string {
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }
  if (typeof value === 'boolean') return value ? '1' : '0'
  return value
}

/**
 * Bridges built-in Arduino calls (pinMode, digitalRead, setMotorSpeed, Serial.print, ...) to the
 * simulation. Constructed once per run with the robot's configured sensors and the live sim hooks.
 */
export class ArduinoRuntimeAPI {
  private readonly deps: ArduinoRuntimeDeps
  private readonly sensorByPin: Map<string, SensorConfig>
  private readonly ultrasonicByEchoPin: Map<string, SensorConfig>

  constructor(deps: ArduinoRuntimeDeps) {
    this.deps = deps
    this.sensorByPin = new Map(deps.sensors.map((sensor) => [sensor.pin, sensor]))
    this.ultrasonicByEchoPin = new Map(
      deps.sensors.filter((sensor): sensor is SensorConfig & { echoPin: string } => sensor.echoPin !== undefined)
        .map((sensor) => [sensor.echoPin, sensor]),
    )
  }

  call(name: string, args: RuntimeValue[], context: ExecutionContext, line: number): RuntimeValue {
    switch (name) {
      case 'pinMode':
        return this.pinMode(args, context)
      case 'digitalRead':
        return this.digitalRead(args, line)
      case 'digitalWrite':
        return this.digitalWrite(args, context, line)
      case 'analogRead':
        return this.analogRead(args, line)
      case 'analogWrite':
        return this.analogWrite(args, context, line)
      case 'delay':
        return this.delay(args, context, line)
      case 'delayMicroseconds':
        return this.delayMicroseconds(args, context, line)
      case 'pulseIn':
        return this.pulseIn(args, line)
      case 'Serial.print':
        return this.serialPrint(args, false)
      case 'Serial.println':
        return this.serialPrint(args, true)
      default:
        throw new RuntimeError(`Unknown function "${name}()"`, line)
    }
  }

  private getSensor(pin: string, expectedType: SensorConfig['type'], fnName: string, line: number): SensorConfig {
    const sensor = this.sensorByPin.get(pin)
    if (!sensor) {
      throw new RuntimeError(`${fnName}(${pin}): no sensor is wired to pin ${pin}`, line)
    }
    if (sensor.type !== expectedType) {
      throw new RuntimeError(`${fnName}(${pin}): pin ${pin} has a ${sensor.type} sensor, not ${expectedType}`, line)
    }
    return sensor
  }

  private pinMode(args: RuntimeValue[], context: ExecutionContext): RuntimeValue {
    const pin = asString(args[0])
    const mode = asNumber(args[1], 'pinMode mode')
    context.setPinMode(pin, mode === 1 ? 'OUTPUT' : mode === 2 ? 'INPUT_PULLUP' : 'INPUT')
    return 0
  }

  private digitalRead(args: RuntimeValue[], line: number): RuntimeValue {
    const pin = asString(args[0])
    const sensor = this.getSensor(pin, 'ir', 'digitalRead', line)
    return this.deps.getSensorReadings()[sensor.id] ?? 0
  }

  private analogRead(args: RuntimeValue[], line: number): RuntimeValue {
    const pin = asString(args[0])
    this.getSensor(pin, 'ir', 'analogRead', line)
    throw new RuntimeError(`analogRead(${pin}): IR sensors are digital-only — use digitalRead() instead`, line)
  }

  private digitalWrite(args: RuntimeValue[], context: ExecutionContext, line: number): RuntimeValue {
    const pin = asString(args[0])
    const value = asNumber(args[1], 'digitalWrite value', line)
    if (context.getPinMode(pin) !== 'OUTPUT') {
      throw new RuntimeError(`digitalWrite(${pin}): call pinMode(${pin}, OUTPUT) before writing to it`, line)
    }
    context.setDigitalPinState(pin, value === 0 ? 0 : 1)
    return 0
  }

  private analogWrite(args: RuntimeValue[], context: ExecutionContext, line: number): RuntimeValue {
    const pin = asString(args[0])
    const value = asNumber(args[1], 'analogWrite value', line)
    if (context.getPinMode(pin) !== 'OUTPUT') {
      throw new RuntimeError(`analogWrite(${pin}): call pinMode(${pin}, OUTPUT) before writing to it`, line)
    }
    context.setAnalogPinState(pin, Math.max(0, Math.min(255, value)))
    return 0
  }

  private delay(args: RuntimeValue[], context: ExecutionContext, line: number): RuntimeValue {
    const ms = asNumber(args[0], 'delay duration', line)
    context.waitUntilSimMs = this.deps.getElapsedMs() + ms
    context.resetStatementCounter()
    return 0
  }

  private delayMicroseconds(args: RuntimeValue[], context: ExecutionContext, line: number): RuntimeValue {
    const us = asNumber(args[0], 'delayMicroseconds duration', line)
    context.waitUntilSimMs = this.deps.getElapsedMs() + us / 1000
    context.resetStatementCounter()
    return 0
  }

  /**
   * pulseIn() serves HC-SR04 (ultrasonic) here: trigger `pin` first (a plain digitalWrite
   * HIGH/LOW pulse — no sensor lookup needed for that, it's just an output pin), then
   * `pulseIn(echoPin, HIGH)` measures the round-trip time. The simulator already knows the true
   * distance each tick (see SensorSampling.sampleUltrasonicCm), so this returns the equivalent
   * pulse duration for that distance directly rather than timing an actual pulse — the formula a
   * student's own code inverts is the same one real HC-SR04 datasheets give:
   * distance = duration * 0.0343 / 2.
   */
  private pulseIn(args: RuntimeValue[], line: number): RuntimeValue {
    const pin = asString(args[0])

    const ultrasonic = this.ultrasonicByEchoPin.get(pin)
    if (ultrasonic) {
      const distanceCm = this.deps.getSensorReadings()[ultrasonic.id]
      if (typeof distanceCm !== 'number') return 0
      return Math.round((distanceCm * 2) / SPEED_OF_SOUND_CM_PER_US)
    }

    throw new RuntimeError(`pulseIn(${pin}): no ultrasonic echo pin wired to ${pin}`, line)
  }

  /**
   * Reads each motor's L298N control pins — in1Pin/in2Pin direction (digitalWrite HIGH/LOW: one
   * HIGH one LOW drives, matching values stop/brake) and the enable pin's PWM magnitude
   * (analogWrite 0-255) — and combines them into a signed px/s speed, exactly what a real driver
   * board does with those three pins. Called once per interpreter pump, after student code runs,
   * not from inside `call()` — motor speed is a pin *state*, not a one-shot command.
   */
  computeMotorSpeeds(context: ExecutionContext): { left: number; right: number } {
    let left = 0
    let right = 0
    for (const motor of this.deps.motors) {
      const in1 = context.getDigitalPinState(motor.in1Pin)
      const in2 = context.getDigitalPinState(motor.in2Pin)
      const direction = in1 === 1 && in2 === 0 ? 1 : in1 === 0 && in2 === 1 ? -1 : 0
      const magnitude = context.getAnalogPinState(motor.enablePin)
      const speed = direction * magnitude * MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT
      if (motor.side === 'left') left = speed
      else right = speed
    }
    return { left, right }
  }

  private serialPrint(args: RuntimeValue[], newline: boolean): RuntimeValue {
    const text = formatSerialValue(args[0] ?? '')
    this.deps.onSerialOutput(newline ? `${text}\n` : text)
    return 0
  }
}
