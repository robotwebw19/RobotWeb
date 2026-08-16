import { Circle } from 'react-konva'
import type { FinishZone } from '../../types/domain'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'

interface FinishZoneLayerProps {
  finishZone: FinishZone
  viewport?: Viewport
}

export function FinishZoneLayer({ finishZone, viewport = defaultViewport }: FinishZoneLayerProps) {
  const stagePos = worldToStage({ x: finishZone.x, y: finishZone.y }, viewport)
  const radius = finishZone.radius * viewport.scale

  return (
    <Circle
      x={stagePos.x}
      y={stagePos.y}
      radius={radius}
      fill="#40c05733"
      stroke="#2f9e44"
      strokeWidth={2.5 * viewport.scale}
      dash={[6 * viewport.scale, 4 * viewport.scale]}
    />
  )
}
