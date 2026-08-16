import { Line } from 'react-konva'
import type { Vector2 } from '../../types/domain'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'

interface TrackLayerProps {
  trackPath: Vector2[][]
  viewport?: Viewport
  strokeWidth?: number
  color?: string
}

export function TrackLayer({
  trackPath,
  viewport = defaultViewport,
  strokeWidth = 16,
  color = '#2b2b2b',
}: TrackLayerProps) {
  return (
    <>
      {trackPath.map((polyline, index) => (
        <Line
          key={index}
          points={polyline.flatMap((point) => {
            const stagePoint = worldToStage(point, viewport)
            return [stagePoint.x, stagePoint.y]
          })}
          stroke={color}
          strokeWidth={strokeWidth * viewport.scale}
          lineCap="round"
          lineJoin="round"
        />
      ))}
    </>
  )
}
