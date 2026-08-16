import { useRef } from 'react'
import { Group, Rect, Arrow } from 'react-konva'
import type { Pose } from '../../sim/engine/RobotPhysics'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'
import { ROBOT_RADIUS_PX, ROBOT_WHEEL_BASE_PX } from '../../utils/constants'

interface RobotSpriteProps {
  pose: Pose
  /** Scaled px/s wheel speeds (see MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT) — drive the tire roll. */
  leftMotorSpeed?: number
  rightMotorSpeed?: number
  viewport?: Viewport
}

const TREAD_COUNT = 4

function Wheel({
  y,
  length,
  thickness,
  rollPx,
}: {
  y: number
  length: number
  thickness: number
  rollPx: number
}) {
  const spacing = length / TREAD_COUNT
  const wrapped = ((rollPx % spacing) + spacing) % spacing
  const treads = Array.from({ length: TREAD_COUNT + 2 }, (_, i) => -length / 2 - spacing + i * spacing - wrapped)

  return (
    <Group
      y={y}
      clipFunc={(ctx) => {
        ctx.rect(-length / 2, -thickness / 2, length, thickness)
      }}
    >
      <Rect x={-length / 2} y={-thickness / 2} width={length} height={thickness} fill="#212529" cornerRadius={thickness / 3} />
      {treads.map((x, i) => (
        <Rect key={i} x={x} y={-thickness / 2} width={Math.max(thickness * 0.32, 1.5)} height={thickness} fill="#495057" />
      ))}
    </Group>
  )
}

export function RobotSprite({ pose, leftMotorSpeed = 0, rightMotorSpeed = 0, viewport = defaultViewport }: RobotSpriteProps) {
  const stagePos = worldToStage({ x: pose.x, y: pose.y }, viewport)
  const size = ROBOT_RADIUS_PX * 1.3 * viewport.scale
  const wheelSpan = ROBOT_WHEEL_BASE_PX * viewport.scale
  const wheelLength = size * 0.55
  const wheelThickness = size * 0.24

  // Accumulate how far each tire has "rolled" using real elapsed time — RobotSprite re-renders
  // every physics tick while running, so the tread pattern scrolls along the tire during a run
  // and simply freezes when paused, rather than the whole wheel spinning like a pinwheel.
  const rollRef = useRef({ left: 0, right: 0, lastTimeMs: null as number | null })
  const now = performance.now()
  const dtSeconds = rollRef.current.lastTimeMs !== null ? (now - rollRef.current.lastTimeMs) / 1000 : 0
  rollRef.current.lastTimeMs = now
  rollRef.current.left += leftMotorSpeed * dtSeconds
  rollRef.current.right += rightMotorSpeed * dtSeconds

  return (
    <Group x={stagePos.x} y={stagePos.y} rotation={pose.headingDeg}>
      <Wheel y={-wheelSpan / 2} length={wheelLength} thickness={wheelThickness} rollPx={rollRef.current.left} />
      <Wheel y={wheelSpan / 2} length={wheelLength} thickness={wheelThickness} rollPx={rollRef.current.right} />
      <Rect x={-size / 2} y={-size / 2} width={size} height={size} fill="#4c6ef5" cornerRadius={6} />
      <Arrow
        points={[0, 0, size * 0.7, 0]}
        stroke="#ffd43b"
        fill="#ffd43b"
        strokeWidth={3}
        pointerLength={8}
        pointerWidth={8}
      />
    </Group>
  )
}
