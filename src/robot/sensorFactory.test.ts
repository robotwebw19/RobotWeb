import { describe, expect, it } from 'vitest'
import { addSingleSensor, buildIrRow } from './sensorFactory'
import type { SensorConfig } from '../types/domain'

describe('buildIrRow', () => {
  it('builds the requested count with unique pins and centered spacing', () => {
    const row = buildIrRow(5, [])
    expect(row).toHaveLength(5)
    expect(new Set(row.map((s) => s.pin)).size).toBe(5)
    expect(row.every((s) => s.type === 'ir')).toBe(true)
    // Symmetric around x-axis (forward line), centered on y=0.
    const ys = row.map((s) => s.position.y)
    expect(ys[0]).toBeCloseTo(-ys[ys.length - 1])
  })

  it('avoids pins already used by other sensors', () => {
    const other: SensorConfig[] = [{ id: 'u', type: 'ultrasonic', pin: 'D2', position: { x: 0, y: 0 } }]
    const row = buildIrRow(2, other)
    expect(row.some((s) => s.pin === 'D2')).toBe(false)
  })
})

describe('addSingleSensor', () => {
  it('adds a sensor of the given type with the next free pin', () => {
    const result = addSingleSensor('color', [])
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('color')
  })

  it('caps at one sensor per type', () => {
    const first = addSingleSensor('ultrasonic', [])
    const second = addSingleSensor('ultrasonic', first)
    expect(second).toBe(first)
    expect(second).toHaveLength(1)
  })

  it('is a no-op when every pin in that type\'s range is already used by other sensors', () => {
    const colorPinsTaken: SensorConfig[] = ['D8', 'D9', 'D10', 'D11', 'D12', 'D13'].map((pin) => ({
      id: pin,
      type: 'ir',
      pin,
      position: { x: 0, y: 0 },
    }))
    const result = addSingleSensor('color', colorPinsTaken)
    expect(result).toBe(colorPinsTaken)
  })

  describe('ultrasonic (needs two pins — Trig and Echo, like a real HC-SR04)', () => {
    it('wires two distinct pins: pin (Trig) and echoPin (Echo)', () => {
      const result = addSingleSensor('ultrasonic', [])
      expect(result).toHaveLength(1)
      const [sensor] = result
      expect(sensor.pin).not.toBe(sensor.echoPin)
      expect(sensor.echoPin).toBeDefined()
    })

    it('avoids echo pins already used by other sensors, not just trig pins', () => {
      // Ultrasonic already sitting on D2 (Trig) and D3 (Echo). IR's pin pool overlaps
      // ultrasonic's, so the next IR pin picked must avoid both — not just the trig pin D2.
      const other: SensorConfig[] = [{ id: 'x', type: 'ultrasonic', pin: 'D2', echoPin: 'D3', position: { x: 0, y: 0 } }]
      const result = addSingleSensor('ir', other)
      const added = result.find((s) => s.type === 'ir')
      expect(added).toBeDefined()
      expect(added?.pin).not.toBe('D2')
      expect(added?.pin).not.toBe('D3')
    })

    it('is a no-op when fewer than two free pins remain for Trig+Echo', () => {
      // Ultrasonic's pool is D2-D7 (6 pins) — take all but one.
      const almostAllTaken: SensorConfig[] = ['D2', 'D3', 'D4', 'D5', 'D6'].map((pin) => ({
        id: pin,
        type: 'color',
        pin,
        position: { x: 0, y: 0 },
      }))
      const result = addSingleSensor('ultrasonic', almostAllTaken)
      expect(result).toBe(almostAllTaken)
    })
  })

  describe('color (needs five pins — OUT, S0, S1, S2, S3, like a real TCS230)', () => {
    it('wires five distinct pins: pin (OUT) plus s0Pin-s3Pin', () => {
      const result = addSingleSensor('color', [])
      expect(result).toHaveLength(1)
      const [sensor] = result
      const pins = [sensor.pin, sensor.s0Pin, sensor.s1Pin, sensor.s2Pin, sensor.s3Pin]
      expect(pins.every((pin) => pin !== undefined)).toBe(true)
      expect(new Set(pins).size).toBe(5)
    })

    it('is a no-op when fewer than five free pins remain', () => {
      // Color's pool is D8-D13 (6 pins) — take all but four, leaving only 4 free.
      const almostAllTaken: SensorConfig[] = ['D8', 'D9'].map((pin) => ({
        id: pin,
        type: 'ir',
        pin,
        position: { x: 0, y: 0 },
      }))
      const result = addSingleSensor('color', almostAllTaken)
      expect(result).toBe(almostAllTaken)
    })
  })
})
