import type { SensorConfig } from '../../types/domain'
import type { SensorReading } from '../../sim/engine/SensorSampling'
import { MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT } from '../../utils/constants'
import { RuntimeError } from './errors'
import type { ExecutionContext, RuntimeValue } from './ExecutionContext'
import { asNumber, asString } from './values'

export interface ArduinoRuntimeDeps {
  sensors: SensorConfig[]
  getSensorReadings: () => Record<string, SensorReading>
  getElapsedMs: () => number
  setMotorSpeeds: (left: number, right: number) => void
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

  constructor(deps: ArduinoRuntimeDeps) {
    this.deps = deps
    this.sensorByPin = new Map(deps.sensors.map((sensor) => [sensor.pin, sensor]))
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
      case 'setMotorSpeed':
        return this.setMotorSpeed(args, line)
      case 'moveForward':
        return this.moveForward(args, line)
      case 'turnLeft':
        return this.turnLeft(args, line)
      case 'turnRight':
        return this.turnRight(args, line)
      case 'stopMotors':
        return this.stopMotors()
      case 'readUltrasonic':
        return this.readUltrasonic(args, line)
      case 'readColorSensor':
        return this.readColorSensor(args, line)
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
    if (sensor.irMode === 'analog') {
      throw new RuntimeError(`digitalRead(${pin}): sensor is configured for analog mode — use analogRead() instead`, line)
    }
    return this.deps.getSensorReadings()[sensor.id] ?? 0
  }

  private analogRead(args: RuntimeValue[], line: number): RuntimeValue {
    const pin = asString(args[0])
    const sensor = this.getSensor(pin, 'ir', 'analogRead', line)
    if (sensor.irMode !== 'analog') {
      throw new RuntimeError(`analogRead(${pin}): sensor is configured for digital mode — use digitalRead() instead`, line)
    }
    return this.deps.getSensorReadings()[sensor.id] ?? 0
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

  private readUltrasonic(args: RuntimeValue[], line: number): RuntimeValue {
    const pin = asString(args[0])
    const sensor = this.getSensor(pin, 'ultrasonic', 'readUltrasonic', line)
    return this.deps.getSensorReadings()[sensor.id] ?? 0
  }

  private readColorSensor(args: RuntimeValue[], line: number): RuntimeValue {
    const pin = asString(args[0])
    const sensor = this.getSensor(pin, 'color', 'readColorSensor', line)
    return this.deps.getSensorReadings()[sensor.id] ?? 'white'
  }

  private setMotorSpeed(args: RuntimeValue[], line: number): RuntimeValue {
    const left = asNumber(args[0], 'setMotorSpeed left', line)
    const right = asNumber(args[1], 'setMotorSpeed right', line)
    this.deps.setMotorSpeeds(left * MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT, right * MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT)
    return 0
  }

  private moveForward(args: RuntimeValue[], line: number): RuntimeValue {
    const speed = asNumber(args[0], 'moveForward speed', line) * MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT
    this.deps.setMotorSpeeds(speed, speed)
    return 0
  }

  private turnLeft(args: RuntimeValue[], line: number): RuntimeValue {
    // heading convention: headingDeg increases clockwise on screen (see RobotPhysics.ts), so a
    // real left turn (counterclockwise) needs a *decreasing* heading, i.e. right wheel slower
    // than left — left wheel forward, right wheel backward for a pivot turn.
    const speed = asNumber(args[0], 'turnLeft speed', line) * MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT
    this.deps.setMotorSpeeds(speed, -speed)
    return 0
  }

  private turnRight(args: RuntimeValue[], line: number): RuntimeValue {
    const speed = asNumber(args[0], 'turnRight speed', line) * MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT
    this.deps.setMotorSpeeds(-speed, speed)
    return 0
  }

  private stopMotors(): RuntimeValue {
    this.deps.setMotorSpeeds(0, 0)
    return 0
  }

  private serialPrint(args: RuntimeValue[], newline: boolean): RuntimeValue {
    const text = formatSerialValue(args[0] ?? '')
    this.deps.onSerialOutput(newline ? `${text}\n` : text)
    return 0
  }
}
