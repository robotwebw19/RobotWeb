import { useRef } from 'react'
import { Group, Rect, Circle, Line } from 'react-konva'
import type Konva from 'konva'
import type { Pose } from '../../sim/engine/RobotPhysics'
import { worldToStage, defaultViewport, type Viewport } from './gridUtils'
import { ROBOT_RADIUS_PX, ROBOT_WHEEL_BASE_PX, MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT } from '../../utils/constants'

/** Max signed px/s a motor can command — analogWrite tops out at 255 PWM. Used to normalize a
 * motor's current speed back into a 0..1 magnitude for the L298N direction-LED brightness. */
const MAX_MOTOR_SPEED_PX_PER_SEC = 255 * MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT

interface RobotSpriteProps {
  pose: Pose
  /** Scaled px/s wheel speeds (see MOTOR_SPEED_SCALE_PX_PER_SEC_PER_UNIT) — drive the tire roll. */
  leftMotorSpeed?: number
  rightMotorSpeed?: number
  viewport?: Viewport
  /** Drives the RobotPinoutPanel hover card — see CenterPanel.tsx. */
  onHoverChange?: (hovering: boolean) => void
}

const TREAD_COUNT = 7

/**
 * Rubber tire viewed from directly above: a darker tread band down the center (the part actually
 * touching the ground) inset from two lighter sidewall margins top/bottom, with a groove line
 * separating them — real tires read as two-toned like this, not a single flat block of color.
 */
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
  const sidewallMargin = thickness * 0.16
  const bandHeight = thickness - sidewallMargin * 2
  const treadWidth = Math.max(thickness * 0.24, 1.3)

  return (
    <Group
      y={y}
      clipFunc={(ctx) => {
        ctx.rect(-length / 2, -thickness / 2, length, thickness)
      }}
    >
      {/* Sidewall rubber, full tire footprint */}
      <Rect x={-length / 2} y={-thickness / 2} width={length} height={thickness} fill="#2b2f33" cornerRadius={thickness / 3} />
      {/* Tread band — the darker contact patch, inset from the sidewalls */}
      <Rect x={-length / 2} y={-bandHeight / 2} width={length} height={bandHeight} fill="#16181b" />
      {/* Groove lines separating tread band from sidewall */}
      <Rect x={-length / 2} y={-bandHeight / 2 - thickness * 0.03} width={length} height={thickness * 0.03} fill="rgba(0,0,0,0.5)" />
      <Rect x={-length / 2} y={bandHeight / 2} width={length} height={thickness * 0.03} fill="rgba(0,0,0,0.5)" />
      {treads.map((x, i) => (
        <Rect
          key={i}
          x={x}
          y={-bandHeight / 2}
          width={treadWidth}
          height={bandHeight}
          cornerRadius={treadWidth * 0.3}
          fill="#5a6165"
        />
      ))}
      {/* Rim-light wash, same white/black-overlay trick as the body below — no new hue. */}
      <Rect
        x={-length / 2}
        y={-thickness / 2}
        width={length}
        height={thickness}
        cornerRadius={thickness / 3}
        fillLinearGradientStartPoint={{ x: 0, y: -thickness / 2 }}
        fillLinearGradientEndPoint={{ x: 0, y: thickness / 2 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.25)', 0.5, 'rgba(255,255,255,0)', 1, 'rgba(0,0,0,0.3)']}
        listening={false}
      />
    </Group>
  )
}

/**
 * Etched-in chassis detail over the flat #4c6ef5 body — a recessed panel groove, corner screws,
 * a power LED, PCB-style circuit traces, and vent slots — so the body itself reads as an
 * electronics enclosure instead of a plain blue square. Stays on the established palette (the
 * grays/green already used for screws/LEDs elsewhere in this file) plus white/black washes, same
 * "no new hue" rule the body's own lit-from-top-left gradient follows. Drawn before the L298N
 * board and sensor mount frame, so those occlude the center strip and this only shows through in
 * the front hood and corners — exactly where a real chassis would have panel lines and vents.
 */
