import { describe, expect, it } from 'vitest'
import { TrackModel } from './TrackModel'
import {
  sampleColor,
  sampleIrAnalog,
  sampleIrDigital,
  sampleUltrasonicCm,
  sensorWorldPosition,
} from './SensorSampling'

const straightTrack = new TrackModel([
  [
    { x: 0, y: 0 },
    { x: 200, y: 0 },
  ],
])

describe('sensorWorldPosition', () => {
  it('rotates a robot-local offset by the current heading and adds robot position', () => {
    // heading 90deg: robot-forward (+x local) points along world +y.
    const worldPos = sensorWorldPosition(
      { x: 100, y: 100, headingDeg: 90 },
      { id: 's', type: 'ir', pin: 'A0', position: { x: 10, y: 0 } },
    )
    expect(worldPos.x).toBeCloseTo(100)
    expect(worldPos.y).toBeCloseTo(110)
  })
})

describe('sampleIrDigital', () => {
  it('reads 1 on the line and 0 off it', () => {
    expect(sampleIrDigital({ x: 50, y: 0 }, straightTrack)).toBe(1)
    expect(sampleIrDigital({ x: 50, y: 30 }, straightTrack)).toBe(0)
  })
})

describe('sampleIrAnalog', () => {
  it('peaks at 1023 on the line center and falls off to 0 with distance', () => {
    expect(sampleIrAnalog({ x: 50, y: 0 }, straightTrack)).toBe(1023)
    expect(sampleIrAnalog({ x: 50, y: 10 }, straightTrack)).toBe(512)
    expect(sampleIrAnalog({ x: 50, y: 100 }, straightTrack)).toBe(0)
  })
})

describe('sampleColor', () => {
  it('prefers color zones over the base track/background colors', () => {
    const zones = [{ x: 50, y: 50, radius: 10, color: 'red' as const }]
    expect(sampleColor({ x: 50, y: 50 }, straightTrack, zones)).toBe('red')
    expect(sampleColor({ x: 50, y: 0 }, straightTrack, zones)).toBe('black')
    expect(sampleColor({ x: 50, y: 200 }, straightTrack, zones)).toBe('white')
  })
})

describe('sampleUltrasonicCm', () => {
  it('returns the distance in cm to the nearest obstacle along the beam', () => {
    const obstacles = [{ x: 100, y: 0, radius: 20 }]
    // Ray from origin along +x hits the 20px-radius circle at x=80 -> 80px / 4px-per-cm = 20cm.
    const cm = sampleUltrasonicCm({ x: 0, y: 0 }, 0, obstacles)
    expect(cm).toBeCloseTo(20)
  })

  it('returns maxRange when nothing is in the beam path', () => {
    const cm = sampleUltrasonicCm({ x: 0, y: 0 }, 0, [], 150)
    expect(cm).toBe(150)
  })

  it('ignores obstacles behind the sensor', () => {
    const obstacles = [{ x: -100, y: 0, radius: 20 }]
    const cm = sampleUltrasonicCm({ x: 0, y: 0 }, 0, obstacles, 150)
    expect(cm).toBe(150)
  })
})
