import type { MotorConfig, SensorConfig } from '../../types/domain'
import { useTranslation } from '../../i18n/useTranslation'
import { ROBOT_RADIUS_PX, ROBOT_WHEEL_BASE_PX } from '../../utils/constants'
import styles from './SensorPlacementPreview.module.css'

interface SensorPlacementPreviewProps {
  sensors: SensorConfig[]
  motors: MotorConfig[]
  /** Renders at 100% of the parent box (still square, letterboxed via preserveAspectRatio)
   * instead of the fixed SIZE×SIZE square — for SensorConfigurator's compactPreview layout,
   * where the parent's height is set by CSS grid row-spanning rather than this component's own
   * intrinsic size. */
  fillContainer?: boolean
  /** Rendered width/height in px, square. Defaults to 200 (SIZE). The drawing itself always
   * uses a fixed 200x200 viewBox — this only scales the SVG's own box via preserveAspectRatio,
   * same mechanism as an <img>'s width/height, so the robot drawing stays crisp at any size.
   * Ignored when fillContainer is set. */
  size?: number
}

const SIZE = 200
const CENTER = SIZE / 2

// Mirrors RobotSprite's body/frame/tread look AND its coordinate convention (canvas/RobotSprite.tsx,
// sim/engine/RobotPhysics.ts: heading 0 points along +x, +y is screen-down/the robot's right) so the
// configurator preview lines up with the same robot the student drives on a level. RobotSprite draws
// wheels at a fixed body-relative slot (x=0, y=±ROBOT_WHEEL_BASE_PX/2) regardless of motor.position —
// that field is a physics mount point, not the sprite's wheel position — so this preview does too.
// Every other body-relative size below is scaled by PREVIEW_SCALE, same ratio SimCanvas uses at
// its default (1x) viewport — including sensor.position — so a mounted sensor lands in the same
// spot relative to the body/frame here as it does on the actual robot in a running level.
const BODY_SIZE = 64
const PREVIEW_SCALE = BODY_SIZE / (ROBOT_RADIUS_PX * 1.3)
const WHEEL_SPAN = ROBOT_WHEEL_BASE_PX * PREVIEW_SCALE
const WHEEL_LENGTH = BODY_SIZE * 0.55
const WHEEL_THICKNESS = BODY_SIZE * 0.24
const TREAD_COUNT = 7

/**
 * Stylized reflectance-module body (TCRT5000-style breakout: PCB + emitter/receiver lens pair +
 * status LED), mirroring canvas/SensorOverlay.tsx's IrModule so the configurator preview and the
 * live sim show the same real-looking hardware rather than a bare dot. Lens pair runs along local
 * y (perpendicular to the robot's +x heading) since that's how these modules straddle the line.
 */
function IrModule({ cx, cy }: { cx: number; cy: number }) {
  const pcbThick = 11
  const pcbLen = 18
  const lensRadius = 3.2
  const lensOffset = pcbLen * 0.27
  const ledRadius = 1.4

  return (
    <g>
      <rect
        x={cx - pcbThick / 2}
        y={cy - pcbLen / 2}
        width={pcbThick}
        height={pcbLen}
        rx={1.6}
        fill="#0f6b3a"
        stroke="#083f22"
        strokeWidth={0.8}
      />
      <rect x={cx - pcbThick / 2} y={cy - pcbLen / 2} width={pcbThick} height={pcbLen} rx={1.6} fill="url(#bodyLight)" />
      <circle cx={cx} cy={cy - lensOffset} r={lensRadius} fill="#4a5a8a" stroke="#1c2340" strokeWidth={0.7} />
      <circle cx={cx} cy={cy - lensOffset} r={lensRadius * 0.45} fill="rgba(255,255,255,0.5)" />
      <circle cx={cx} cy={cy + lensOffset} r={lensRadius} fill="#151515" stroke="#000000" strokeWidth={0.7} />
      <circle cx={cx} cy={cy + lensOffset} r={lensRadius * 0.4} fill="rgba(255,255,255,0.15)" />
      <circle cx={cx + pcbThick / 2 - ledRadius * 1.2} cy={cy} r={ledRadius} fill="#5a1414" />
    </g>
  )
}

/**
 * Stylized ultrasonic-module body (HC-SR04-style breakout: PCB + twin transducer cups), mirroring
 * canvas/SensorOverlay.tsx's UltrasonicModule. Rotated by mountAngleDeg (the beam heading
 * SensorSampling.ts actually casts along, relative to the robot's +x heading this preview always
 * draws facing) so the cups visually point the way the sensor measures.
 */
