import type { MotorConfig, SensorConfig, SensorType } from '../../types/domain'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './SensorPlacementPreview.module.css'

interface SensorPlacementPreviewProps {
  sensors: SensorConfig[]
  motors: MotorConfig[]
}

const COLOR_BY_TYPE: Record<SensorType, string> = {
  ir: '#e64980',
  ultrasonic: '#15aabf',
  color: '#f08c00',
}
const MOTOR_COLOR = '#495057'

const SIZE = 200
const CENTER = SIZE / 2
const SCALE = 2

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
      <rect x={CENTER - 30} y={CENTER - 40} width={60} height={80} rx={8} fill="#4c6ef5" />
      <polygon
        points={`${CENTER},${CENTER - 50} ${CENTER - 8},${CENTER - 38} ${CENTER + 8},${CENTER - 38}`}
        fill="#ffd43b"
      />
      {motors.map((motor) => (
        <rect
          key={motor.id}
          x={CENTER + motor.position.y * SCALE - 6}
          y={CENTER - motor.position.x * SCALE - 4}
          width={12}
          height={8}
          rx={2}
          fill={MOTOR_COLOR}
        />
      ))}
      {sensors.map((sensor) => (
        <circle
          key={sensor.id}
          cx={CENTER + sensor.position.y * SCALE}
          cy={CENTER - sensor.position.x * SCALE}
          r={5}
          fill={COLOR_BY_TYPE[sensor.type]}
        />
      ))}
    </svg>
  )
}
