import type { Level } from '../types/domain'
import { level01Straight } from '../levels/definitions/level01Straight'
import { level02Curve } from '../levels/definitions/level02Curve'
import { level03MultiJunction } from '../levels/definitions/level03MultiJunction'
import { level04GappedLine } from '../levels/definitions/level04GappedLine'
import { level05ColorZone } from '../levels/definitions/level05ColorZone'

export const seedLevels: Level[] = [
  level01Straight,
  level02Curve,
  level03MultiJunction,
  level04GappedLine,
  level05ColorZone,
]