function UltrasonicModule({ cx, cy, mountAngleDeg = 0 }: { cx: number; cy: number; mountAngleDeg?: number }) {
  const pcbWidth = 18 // spans the two cups side by side, perpendicular to the beam
  const pcbDepth = 11 // forward/back, along the beam direction
  const cupRadius = 4.6
  const cupOffset = pcbWidth * 0.28

  return (
    <g transform={`rotate(${mountAngleDeg} ${cx} ${cy})`}>
      <rect
        x={cx - pcbDepth / 2}
        y={cy - pcbWidth / 2}
        width={pcbDepth}
        height={pcbWidth}
        rx={1.6}
        fill="#1c1f26"
        stroke="#0a0c10"
        strokeWidth={0.8}
      />
      <rect x={cx - pcbDepth / 2} y={cy - pcbWidth / 2} width={pcbDepth} height={pcbWidth} rx={1.6} fill="url(#bodyLight)" />
      {[cy - cupOffset, cy + cupOffset].map((cupCy) => (
        <g key={cupCy}>
          <circle cx={cx} cy={cupCy} r={cupRadius} fill="#8a939b" stroke="#4a5157" strokeWidth={0.7} />
          <circle cx={cx} cy={cupCy} r={cupRadius * 0.72} fill="#5f676d" stroke="#3a4046" strokeWidth={0.5} />
          <circle cx={cx} cy={cupCy} r={cupRadius * 0.4} fill="#2b3236" />
          <circle cx={cx} cy={cupCy} r={cupRadius * 0.18} fill="rgba(255,255,255,0.4)" />
        </g>
      ))}
      <circle cx={cx - pcbDepth / 2 + 2} cy={cy} r={1.4} fill="#153238" />
    </g>
  )
}

/**
 * Etched-in chassis detail over the flat #4c6ef5 body, mirroring canvas/RobotSprite.tsx's
 * BodyDetails: a recessed panel groove, corner screws, a power LED, PCB-style circuit traces, and
 * vent slots, so the body reads as an electronics enclosure rather than a plain blue square.
 * Stays on the established palette (grays/green already used for screws/LEDs) plus white/black
 * washes — same "no new hue" rule the body's own lit-from-top-left gradient follows.
 */
function BodyDetails({ cx, cy }: { cx: number; cy: number }) {
  const half = BODY_SIZE / 2
  const b = BODY_SIZE

  return (
    <g>
      <rect
        x={cx - half + b * 0.07}
        y={cy - half + b * 0.07}
        width={b * 0.86}
        height={b * 0.86}
        rx={4}
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={b * 0.012}
      />
      <rect
        x={cx - half + b * 0.08}
        y={cy - half + b * 0.08}
        width={b * 0.84}
        height={b * 0.84}
        rx={4}
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={b * 0.008}
      />
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sy) => (
          <circle
            key={`${sx}-${sy}`}
            cx={cx + sx * (half - b * 0.09)}
            cy={cy + sy * (half - b * 0.09)}
            r={b * 0.022}
            fill="#b8bfc6"
            stroke="#5c6268"
            strokeWidth={b * 0.006}
          />
        )),
      )}
      <polyline
        points={`${cx + b * 0.18},${cy - b * 0.28} ${cx + b * 0.34},${cy - b * 0.28} ${cx + b * 0.34},${cy - b * 0.1}`}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={b * 0.012}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`${cx + b * 0.18},${cy + b * 0.05} ${cx + b * 0.3},${cy + b * 0.05} ${cx + b * 0.3},${cy + b * 0.28} ${cx + b * 0.4},${cy + b * 0.28}`}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={b * 0.012}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={cx + b * 0.36} cy={cy - b * 0.34} r={b * 0.028} fill="#2f9e44" />
      {[-0.06, 0, 0.06].map((frac) => (
        <rect
          key={frac}
          x={cx - half + b * 0.1}
          y={cy + b * (0.24 + frac) - b * 0.01}
          width={b * 0.14}
          height={b * 0.02}
          rx={b * 0.01}
          fill="rgba(0,0,0,0.3)"
        />
      ))}
    </g>
  )
}

/**
 * Stylized L298N dual-motor-driver board (red PCB + black IC/heatsink + screw terminals),
 * mirroring canvas/RobotSprite.tsx's L298NModule. Static here (no live motor speeds in a
 * placement preview) — terminal LEDs sit dim/off, same idle look the live sim shows at rest.
 */
