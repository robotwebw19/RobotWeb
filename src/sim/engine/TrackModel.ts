import type { Vector2 } from '../../types/domain'
import { distanceToSegment } from '../math/geometry'
import { LINE_HALF_WIDTH_PX } from '../../utils/constants'

/** World-space side length of one spatial-grid cell. Picked relative to the editor canvas
 * (800x500px) so a hand-drawn track's segments spread across a modest number of cells instead
 * of piling into one — coarse enough to keep bucket counts low, fine enough that a query's
 * expanding-ring search usually stops after its first or second ring. */
const GRID_CELL_SIZE_PX = 40

interface Segment {
  a: Vector2
  b: Vector2
}

/**
 * Wraps a level's track line(s) as vector polylines — the same data structure the Level Editor
 * paints, sampled directly at runtime. Disjoint polyline arrays naturally represent line gaps,
 * with no special-casing needed.
 *
 * Nearest-segment queries run every simulation tick, once per IR sensor plus once for the
 * robot's own on-track check (see SensorSampling.ts, SimulationLoop.ts) — a hand-drawn level can
 * carry thousands of brush-sampled points, so a plain linear scan over every segment would
 * redo that whole scan 60+ times a second. A uniform spatial grid buckets segments by the
 * cell(s) their bounding box overlaps; a query expands outward ring by ring from the point's own
 * cell and stops as soon as the closest match found so far is provably closer than anything an
 * unsearched cell could contain — so it examines only the handful of segments actually nearby,
 * not the whole track, while still always returning the exact same distance a full scan would.
 */
export class TrackModel {
  private readonly segments: Segment[] = []
  private readonly grid = new Map<string, number[]>()
  // Bounding box of the grid itself, in cell coordinates — lets maxRadius (below) bound a
  // query's search in O(1) instead of scanning every occupied cell.
  private gridMinCellX = 0
  private gridMaxCellX = 0
  private gridMinCellY = 0
  private gridMaxCellY = 0

  constructor(polylines: Vector2[][]) {
    for (const polyline of polylines) {
      for (let i = 0; i < polyline.length - 1; i++) {
        this.insertSegment({ a: polyline[i], b: polyline[i + 1] })
      }
    }
  }

  private insertSegment(segment: Segment): void {
    const index = this.segments.length
    this.segments.push(segment)

    const minCellX = Math.floor(Math.min(segment.a.x, segment.b.x) / GRID_CELL_SIZE_PX)
    const maxCellX = Math.floor(Math.max(segment.a.x, segment.b.x) / GRID_CELL_SIZE_PX)
    const minCellY = Math.floor(Math.min(segment.a.y, segment.b.y) / GRID_CELL_SIZE_PX)
    const maxCellY = Math.floor(Math.max(segment.a.y, segment.b.y) / GRID_CELL_SIZE_PX)

    if (index === 0) {
      this.gridMinCellX = minCellX
      this.gridMaxCellX = maxCellX
      this.gridMinCellY = minCellY
      this.gridMaxCellY = maxCellY
    } else {
      this.gridMinCellX = Math.min(this.gridMinCellX, minCellX)
      this.gridMaxCellX = Math.max(this.gridMaxCellX, maxCellX)
      this.gridMinCellY = Math.min(this.gridMinCellY, minCellY)
      this.gridMaxCellY = Math.max(this.gridMaxCellY, maxCellY)
    }

    for (let cx = minCellX; cx <= maxCellX; cx++) {
      for (let cy = minCellY; cy <= maxCellY; cy++) {
        const key = cellKey(cx, cy)
        const bucket = this.grid.get(key)
        if (bucket) bucket.push(index)
        else this.grid.set(key, [index])
      }
    }
  }

  distanceToNearestPoint(point: Vector2): number {
    if (this.segments.length === 0) return Infinity

    const pointCellX = Math.floor(point.x / GRID_CELL_SIZE_PX)
    const pointCellY = Math.floor(point.y / GRID_CELL_SIZE_PX)
    const consideredSegments = new Set<number>()

    let minDistance = Infinity
    // Every point in an unsearched cell is at least `radius * GRID_CELL_SIZE_PX` away from
    // `point` along whichever axis put it outside the searched square — see the class doc.
    // So once minDistance found so far is within that guaranteed floor, no wider search could
    // turn up anything closer.
    for (let radius = 0; radius <= this.maxRadius(pointCellX, pointCellY); radius++) {
      for (const [cx, cy] of ringCells(pointCellX, pointCellY, radius)) {
        const bucket = this.grid.get(cellKey(cx, cy))
        if (!bucket) continue
        for (const segmentIndex of bucket) {
          if (consideredSegments.has(segmentIndex)) continue
          consideredSegments.add(segmentIndex)
          const segment = this.segments[segmentIndex]
          const d = distanceToSegment(point, segment.a, segment.b)
          if (d < minDistance) minDistance = d
        }
      }

      if (minDistance <= radius * GRID_CELL_SIZE_PX) break
    }

    return minDistance
  }

  /** Radius (in grid cells) past which every bucketed segment is guaranteed already considered —
   * bounds the search so it terminates even if `point` sits far from every segment. Derived from
   * the grid's own bounding box, computed once at construction, so this is O(1) per query. */
  private maxRadius(pointCellX: number, pointCellY: number): number {
    return Math.max(
      Math.abs(pointCellX - this.gridMinCellX),
      Math.abs(pointCellX - this.gridMaxCellX),
      Math.abs(pointCellY - this.gridMinCellY),
      Math.abs(pointCellY - this.gridMaxCellY),
    )
  }

  isOnTrack(point: Vector2, halfWidth: number = LINE_HALF_WIDTH_PX): boolean {
    return this.distanceToNearestPoint(point) <= halfWidth
  }
}

function cellKey(cx: number, cy: number): string {
  return `${cx},${cy}`
}

/** The grid cells forming the square ring at exactly `radius` cells from (centerX, centerY) —
 * radius 0 is just the center cell itself. */
function* ringCells(centerX: number, centerY: number, radius: number): Generator<[number, number]> {
  if (radius === 0) {
    yield [centerX, centerY]
    return
  }
  for (let dx = -radius; dx <= radius; dx++) {
    yield [centerX + dx, centerY - radius]
    yield [centerX + dx, centerY + radius]
  }
  for (let dy = -radius + 1; dy <= radius - 1; dy++) {
    yield [centerX - radius, centerY + dy]
    yield [centerX + radius, centerY + dy]
  }
}
