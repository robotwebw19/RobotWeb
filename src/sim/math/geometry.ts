import type { Vector2 } from '../../types/domain'
import { dot, sub, length } from './vector2'

/** Shortest distance from point `p` to the segment `a`-`b`. */
export function distanceToSegment(p: Vector2, a: Vector2, b: Vector2): number {
  const ab = sub(b, a)
  const abLenSq = dot(ab, ab)
  if (abLenSq === 0) return length(sub(p, a))

  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / abLenSq))
  const closest: Vector2 = { x: a.x + ab.x * t, y: a.y + ab.y * t }
  return length(sub(p, closest))
}

/** Shortest distance from `p` to any segment across a set of polylines (e.g. a track with gaps). */
export function distanceToPolylines(p: Vector2, polylines: Vector2[][]): number {
  let min = Infinity
  for (const polyline of polylines) {
    for (let i = 0; i < polyline.length - 1; i++) {
      const d = distanceToSegment(p, polyline[i], polyline[i + 1])
      if (d < min) min = d
    }
  }
  return min
}

/**
 * Splits a polyline into alternating-color sub-segments at every crossing of `boundaryY`,
 * inserting the exact interpolated crossing point so each sub-segment stays entirely on one
 * side. Rendering-only counterpart to SensorSampling's inversion logic (see
 * types/domain.ts Level.lineInversionBoundaryY) — draws the line so a student can see which
 * half currently reads inverted.
 */
export function splitPolylineByBoundaryY(
  points: Vector2[],
  boundaryY: number,
): { points: Vector2[]; inverted: boolean }[] {
  if (points.length === 0) return []

  const segments: { points: Vector2[]; inverted: boolean }[] = []
  let current: Vector2[] = [points[0]]
  let currentInverted = points[0].y >= boundaryY

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const next = points[i]
    const nextInverted = next.y >= boundaryY

    if (nextInverted !== currentInverted) {
      const t = (boundaryY - prev.y) / (next.y - prev.y)
      const crossing: Vector2 = { x: prev.x + (next.x - prev.x) * t, y: boundaryY }
      current.push(crossing)
      segments.push({ points: current, inverted: currentInverted })
      current = [crossing]
      currentInverted = nextInverted
    }

    current.push(next)
  }
  segments.push({ points: current, inverted: currentInverted })

  return segments
}

/**
 * Distance from `origin` along the (unit) `direction` vector to the nearest point on a circle,
 * or `null` if the ray misses the circle or the circle is entirely behind the origin.
 */
export function rayCircleIntersectionDistance(
  origin: Vector2,
  direction: Vector2,
  center: Vector2,
  radius: number,
): number | null {
  const oc = sub(origin, center)
  const b = dot(oc, direction)
  const c = dot(oc, oc) - radius * radius
  const discriminant = b * b - c
  if (discriminant < 0) return null

  const sqrtDiscriminant = Math.sqrt(discriminant)
  const t1 = -b - sqrtDiscriminant
  const t2 = -b + sqrtDiscriminant

  if (t1 >= 0) return t1
  if (t2 >= 0) return t2
  return null
}
