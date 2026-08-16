import type { Vector2 } from '../../types/domain'

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function sub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function scale(v: Vector2, s: number): Vector2 {
  return { x: v.x * s, y: v.y * s }
}

export function length(v: Vector2): number {
  return Math.hypot(v.x, v.y)
}

export function distance(a: Vector2, b: Vector2): number {
  return length(sub(a, b))
}

export function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y
}

export function normalize(v: Vector2): Vector2 {
  const len = length(v)
  if (len === 0) return { x: 0, y: 0 }
  return { x: v.x / len, y: v.y / len }
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}

/** Rotates a vector by `angleDeg` around the origin (0,0), clockwise for positive angles in screen space. */
export function rotate(v: Vector2, angleDeg: number): Vector2 {
  const rad = degToRad(angleDeg)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos }
}

/** Normalizes an angle in degrees to the range [-180, 180). */
export function normalizeAngleDeg(deg: number): number {
  let normalized = deg % 360
  if (normalized < -180) normalized += 360
  if (normalized >= 180) normalized -= 360
  return normalized
}
