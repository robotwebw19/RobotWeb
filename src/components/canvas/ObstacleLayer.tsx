import { Circle } from 'react-konva'
import type { Obstacle } from '../../types/domain'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'

interface ObstacleLayerProps {
  obstacles: Obstacle[]
  viewport?: Viewport
}

export function ObstacleLayer({ obstacles, viewport = defaultViewport }: ObstacleLayerProps) {
  return (
    <>
      {obstacles.map((obstacle, index) => {
        const stagePos = worldToStage({ x: obstacle.x, y: obstacle.y }, viewport)
        return (
          <Circle
            key={index}
            x={stagePos.x}
            y={stagePos.y}
            radius={obstacle.radius * viewport.scale}
            fill="#495057"
          />
        )
      })}
    </>
  )
}
