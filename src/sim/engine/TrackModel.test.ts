import { describe, expect, it } from 'vitest'
import { TrackModel } from './TrackModel'

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
})