function L298NModule({ cx, cy }: { cx: number; cy: number }) {
  const boardWidth = BODY_SIZE * 0.34
  const boardDepth = BODY_SIZE * 0.68
  const heatsinkSize = boardWidth * 0.5
  const terminalSize = boardWidth * 0.32
  const ledRadius = BODY_SIZE * 0.035

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect
        x={-boardWidth / 2}
        y={-boardDepth / 2}
        width={boardWidth}
        height={boardDepth}
        rx={1.5}
        fill="#b02218"
        stroke="#5e100c"
        strokeWidth={1}
      />
      <rect x={-boardWidth / 2} y={-boardDepth / 2} width={boardWidth} height={boardDepth} rx={1.5} fill="url(#bodyLight)" />
      <rect x={-heatsinkSize / 2} y={-heatsinkSize / 2} width={heatsinkSize} height={heatsinkSize} fill="#111318" rx={0.6} />
      {[-0.28, 0, 0.28].map((frac) => (
        <rect
          key={frac}
          x={-heatsinkSize * 0.38}
          y={heatsinkSize * frac - heatsinkSize * 0.06}
          width={heatsinkSize * 0.76}
          height={heatsinkSize * 0.12}
          fill="#c1c9d1"
        />
      ))}
      {[-1, 1].map((side) => (
        <g key={side}>
          <rect
            x={-terminalSize / 2}
            y={side * (boardDepth / 2 - terminalSize * 0.7) - terminalSize / 2}
            width={terminalSize}
            height={terminalSize}
            rx={0.5}
            fill="#1c4e33"
            stroke="#0d2c1c"
            strokeWidth={0.6}
          />
          <circle cx={boardWidth * 0.44} cy={side * (boardDepth / 2 - terminalSize * 0.7)} r={ledRadius} fill="#495057" />
        </g>
      ))}
    </g>
  )
}

/**
 * T-shaped sensor mount, mirroring canvas/RobotSprite.tsx's SensorMountFrame: a stem bolted to
 * the chassis front edge ending in a crossbar spanning left-right, the bracket a line-following
 * robot's IR row / ultrasonic actually bolt onto (sensorFactory.ts mounts them at x=40/45, ahead
 * of the body edge at BODY_SIZE/2). Replaces the old bare heading arrow — still points forward.
 */
function SensorMountFrame({ cx, cy }: { cx: number; cy: number }) {
  const stemThickness = BODY_SIZE * 0.08
  const stemLength = BODY_SIZE * 0.32
  const crossbarLength = BODY_SIZE * 0.88
  const crossbarThickness = BODY_SIZE * 0.08
  const stemStartX = cx + BODY_SIZE / 2
  const crossbarX = stemStartX + stemLength

  function ScrewHole({ x, y }: { x: number; y: number }) {
    return <circle cx={x} cy={y} r={stemThickness * 0.28} fill="#b8bfc6" stroke="#5c6268" strokeWidth={stemThickness * 0.08} />
  }

  return (
    <g>
      <rect
        x={stemStartX}
        y={cy - stemThickness / 2}
        width={stemLength}
        height={stemThickness}
        rx={stemThickness * 0.2}
        fill="#2b2f33"
        stroke="#15181b"
        strokeWidth={stemThickness * 0.12}
      />
      <rect
        x={crossbarX - crossbarThickness / 2}
        y={cy - crossbarLength / 2}
        width={crossbarThickness}
        height={crossbarLength}
        rx={crossbarThickness * 0.2}
        fill="#2b2f33"
        stroke="#15181b"
        strokeWidth={crossbarThickness * 0.12}
      />
      <rect
        x={crossbarX - crossbarThickness / 2}
        y={cy - crossbarLength / 2}
        width={crossbarThickness}
        height={crossbarLength}
        rx={crossbarThickness * 0.2}
        fill="url(#bodyLight)"
      />
      <ScrewHole x={stemStartX} y={cy} />
      <ScrewHole x={crossbarX} y={cy - crossbarLength / 2 + crossbarThickness * 0.6} />
      <ScrewHole x={crossbarX} y={cy} />
      <ScrewHole x={crossbarX} y={cy + crossbarLength / 2 - crossbarThickness * 0.6} />
    </g>
  )
}

/** Mirrors canvas/RobotSprite.tsx's Wheel: a two-toned tire (darker tread band inset from
 * lighter sidewalls, groove lines between) instead of one flat block of color. */
