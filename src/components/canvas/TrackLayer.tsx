import { Line } from 'react-konva'
import type { Vector2 } from '../../types/domain'
import { splitPolylineByBoundaryY } from '../../sim/math/geometry'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'

interface TrackLayerProps {
  trackPath: Vector2[][]
  viewport?: Viewport
  strokeWidth?: number
  color?: string
  /** See types/domain.ts Level.lineInversionBoundaryY — when set, the portion of each polyline
   * at/past this world Y draws in `invertedColor` instead of `color`. */
  inversionBoundaryY?: number
  invertedColor?: string
}

function toStagePoints(points: Vector2[], viewport: Viewport): number[] {
  return points.flatMap((point) => {
    const stagePoint = worldToStage(point, viewport)
    return [stagePoint.x, stagePoint.y]
  })
}

export function TrackLayer({
  trackPath,
  viewport = defaultViewport,
  strokeWidth = 16,
  color = '#2b2b2b',
  inversionBoundaryY,
  invertedColor = '#f8f9fa',
}: TrackLayerProps) {
  if (inversionBoundaryY === undefined) {
    return (
      <>
        {trackPath.map((polyline, index) => (
          <Line
            key={index}
            points={toStagePoints(polyline, viewport)}
            stroke={color}
            strokeWidth={strokeWidth * viewport.scale}
            lineCap="round"
            lineJoin="round"
          />
        ))}
      </>
    )
  }

  return (
    <>
      {trackPath.map((polyline, polylineIndex) =>
        splitPolylineByBoundaryY(polyline, inversionBoundaryY).map((segment, segmentIndex) => (
          <Line
            key={`${polylineIndex}-${segmentIndex}`}
            points={toStagePoints(segment.points, viewport)}
            stroke={segment.inverted ? invertedColor : color}
            strokeWidth={strokeWidth * viewport.scale}
            lineCap="round"
            lineJoin="round"
          />
        )),
      )}
    </>
  )
}