function BodyDetails({ size }: { size: number }) {
  const half = size / 2

  return (
    <Group listening={false}>
      {/* Recessed panel groove — a picture-frame inset bezel */}
      <Rect
        x={-half + size * 0.07}
        y={-half + size * 0.07}
        width={size * 0.86}
        height={size * 0.86}
        cornerRadius={4}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={size * 0.012}
      />
      <Rect
        x={-half + size * 0.08}
        y={-half + size * 0.08}
        width={size * 0.84}
        height={size * 0.84}
        cornerRadius={4}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={size * 0.008}
      />
      {/* Corner screws */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sy) => (
          <Circle
            key={`${sx}-${sy}`}
            x={sx * (half - size * 0.09)}
            y={sy * (half - size * 0.09)}
            radius={size * 0.022}
            fill="#b8bfc6"
            stroke="#5c6268"
            strokeWidth={size * 0.006}
          />
        )),
      )}
      {/* PCB-style circuit traces etched into the front hood, ahead of the L298N board */}
      <Line
        points={[size * 0.18, -size * 0.28, size * 0.34, -size * 0.28, size * 0.34, -size * 0.1]}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={size * 0.012}
        lineCap="round"
        lineJoin="round"
      />
      <Line
        points={[size * 0.18, size * 0.05, size * 0.3, size * 0.05, size * 0.3, size * 0.28, size * 0.4, size * 0.28]}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={size * 0.012}
        lineCap="round"
        lineJoin="round"
      />
      {/* Power LED, always lit — the board is on */}
      <Circle
        x={size * 0.36}
        y={-size * 0.34}
        radius={size * 0.028}
        fill="#2f9e44"
        shadowColor="#2f9e44"
        shadowBlur={size * 0.06}
        shadowOpacity={0.7}
      />
      {/* Vent slots, rear corner */}
      {[-0.06, 0, 0.06].map((frac) => (
        <Rect
          key={frac}
          x={-half + size * 0.1}
          y={size * (0.24 + frac) - size * 0.01}
          width={size * 0.14}
          height={size * 0.02}
          cornerRadius={size * 0.01}
          fill="rgba(0,0,0,0.3)"
        />
      ))}
    </Group>
  )
}

/**
 * Stylized L298N dual-motor-driver board (red PCB + black IC/heatsink + screw terminals) mounted
 * on the chassis, instead of leaving motor control invisible — a real robot has exactly one of
 * these driving both wheels. Terminal LEDs on each side light up green/red for that motor's
 * current direction (from computeMotorSpeeds' signed speed) and brighten with PWM magnitude, so
 * a student's digitalWrite/analogWrite calls read as a visible effect on real hardware.
 */
