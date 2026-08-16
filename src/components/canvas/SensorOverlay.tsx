import { useRef } from 'react'
import { Circle, Group } from 'react-konva'
import type { SensorConfig } from '../../types/domain'
import type { Pose } from '../../sim/engine/RobotPhysics'
import type { SensorReading } from '../../sim/engine/SensorSampling'
import { sensorWorldPosition } from '../../sim/engine/SensorSampling'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'
import { ULTRASONIC_MAX_RANGE_CM } from '../../utils/constants'

interface SensorOverlayProps {
  pose: Pose
  sensors: SensorConfig[]
  sensorReadings?: Record<string, SensorReading>
  viewport?: Viewport
}

const COLOR_BY_TYPE: Record<SensorConfig['type'], string> = {
  ir: '#e64980',
  ultrasonic: '#15aabf',
  color: '#f08c00',
}

/** Whether a sensor is currently picking something up — drives the "detecting" glow. */
function isDetecting(sensor: SensorConfig, reading: SensorReading | undefined): boolean {
  if (reading === undefined) return false
  if (sensor.type === 'ir') {
    return sensor.irMode === 'analog' ? (reading as number) >= 512 : reading === 1
  }
  if (sensor.type === 'ultrasonic') {
    return (reading as number) <= ULTRASONIC_MAX_RANGE_CM * 0.25
  }
  return reading !== 'white'
}

export function SensorOverlay({ pose, sensors, sensorReadings = {}, viewport = defaultViewport }: SensorOverlayProps) {
  // A free-running clock (real elapsed time, accumulated across renders) drives the pulsing glow.
  // SensorOverlay re-renders every physics tick while running, so this animates during a run and
  // simply stops advancing once paused/idle.
  const clockRef = useRef({ seconds: 0, lastTimeMs: null as number | null })
  const now = performance.now()
  clockRef.current.seconds += clockRef.current.lastTimeMs !== null ? (now - clockRef.current.lastTimeMs) / 1000 : 0
  clockRef.current.lastTimeMs = now
  const pulse = (Math.sin(clockRef.current.seconds * 6) + 1) / 2 // 0..1

  return (
    <>
      {sensors.map((sensor) => {
        const stagePos = worldToStage(sensorWorldPosition(pose, sensor), viewport)
        const color = COLOR_BY_TYPE[sensor.type]
        const active = isDetecting(sensor, sensorReadings[sensor.id])
        const dotRadius = 4 * viewport.scale

        return (
          <Group key={sensor.id} x={stagePos.x} y={stagePos.y}>
            {active && (
              <Circle
                radius={dotRadius * (2.2 + pulse * 0.8)}
                fill={color}
                opacity={0.28 * (1 - pulse * 0.5)}
                listening={false}
              />
            )}
            <Circle radius={dotRadius} fill={color} stroke={active ? '#ffffff' : undefined} strokeWidth={active ? 1.5 : 0} />
          </Group>
        )
      })}
    </>
  )
}
