import { useRef } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { ColorZoneColor, Level, Vector2 } from '../../types/domain'
import { TrackLayer } from '../canvas/TrackLayer'
import { ObstacleLayer } from '../canvas/ObstacleLayer'
import { ColorZoneLayer } from '../canvas/ColorZoneLayer'
import { FinishZoneLayer } from '../canvas/FinishZoneLayer'
import { RobotSprite } from '../canvas/RobotSprite'
import { stageToWorld, type Viewport } from '../canvas/gridUtils'
import { distanceToPolylines } from '../../sim/math/geometry'
import { flattenQuadraticBezier } from './bezier'
import {
  EDITOR_CANVAS_WIDTH_PX,
  EDITOR_COLOR_ZONE_RADIUS_PX,
  EDITOR_DISPLAY_HEIGHT_PX,
  EDITOR_DISPLAY_WIDTH_PX,
  EDITOR_ERASE_HIT_RADIUS_PX,
  EDITOR_FINISH_RADIUS_PX,
  EDITOR_OBSTACLE_RADIUS_PX,
} from '../../utils/constants'

const VIEWPORT: Viewport = { scale: EDITOR_DISPLAY_WIDTH_PX / EDITOR_CANVAS_WIDTH_PX, offsetX: 0, offsetY: 0 }

export type EditorTool = 'brush' | 'eraser' | 'line' | 'curve' | 'obstacle' | 'color-zone' | 'start' | 'finish'
export type EditorLevelDraft = Omit<Level, 'id' | 'createdBy'>

interface LevelEditorCanvasProps {
  draft: EditorLevelDraft
  onChange: (updater: (prev: EditorLevelDraft) => EditorLevelDraft) => void
  tool: EditorTool
  activeColor: ColorZoneColor
}

export function LevelEditorCanvas({ draft, onChange, tool, activeColor }: LevelEditorCanvasProps) {
  const isDrawingRef = useRef(false)
  const curvePointsRef = useRef<Vector2[]>([])

  function pointerWorldPos(event: KonvaEventObject<MouseEvent>): Vector2 | null {
    const pos = event.target.getStage()?.getPointerPosition()
    return pos ? stageToWorld(pos, VIEWPORT) : null
  }

  function handleMouseDown(event: KonvaEventObject<MouseEvent>) {
    const point = pointerWorldPos(event)
    if (!point) return

    switch (tool) {
      case 'brush':
        isDrawingRef.current = true
        onChange((prev) => ({ ...prev, trackPath: [...prev.trackPath, [point]] }))
        return
      case 'line':
        isDrawingRef.current = true
        onChange((prev) => ({ ...prev, trackPath: [...prev.trackPath, [point, point]] }))
        return
      case 'curve': {
        curvePointsRef.current = [...curvePointsRef.current, point]
        if (curvePointsRef.current.length === 3) {
          const [start, control, end] = curvePointsRef.current
          const flattened = flattenQuadraticBezier(start, control, end, 16)
          onChange((prev) => ({ ...prev, trackPath: [...prev.trackPath, flattened] }))
          curvePointsRef.current = []
        }
        return
      }
      case 'eraser':
        onChange((prev) => ({
          ...prev,
          trackPath: prev.trackPath.filter(
            (polyline) => distanceToPolylines(point, [polyline]) > EDITOR_ERASE_HIT_RADIUS_PX,
          ),
        }))
        return
      case 'obstacle':
        onChange((prev) => {
          const hitIndex = prev.obstacles.findIndex((o) => Math.hypot(o.x - point.x, o.y - point.y) <= o.radius)
          if (hitIndex >= 0) {
            return { ...prev, obstacles: prev.obstacles.filter((_, i) => i !== hitIndex) }
          }
          return { ...prev, obstacles: [...prev.obstacles, { x: point.x, y: point.y, radius: EDITOR_OBSTACLE_RADIUS_PX }] }
        })
        return
      case 'color-zone':
        onChange((prev) => {
          const hitIndex = prev.colorZones.findIndex((z) => Math.hypot(z.x - point.x, z.y - point.y) <= z.radius)
          if (hitIndex >= 0) {
            return { ...prev, colorZones: prev.colorZones.filter((_, i) => i !== hitIndex) }
          }
          return {
            ...prev,
            colorZones: [...prev.colorZones, { x: point.x, y: point.y, radius: EDITOR_COLOR_ZONE_RADIUS_PX, color: activeColor }],
          }
        })
        return
      case 'start':
        onChange((prev) => ({ ...prev, startPosition: { ...point, headingDeg: prev.startPosition.headingDeg } }))
        return
      case 'finish':
        onChange((prev) => ({ ...prev, finishZone: { ...point, radius: EDITOR_FINISH_RADIUS_PX } }))
        return
    }
  }

  function handleMouseMove(event: KonvaEventObject<MouseEvent>) {
    if (!isDrawingRef.current) return
    const point = pointerWorldPos(event)
    if (!point) return

    if (tool === 'brush') {
      onChange((prev) => {
        const trackPath = [...prev.trackPath]
        trackPath[trackPath.length - 1] = [...trackPath[trackPath.length - 1], point]
        return { ...prev, trackPath }
      })
    } else if (tool === 'line') {
      onChange((prev) => {
        const trackPath = [...prev.trackPath]
        const current = trackPath[trackPath.length - 1]
        trackPath[trackPath.length - 1] = [current[0], point]
        return { ...prev, trackPath }
      })
    }
  }

  function handleMouseUp() {
    isDrawingRef.current = false
  }

  return (
    <Stage
      width={EDITOR_DISPLAY_WIDTH_PX}
      height={EDITOR_DISPLAY_HEIGHT_PX}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer>
        <Rect x={0} y={0} width={EDITOR_DISPLAY_WIDTH_PX} height={EDITOR_DISPLAY_HEIGHT_PX} fill="#f8f8f7" />
        <ColorZoneLayer colorZones={draft.colorZones} viewport={VIEWPORT} />
        <FinishZoneLayer finishZone={draft.finishZone} viewport={VIEWPORT} />
        <TrackLayer trackPath={draft.trackPath} viewport={VIEWPORT} />
        <ObstacleLayer obstacles={draft.obstacles} viewport={VIEWPORT} />
        <RobotSprite pose={draft.startPosition} viewport={VIEWPORT} />
      </Layer>
    </Stage>
  )
}