function L298NModule({ size, leftSpeed, rightSpeed }: { size: number; leftSpeed: number; rightSpeed: number }) {
  const boardWidth = size * 0.34 // local x — forward/back
  const boardDepth = size * 0.68 // local y — spans toward both wheels
  const heatsinkSize = boardWidth * 0.5
  const terminalSize = boardWidth * 0.32
  const ledRadius = size * 0.035

  function DirectionLed({ y, speed }: { y: number; speed: number }) {
    const magnitude = Math.min(1, Math.abs(speed) / MAX_MOTOR_SPEED_PX_PER_SEC)
    const color = speed > 0.5 ? '#2f9e44' : speed < -0.5 ? '#e03131' : '#495057'
    return (
      <Circle
        x={boardWidth * 0.44}
        y={y}
        radius={ledRadius}
        fill={color}
        shadowColor={color}
        shadowBlur={magnitude > 0.05 ? ledRadius * (2 + magnitude * 2) : 0}
        shadowOpacity={magnitude > 0.05 ? 0.5 + magnitude * 0.5 : 0}
        listening={false}
      />
    )
  }

  return (
    <Group x={-size * 0.06} y={0}>
      {/* PCB */}
      <Rect
        x={-boardWidth / 2}
        y={-boardDepth / 2}
        width={boardWidth}
        height={boardDepth}
        cornerRadius={1.5}
        fill="#b02218"
        stroke="#5e100c"
        strokeWidth={1}
      />
      <Rect
        x={-boardWidth / 2}
        y={-boardDepth / 2}
        width={boardWidth}
        height={boardDepth}
        cornerRadius={1.5}
        fillLinearGradientStartPoint={{ x: -boardWidth / 2, y: -boardDepth / 2 }}
        fillLinearGradientEndPoint={{ x: boardWidth / 2, y: boardDepth / 2 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.3)', 0.55, 'rgba(255,255,255,0)', 1, 'rgba(0,0,0,0.3)']}
        listening={false}
      />
      {/* IC + heatsink block, centered */}
      <Rect x={-heatsinkSize / 2} y={-heatsinkSize / 2} width={heatsinkSize} height={heatsinkSize} fill="#111318" cornerRadius={0.6} />
      {[-0.28, 0, 0.28].map((frac) => (
        <Rect
          key={frac}
          x={-heatsinkSize * 0.38}
          y={heatsinkSize * frac - heatsinkSize * 0.06}
          width={heatsinkSize * 0.76}
          height={heatsinkSize * 0.12}
          fill="#c1c9d1"
        />
      ))}
      {/* Screw terminal blocks, one toward each wheel, each with a direction LED beside it */}
      {[-1, 1].map((side) => (
        <Rect
          key={side}
          x={-terminalSize / 2}
          y={side * (boardDepth / 2 - terminalSize * 0.7) - terminalSize / 2}
          width={terminalSize}
          height={terminalSize}
          cornerRadius={0.5}
          fill="#1c4e33"
          stroke="#0d2c1c"
          strokeWidth={0.6}
        />
      ))}
      <DirectionLed y={-(boardDepth / 2 - terminalSize * 0.7)} speed={leftSpeed} />
      <DirectionLed y={boardDepth / 2 - terminalSize * 0.7} speed={rightSpeed} />
    </Group>
  )
}

/**
 * T-shaped sensor mount: a stem bolted to the front edge of the chassis, ending in a crossbar
 * spanning left-right — the real bracket a line-following robot bolts its IR row / ultrasonic
 * onto, replacing the old bare heading arrow. sensorFactory.ts mounts IR/ultrasonic sensors ahead
 * of the body (x=40/45 world px, beyond the body's own edge at size/2) exactly on a bar like this
 * one, so SensorOverlay's modules read as bolted to it rather than floating in front of the robot.
 * Still doubles as the heading cue, same as the arrow did — it only ever points forward.
 */
function SensorMountFrame({ size }: { size: number }) {
  const stemThickness = size * 0.08
  const stemLength = size * 0.32
  const crossbarLength = size * 0.88
  const crossbarThickness = size * 0.08
  const stemStartX = size / 2
  const crossbarX = stemStartX + stemLength

  function ScrewHole({ x, y }: { x: number; y: number }) {
    return (
      <Circle x={x} y={y} radius={stemThickness * 0.28} fill="#b8bfc6" stroke="#5c6268" strokeWidth={stemThickness * 0.08} />
    )
  }

  return (
    <Group>
      <Rect
        x={stemStartX}
        y={-stemThickness / 2}
        width={stemLength}
        height={stemThickness}
        cornerRadius={stemThickness * 0.2}
        fill="#2b2f33"
        stroke="#15181b"
        strokeWidth={stemThickness * 0.12}
      />
      <Rect
        x={crossbarX - crossbarThickness / 2}
        y={-crossbarLength / 2}
        width={crossbarThickness}
        height={crossbarLength}
        cornerRadius={crossbarThickness * 0.2}
        fill="#2b2f33"
        stroke="#15181b"
        strokeWidth={crossbarThickness * 0.12}
      />
      {/* Rim-light wash, same white/black-overlay trick as the body/wheels — no new hue. */}
      <Rect
        x={crossbarX - crossbarThickness / 2}
        y={-crossbarLength / 2}
        width={crossbarThickness}
        height={crossbarLength}
        cornerRadius={crossbarThickness * 0.2}
        fillLinearGradientStartPoint={{ x: crossbarX - crossbarThickness / 2, y: 0 }}
        fillLinearGradientEndPoint={{ x: crossbarX + crossbarThickness / 2, y: 0 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.3)', 0.5, 'rgba(255,255,255,0)', 1, 'rgba(0,0,0,0.3)']}
        listening={false}
      />
      <ScrewHole x={stemStartX} y={0} />
      <ScrewHole x={crossbarX} y={-crossbarLength / 2 + crossbarThickness * 0.6} />
      <ScrewHole x={crossbarX} y={0} />
      <ScrewHole x={crossbarX} y={crossbarLength / 2 - crossbarThickness * 0.6} />
    </Group>
  )
}

export function RobotSprite({
  pose,
  leftMotorSpeed = 0,
  rightMotorSpeed = 0,
  viewport = defaultViewport,
  onHoverChange,
}: RobotSpriteProps) {
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

  function setCursor(e: Konva.KonvaEventObject<MouseEvent>, cursor: string) {
    const container = e.target.getStage()?.container()
    if (container) container.style.cursor = cursor
  }

  return (
    <Group
      x={stagePos.x}
      y={stagePos.y}
      rotation={pose.headingDeg}
      onMouseEnter={(e) => {
        setCursor(e, 'pointer')
        onHoverChange?.(true)
      }}
      onMouseLeave={(e) => {
        setCursor(e, 'default')
        onHoverChange?.(false)
      }}
    >
      <Wheel y={-wheelSpan / 2} length={wheelLength} thickness={wheelThickness} rollPx={rollRef.current.left} />
      <Wheel y={wheelSpan / 2} length={wheelLength} thickness={wheelThickness} rollPx={rollRef.current.right} />
      {/* Ground contact shadow (Konva's native shadow, no offset so it stays put as the body rotates). */}
      <Rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        cornerRadius={6}
        fill="#4c6ef5"
        shadowColor="#000000"
        shadowBlur={size * 0.35}
        shadowOpacity={0.5}
        shadowOffsetX={0}
        shadowOffsetY={0}
      />
      {/* Light-from-top-left wash over the same flat #4c6ef5 (DESIGN.md robot-body token) —
          white/black overlay, not a second body color, for a lit/dimensional look. */}
      <Rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        cornerRadius={6}
        fillLinearGradientStartPoint={{ x: -size / 2, y: -size / 2 }}
        fillLinearGradientEndPoint={{ x: size / 2, y: size / 2 }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.4)', 0.55, 'rgba(255,255,255,0)', 1, 'rgba(0,0,0,0.25)']}
        listening={false}
      />
      <BodyDetails size={size} />
      <L298NModule size={size} leftSpeed={leftMotorSpeed} rightSpeed={rightMotorSpeed} />
      <SensorMountFrame size={size} />
    </Group>
  )
}
