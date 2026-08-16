import { describe, expect, it } from 'vitest'
import { addSingleSensor, buildIrRow } from './sensorFactory'
import type { SensorConfig } from '../types/domain'

describe('buildIrRow', () => {
  it('builds the requested count with unique pins and centered spacing', () => {
    const row = buildIrRow(5, 'digital', [])
    expect(row).toHaveLength(5)
    expect(new Set(row.map((s) => s.pin)).size).toBe(5)
    expect(row.every((s) => s.type === 'ir' && s.irMode === 'digital')).toBe(true)
    // Symmetric around x-axis (forward line), centered on y=0.
    const ys = row.map((s) => s.position.y)
    expect(ys[0]).toBeCloseTo(-ys[ys.length - 1])
  })

  it('avoids pins already used by other sensors', () => {
    const other: SensorConfig[] = [{ id: 'u', type: 'ultrasonic', pin: 'A0', position: { x: 0, y: 0 } }]
    const row = buildIrRow(2, 'digital', other)
    expect(row.some((s) => s.pin === 'A0')).toBe(false)
  })
})

describe('addSingleSensor', () => {
  it('adds a sensor of the given type with the next free pin', () => {
    const result = addSingleSensor('ultrasonic', [])
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('ultrasonic')
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
})
