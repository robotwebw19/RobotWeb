import { Stage, Layer, Rect, Text } from 'react-konva'
import type { Level } from '../../types/domain'
import type { RaceTrackRobotPayload } from '../../sim/engine/raceTrackChannel'
import { TrackLayer } from '../canvas/TrackLayer'
import { ObstacleLayer } from '../canvas/ObstacleLayer'
import { ColorZoneLayer } from '../canvas/ColorZoneLayer'
import { FinishZoneLayer } from '../canvas/FinishZoneLayer'
import { RobotSprite } from '../canvas/RobotSprite'
import { worldToStage, defaultViewport } from '../canvas/gridUtils'
import { EDITOR_CANVAS_WIDTH_PX, EDITOR_CANVAS_HEIGHT_PX } from '../../utils/constants'

interface RaceTrackCanvasProps {
  level: Level
  robots: RaceTrackRobotPayload[]
}

const STATUS_LABEL_COLOR: Record<RaceTrackRobotPayload['status'], string> = {
  idle: '#495057',
  running: '#062327',
  paused: '#495057',
  passed: '#2b8a3e',
  failed: '#c92a2a',
}

function RaceTrackRobot({ robot }: { robot: RaceTrackRobotPayload }) {
  const stagePos = worldToStage(robot.pose, defaultViewport)
  return (
    <>
      <RobotSprite pose={robot.pose} />
      <Text
        x={stagePos.x - 45}
        y={stagePos.y - 34}
        width={90}
        align="center"
        text={`${robot.firstName} #${robot.studentNumber}`}
        fontSize={11}
        fontStyle="bold"
        fill={STATUS_LABEL_COLOR[robot.status]}
        listening={false}
      />
    </>
  )
}

/** Read-only multi-robot render of one level's track — the admin "สนามแข่ง" live view. World
 * space and layers are identical to SimCanvas.tsx, just with N robots instead of one and no
 * sensor overlay (a spectator view has no reason to show sensor detail). */
export function RaceTrackCanvas({ level, robots }: RaceTrackCanvasProps) {
  const width = EDITOR_CANVAS_WIDTH_PX
  const height = EDITOR_CANVAS_HEIGHT_PX
  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill="#f8f8f7" />
        {level.lineInversionBoundaryY !== undefined && (
          <Rect
            x={0}
            y={level.lineInversionBoundaryY}
            width={width}
            height={height - level.lineInversionBoundaryY}
            fill="#212529"
          />
        )}
        <ColorZoneLayer colorZones={level.colorZones} />
        <FinishZoneLayer finishZone={level.finishZone} />
        <TrackLayer trackPath={level.trackPath} inversionBoundaryY={level.lineInversionBoundaryY} />
        <ObstacleLayer obstacles={level.obstacles} />
        {robots.map((robot) => (
          <RaceTrackRobot key={robot.studentId} robot={robot} />
        ))}
      </Layer>
    </Stage>
  )
}
