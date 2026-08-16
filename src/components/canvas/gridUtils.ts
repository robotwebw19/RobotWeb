import type { Vector2 } from '../../types/domain'

export interface Viewport {
  scale: number
  offsetX: number
  offsetY: number
}

export const defaultViewport: Viewport = { scale: 1, offsetX: 0, offsetY: 0 }

/**
 * The single source of truth for converting between simulation world coordinates and Konva
 * stage pixel coordinates. Every canvas layer (sim view and Level Editor alike) must go through
 * these two functions instead of doing its own math, so world and stage space never drift apart.
 */
export function worldToStage(point: Vector2, viewport: Viewport = defaultViewport): Vector2 {
  return {
    x: point.x * viewport.scale + viewport.offsetX,
    y: point.y * viewport.scale + viewport.offsetY,
  }
}

export function stageToWorld(point: Vector2, viewport: Viewport = defaultViewport): Vector2 {
  return {
    x: (point.x - viewport.offsetX) / viewport.scale,
    y: (point.y - viewport.offsetY) / viewport.scale,
  }
}
