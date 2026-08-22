import { describe, expect, it } from 'vitest'
import { distanceToPolylines } from '../math/geometry'
import type { Vector2 } from '../../types/domain'
import { TrackModel } from './TrackModel'

/** Deterministic PRNG (mulberry32) so the spatial-index cross-check below is reproducible. */
function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe('TrackModel', () => {
  it('measures distance to the nearest point on a straight segment', () => {
    const track = new TrackModel([
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    ])
    expect(track.distanceToNearestPoint({ x: 50, y: 0 })).toBeCloseTo(0)
    expect(track.distanceToNearestPoint({ x: 50, y: 5 })).toBeCloseTo(5)
    expect(track.distanceToNearestPoint({ x: 150, y: 0 })).toBeCloseTo(50)
  })

  it('treats disjoint polylines as a gapped line with no special-casing', () => {
    const track = new TrackModel([
      [
        { x: 0, y: 0 },
        { x: 40, y: 0 },
      ],
      [
        { x: 60, y: 0 },
        { x: 100, y: 0 },
      ],
    ])
    // Midpoint of the 20px gap is 10px from either segment end.
    expect(track.distanceToNearestPoint({ x: 50, y: 0 })).toBeCloseTo(10)
  })

  it('reports on/off track using the given half-width', () => {
    const track = new TrackModel([
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ],
    ])
    expect(track.isOnTrack({ x: 50, y: 5 }, 8)).toBe(true)
    expect(track.isOnTrack({ x: 50, y: 10 }, 8)).toBe(false)
  })

  it('matches a brute-force linear scan for a large, gappy, multi-polyline track', () => {
    // Simulates a hand-drawn level: several disjoint zig-zag polylines scattered across an
    // area much bigger than one grid cell, so the query points below exercise the spatial
    // grid's expanding-ring search (multiple rings, empty cells, points far outside every
    // segment's bounding box) rather than only ever landing in a single occupied cell.
    const random = mulberry32(42)
    const polylines: Vector2[][] = []
    for (let p = 0; p < 12; p++) {
      const polyline: Vector2[] = []
      let x = random() * 2000
      let y = random() * 2000
      polyline.push({ x, y })
      for (let i = 0; i < 20; i++) {
        x += (random() - 0.5) * 150
        y += (random() - 0.5) * 150
        polyline.push({ x, y })
      }
      polylines.push(polyline)
    }
    const track = new TrackModel(polylines)

    for (let i = 0; i < 300; i++) {
      const point = { x: random() * 2400 - 200, y: random() * 2400 - 200 }
      expect(track.distanceToNearestPoint(point)).toBeCloseTo(distanceToPolylines(point, polylines), 6)
    }
  })

  it('returns Infinity for an empty track', () => {
    const track = new TrackModel([])
    expect(track.distanceToNearestPoint({ x: 0, y: 0 })).toBe(Infinity)
    expect(track.isOnTrack({ x: 0, y: 0 })).toBe(false)
  })
})
