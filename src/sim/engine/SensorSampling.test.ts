import { describe, expect, it } from 'vitest'
import { TrackModel } from './TrackModel'
import { sampleIrDigital, sampleUltrasonicCm, sensorWorldPosition } from './SensorSampling'

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

describe('sampleIrDigital with an inversion boundary', () => {
  it('reads normally above the boundary — unaffected, matches every other level', () => {
    expect(sampleIrDigital({ x: 50, y: 0 }, straightTrack, 100)).toBe(1) // on line
    expect(sampleIrDigital({ x: 50, y: 30 }, straightTrack, 100)).toBe(0) // off line
  })

  it('flips the bit at/past the boundary — a fixed-threshold sensor reads dark, not "line"', () => {
    const trackPastBoundary = new TrackModel([
      [
        { x: 0, y: 150 },
        { x: 200, y: 150 },
      ],
    ])
    expect(sampleIrDigital({ x: 50, y: 150 }, trackPastBoundary, 100)).toBe(0) // on line, but inverted -> 0
    expect(sampleIrDigital({ x: 50, y: 180 }, trackPastBoundary, 100)).toBe(1) // off line, but inverted -> 1
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
