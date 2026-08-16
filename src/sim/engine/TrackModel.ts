import type { Vector2 } from '../../types/domain'
import { distanceToPolylines } from '../math/geometry'
import { LINE_HALF_WIDTH_PX } from '../../utils/constants'

/**
 * Wraps a level's track line(s) as vector polylines — the same data structure the Level Editor
 * paints, sampled directly at runtime. Disjoint polyline arrays naturally represent line gaps,
 * with no special-casing needed.
 */
export class TrackModel {
  private readonly polylines: Vector2[][]

  constructor(polylines: Vector2[][]) {
    this.polylines = polylines
  }

  distanceToNearestPoint(point: Vector2): number {
    return distanceToPolylines(point, this.polylines)
  }

  isOnTrack(point: Vector2, halfWidth: number = LINE_HALF_WIDTH_PX): boolean {
    return this.distanceToNearestPoint(point) <= halfWidth
  }
}
