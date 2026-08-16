import { Stage, Layer, Rect } from 'react-konva'
import type { ColorZone, FinishZone, Obstacle, SensorConfig, Vector2 } from '../../types/domain'
import type { Pose } from '../../sim/engine/RobotPhysics'
import type { SensorReading } from '../../sim/engine/SensorSampling'
import { TrackLayer } from './TrackLayer'
import { ObstacleLayer } from './ObstacleLayer'
import { ColorZoneLayer } from './ColorZoneLayer'
import { FinishZoneLayer } from './FinishZoneLayer'
import { RobotSprite } from './RobotSprite'
import { SensorOverlay } from './SensorOverlay'

interface SimCanvasProps {
  width: number
  height: number
  trackPath: Vector2[][]
  obstacles: Obstacle[]
  colorZones: ColorZone[]
  finishZone: FinishZone
  sensors: SensorConfig[]
  pose: Pose
  leftMotorSpeed?: number
  rightMotorSpeed?: number
  sensorReadings?: Record<string, SensorReading>
}

/**
 * Read-only render of the current sim state. Composes the same layers the Level Editor uses
 * (see components/editor/LevelEditorCanvas.tsx), just without pointer-tool handlers attached,
 * so a level plays back exactly as it was painted.
 */
export function SimCanvas({
  width,
  height,
  trackPath,
  obstacles,
  colorZones,
  finishZone,
  sensors,
  pose,
  leftMotorSpeed,
  rightMotorSpeed,
  sensorReadings,
}: SimCanvasProps) {
  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill="#f7f7f5" />
        <ColorZoneLayer colorZones={colorZones} />
        <FinishZoneLayer finishZone={finishZone} />
        <TrackLayer trackPath={trackPath} />
        <ObstacleLayer obstacles={obstacles} />
        <RobotSprite pose={pose} leftMotorSpeed={leftMotorSpeed} rightMotorSpeed={rightMotorSpeed} />
        <SensorOverlay pose={pose} sensors={sensors} sensorReadings={sensorReadings} />
      </Layer>
    </Stage>
  )
}
