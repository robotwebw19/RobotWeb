import type { Vector2 } from '../../types/domain'

/** Flattens a quadratic Bezier (start, control, end) into a polyline of `segments` line segments. */
export function flattenQuadraticBezier(start: Vector2, control: Vector2, end: Vector2, segments: number): Vector2[] {
  const points: Vector2[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const oneMinusT = 1 - t
    points.push({
      x: oneMinusT * oneMinusT * start.x + 2 * oneMinusT * t * control.x + t * t * end.x,
      y: oneMinusT * oneMinusT * start.y + 2 * oneMinusT * t * control.y + t * t * end.y,
    })
  }
  return points
}
