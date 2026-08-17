import { describe, expect, it } from 'vitest'
import { totalCostCredits, validateRobotConfig } from './robotConfigValidation'
import type { MotorConfig, SensorConfig } from '../types/domain'

const ir = (pin: string): SensorConfig => ({ id: pin, type: 'ir', pin, position: { x: 0, y: 0 } })
const ultrasonic = (pin: string, echoPin?: string): SensorConfig => ({
  id: pin,
  type: 'ultrasonic',
  pin,
  echoPin,
  position: { x: 0, y: 0 },
})
const color = (pin: string, s0Pin: string, s1Pin: string, s2Pin: string, s3Pin: string): SensorConfig => ({
  id: pin,
  type: 'color',
  pin,
  s0Pin,
  s1Pin,
  s2Pin,
  s3Pin,
  position: { x: 0, y: 0 },
})
const bothMotors: MotorConfig[] = [
  { id: 'm1', side: 'left', in1Pin: 'IN1', in2Pin: 'IN2', enablePin: 'ENA', position: { x: 0, y: 0 } },
  { id: 'm2', side: 'right', in1Pin: 'IN3', in2Pin: 'IN4', enablePin: 'ENB', position: { x: 0, y: 0 } },
]

describe('totalCostCredits', () => {
  it('sums catalog prices for each sensor', () => {
    expect(totalCostCredits([ir('A0'), ir('A1'), ultrasonic('D2')])).toBe(50 + 50 + 150)
  })

  it('adds motor prices on top of sensor prices', () => {
    expect(totalCostCredits([ir('A0')], bothMotors)).toBe(50 + 40 + 40)
  })
})

describe('validateRobotConfig', () => {
  it('rejects an empty sensor list', () => {
    const result = validateRobotConfig([], bothMotors)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.key === 'validation.noSensors')).toBe(true)
  })

  it('rejects duplicate pin assignments (including sensor/motor collisions)', () => {
    const result = validateRobotConfig([ir('A0'), ultrasonic('A0')], bothMotors)
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({ key: 'validation.duplicatePin', vars: { pin: 'A0' } })
  })

  it("rejects an ultrasonic sensor's echoPin colliding with another pin, not just its trig pin", () => {
    const result = validateRobotConfig([ir('D3'), ultrasonic('D2', 'D3')], bothMotors)
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({ key: 'validation.duplicatePin', vars: { pin: 'D3' } })
  })

  it("rejects a color sensor's S2 pin colliding with another pin, not just its OUT pin", () => {
    const result = validateRobotConfig([ir('D11'), color('D8', 'D9', 'D10', 'D11', 'D12')], bothMotors)
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({ key: 'validation.duplicatePin', vars: { pin: 'D11' } })
  })

  it('rejects a config missing either motor', () => {
    const leftOnly = validateRobotConfig([ir('A0')], [bothMotors[0]])
    expect(leftOnly.errors.some((e) => e.key === 'validation.missingMotors')).toBe(true)

    const noMotors = validateRobotConfig([ir('A0')], [])
    expect(noMotors.errors.some((e) => e.key === 'validation.missingMotors')).toBe(true)
  })

  it('accepts a valid, unique-pin config with both motors', () => {
    const result = validateRobotConfig(
      [ir('A0'), ir('A1'), ultrasonic('D2', 'D3'), color('D8', 'D9', 'D10', 'D11', 'D12')],
      bothMotors,
    )
    expect(result).toEqual({ valid: true, errors: [] })
  })
})