function Wheel({ cx, cy }: { cx: number; cy: number }) {
  const spacing = WHEEL_LENGTH / TREAD_COUNT
  const treadWidth = Math.max(WHEEL_THICKNESS * 0.24, 1.3)
  const sidewallMargin = WHEEL_THICKNESS * 0.16
  const bandHeight = WHEEL_THICKNESS - sidewallMargin * 2
  return (
    <g>
      {/* Sidewall rubber, full tire footprint */}
      <rect
        x={cx - WHEEL_LENGTH / 2}
        y={cy - WHEEL_THICKNESS / 2}
        width={WHEEL_LENGTH}
        height={WHEEL_THICKNESS}
        rx={WHEEL_THICKNESS / 3}
        fill="#2b2f33"
      />
      {/* Tread band — the darker contact patch, inset from the sidewalls */}
      <rect x={cx - WHEEL_LENGTH / 2} y={cy - bandHeight / 2} width={WHEEL_LENGTH} height={bandHeight} fill="#16181b" />
      <rect
        x={cx - WHEEL_LENGTH / 2}
        y={cy - bandHeight / 2 - WHEEL_THICKNESS * 0.03}
        width={WHEEL_LENGTH}
        height={WHEEL_THICKNESS * 0.03}
        fill="rgba(0,0,0,0.5)"
      />
      <rect
        x={cx - WHEEL_LENGTH / 2}
        y={cy + bandHeight / 2}
        width={WHEEL_LENGTH}
        height={WHEEL_THICKNESS * 0.03}
        fill="rgba(0,0,0,0.5)"
      />
      {Array.from({ length: TREAD_COUNT }, (_, i) => cx - WHEEL_LENGTH / 2 + spacing / 2 + i * spacing).map((tx, i) => (
        <rect
          key={i}
          x={tx - treadWidth / 2}
          y={cy - bandHeight / 2}
          width={treadWidth}
          height={bandHeight}
          rx={treadWidth * 0.3}
          fill="#5a6165"
        />
      ))}
      <rect
        x={cx - WHEEL_LENGTH / 2}
        y={cy - WHEEL_THICKNESS / 2}
        width={WHEEL_LENGTH}
        height={WHEEL_THICKNESS}
        rx={WHEEL_THICKNESS / 3}
        fill="url(#wheelLight)"
      />
    </g>
  )
}

export function SensorPlacementPreview({ sensors, motors, fillContainer, size = SIZE }: SensorPlacementPreviewProps) {
  const { t } = useTranslation()
  return (
    <svg
      width={fillContainer ? '100%' : size}
      height={fillContainer ? '100%' : size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      preserveAspectRatio="xMidYMid meet"
      className={styles.preview}
      role="img"
      aria-label={t('sensors.placementPreview')}
    >
      <defs>
        {/* Ground contact shadow — pure black fading to transparent, not a new palette hue. */}
        <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </radialGradient>
        {/* Overlaid on the body's flat #4c6ef5 fill (unchanged from RobotSprite/DESIGN.md's
            robot-body token) — a white/black wash, not a second body color, to read as a light
            source from the top-left without introducing a new hue. */}
        <linearGradient id="bodyLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.22} />
        </linearGradient>
        {/* Same wash, vertical, over the wheels' flat tread colors. */}
        <linearGradient id="wheelLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
          <stop offset="50%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <ellipse cx={CENTER} cy={CENTER} rx={BODY_SIZE * 0.78} ry={WHEEL_SPAN / 2 + 10} fill="url(#groundShadow)" />
      {motors.map((motor) => (
        <Wheel key={motor.id} cx={CENTER} cy={CENTER + (motor.side === 'left' ? -1 : 1) * (WHEEL_SPAN / 2)} />
      ))}
      <rect
        x={CENTER - BODY_SIZE / 2}
        y={CENTER - BODY_SIZE / 2}
        width={BODY_SIZE}
        height={BODY_SIZE}
        rx={6}
        fill="#4c6ef5"
      />
      <rect
        x={CENTER - BODY_SIZE / 2}
        y={CENTER - BODY_SIZE / 2}
        width={BODY_SIZE}
        height={BODY_SIZE}
        rx={6}
        fill="url(#bodyLight)"
      />
      <BodyDetails cx={CENTER} cy={CENTER} />
      {motors.length > 0 && <L298NModule cx={CENTER - BODY_SIZE * 0.06} cy={CENTER} />}
      <SensorMountFrame cx={CENTER} cy={CENTER} />
      {sensors.map((sensor) =>
        sensor.type === 'ir' ? (
          <IrModule
            key={sensor.id}
            cx={CENTER + sensor.position.x * PREVIEW_SCALE}
            cy={CENTER + sensor.position.y * PREVIEW_SCALE}
          />
        ) : (
          <UltrasonicModule
            key={sensor.id}
            cx={CENTER + sensor.position.x * PREVIEW_SCALE}
            cy={CENTER + sensor.position.y * PREVIEW_SCALE}
            mountAngleDeg={sensor.mountAngleDeg}
          />
        ),
      )}
    </svg>
  )
}
