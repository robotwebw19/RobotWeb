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
