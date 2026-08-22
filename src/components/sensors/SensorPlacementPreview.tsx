import type { MotorConfig, SensorConfig, SensorType } from '../../types/domain'
import { useTranslation } from '../../i18n/useTranslation'
import { ROBOT_RADIUS_PX, ROBOT_WHEEL_BASE_PX } from '../../utils/constants'
import styles from './SensorPlacementPreview.module.css'

interface SensorPlacementPreviewProps {
  sensors: SensorConfig[]
  motors: MotorConfig[]
}

const COLOR_BY_TYPE: Record<SensorType, string> = {
  ir: '#e64980',
  ultrasonic: '#15aabf',
}

const SIZE = 200
const CENTER = SIZE / 2
const SCALE = 2

// Mirrors RobotSprite's body/arrow/tread look AND its coordinate convention (canvas/RobotSprite.tsx,
// sim/engine/RobotPhysics.ts: heading 0 points along +x, +y is screen-down/the robot's right) so the
// configurator preview lines up with the same robot the student drives on a level. RobotSprite draws
// wheels at a fixed body-relative slot (x=0, y=±ROBOT_WHEEL_BASE_PX/2) regardless of motor.position —
// that field is a physics mount point, not the sprite's wheel position — so this preview does too.
const BODY_SIZE = 64
const PREVIEW_SCALE = BODY_SIZE / (ROBOT_RADIUS_PX * 1.3)
const ARROW_LENGTH = BODY_SIZE * 0.7
const WHEEL_SPAN = ROBOT_WHEEL_BASE_PX * PREVIEW_SCALE
const WHEEL_LENGTH = BODY_SIZE * 0.55
const WHEEL_THICKNESS = BODY_SIZE * 0.24
const TREAD_COUNT = 4

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  const spacing = WHEEL_LENGTH / TREAD_COUNT
  const treadWidth = Math.max(WHEEL_THICKNESS * 0.32, 1.5)
  return (
    <g>
      <rect
        x={cx - WHEEL_LENGTH / 2}
        y={cy - WHEEL_THICKNESS / 2}
        width={WHEEL_LENGTH}
        height={WHEEL_THICKNESS}
        rx={WHEEL_THICKNESS / 3}
        fill="#212529"
      />
      {Array.from({ length: TREAD_COUNT }, (_, i) => cx - WHEEL_LENGTH / 2 + spacing / 2 + i * spacing).map((tx, i) => (
        <rect
          key={i}
          x={tx - treadWidth / 2}
          y={cy - WHEEL_THICKNESS / 2}
          width={treadWidth}
          height={WHEEL_THICKNESS}
          fill="#495057"
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

export function SensorPlacementPreview({ sensors, motors }: SensorPlacementPreviewProps) {
  const { t } = useTranslation()
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
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
      <line
        x1={CENTER}
        y1={CENTER}
        x2={CENTER + ARROW_LENGTH - 8}
        y2={CENTER}
        stroke="#ffd43b"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <polygon
        points={`${CENTER + ARROW_LENGTH},${CENTER} ${CENTER + ARROW_LENGTH - 8},${CENTER - 4} ${CENTER + ARROW_LENGTH - 8},${CENTER + 4}`}
        fill="#ffd43b"
      />
      {sensors.map((sensor) => (
        <circle
          key={sensor.id}
          cx={CENTER + sensor.position.x * SCALE}
          cy={CENTER + sensor.position.y * SCALE}
          r={5}
          fill={COLOR_BY_TYPE[sensor.type]}
        />
      ))}
    </svg>
  )
}
