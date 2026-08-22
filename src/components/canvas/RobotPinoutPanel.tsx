import type { MotorConfig, MotorSide, SensorConfig, SensorType } from '../../types/domain'
import { useTranslation, type TFunction } from '../../i18n/useTranslation'
import arduinoUnoImage from '../../assets/arduino-uno.png'
import styles from './RobotPinoutPanel.module.css'

// Pixel coordinates of each pin header hole in arduino-uno.png (565x353 source), measured by
// eye against the board art — see the header housings in the "DIGITAL (PWM~)" and "ANALOG IN"
// rows. Only pins that exist on this real Uno board art are mapped: the sim's wider A0-A7 range
// (see robot/pins.ts) is a deliberate "Uno-like" extension students never actually reach —
// sensorCatalog only ever offers digital pins, and the motor catalog only uses A0/A1 — so
// capping the overlay at the real board's A0-A5 stays accurate to the photo.
const PIN_POSITIONS: Record<string, { x: number; y: number }> = {
  D13: { x: 339, y: 65 },
  D12: { x: 352, y: 65 },
  D11: { x: 366, y: 65 },
  D10: { x: 379, y: 65 },
  D9: { x: 393, y: 65 },
  D8: { x: 406, y: 65 },
  D7: { x: 434, y: 65 },
  D6: { x: 445, y: 65 },
  D5: { x: 456, y: 65 },
  D4: { x: 467, y: 65 },
  D3: { x: 478, y: 65 },
  D2: { x: 489, y: 65 },
  A0: { x: 451, y: 284 },
  A1: { x: 463, y: 284 },
  A2: { x: 475, y: 284 },
  A3: { x: 486, y: 284 },
  A4: { x: 498, y: 284 },
  A5: { x: 510, y: 284 },
}
const IMAGE_WIDTH = 565
const IMAGE_HEIGHT = 353

interface RobotPinoutPanelProps {
  sensors: SensorConfig[]
  motors: MotorConfig[]
}

interface PinUsage {
  pin: string
  label: string
  role: string
  color: string
}

const SENSOR_TYPE_LABEL_KEY: Record<SensorType, Parameters<TFunction>[0]> = {
  ir: 'catalog.ir.label',
  ultrasonic: 'catalog.ultrasonic.label',
}
const MOTOR_LABEL_KEY: Record<MotorSide, Parameters<TFunction>[0]> = {
  left: 'catalog.motor.left.label',
  right: 'catalog.motor.right.label',
}

// One hue per device (sensor instance or motor), spaced by the golden angle so any number of
// devices stays maximally distinct from its neighbors; one lightness step per pin within that
// device so e.g. an ultrasonic sensor's 2 pins (Trig/Echo) read as clearly separate dots and
// legend rows while still visibly belonging to the same device.
function deviceHue(deviceIndex: number): number {
  return (deviceIndex * 137.508) % 360
}
function pinColor(deviceIndex: number, pinIndexInDevice: number): string {
  const lightness = Math.min(76, 44 + pinIndexInDevice * 8)
  return `hsl(${deviceHue(deviceIndex).toFixed(1)}, 68%, ${lightness}%)`
}

/** Every wired pin, with which device owns it and what role it plays — drives both the board
 * dots and the legend below it. Sensors of the same type are numbered (#1, #2, ...) since
 * SensorConfig doesn't carry a left/right label past the first two (e.g. an 8-IR row). */
function buildPinUsage(sensors: SensorConfig[], motors: MotorConfig[], t: TFunction): PinUsage[] {
  const usage: PinUsage[] = []
  const seenOfType = new Map<SensorType, number>()
  let deviceIndex = 0

  for (const sensor of sensors) {
    const seenIndex = (seenOfType.get(sensor.type) ?? 0) + 1
    seenOfType.set(sensor.type, seenIndex)
    const label = `${t(SENSOR_TYPE_LABEL_KEY[sensor.type])} #${seenIndex}`
    let pinIndex = 0

    if (sensor.type === 'ir') {
      usage.push({ pin: sensor.pin, label, role: t('pinout.signal'), color: pinColor(deviceIndex, pinIndex++) })
    } else {
      usage.push({ pin: sensor.pin, label, role: 'Trig', color: pinColor(deviceIndex, pinIndex++) })
      if (sensor.echoPin) usage.push({ pin: sensor.echoPin, label, role: 'Echo', color: pinColor(deviceIndex, pinIndex++) })
    }
    deviceIndex++
  }

  for (const motor of motors) {
    const label = t(MOTOR_LABEL_KEY[motor.side])
    usage.push({ pin: motor.in1Pin, label, role: t('pinout.direction1'), color: pinColor(deviceIndex, 0) })
    usage.push({ pin: motor.in2Pin, label, role: t('pinout.direction2'), color: pinColor(deviceIndex, 1) })
    usage.push({ pin: motor.enablePin, label, role: t('pinout.speed'), color: pinColor(deviceIndex, 2) })
    deviceIndex++
  }

  return usage
}

/** Shown on hover over the robot: the real Arduino Uno board art with the student's
 * currently-equipped sensors and motors highlighted on the pins they're wired to. */
export function RobotPinoutPanel({ sensors, motors }: RobotPinoutPanelProps) {
  const { t } = useTranslation()
  const usage = buildPinUsage(sensors, motors, t)
  const usageByPin = new Map(usage.map((item) => [item.pin, item]))

  const groups: { label: string; entries: PinUsage[] }[] = []
  for (const item of usage) {
    const last = groups[groups.length - 1]
    if (last && last.label === item.label) {
      last.entries.push(item)
    } else {
      groups.push({ label: item.label, entries: [item] })
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.title}>{t('pinout.title')}</p>
      <div className={styles.boardWrap}>
        <img src={arduinoUnoImage} alt="Arduino Uno" className={styles.boardImage} />
        <svg viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`} className={styles.pinOverlay}>
          {Object.entries(PIN_POSITIONS).map(([pin, { x, y }]) => {
            const item = usageByPin.get(pin)
            return (
              <circle key={pin} cx={x} cy={y} r={5} fill={item?.color ?? 'transparent'} stroke={item ? '#ffffff' : 'transparent'} strokeWidth={1.5}>
                <title>{item ? `${pin} — ${item.label} (${item.role})` : pin}</title>
              </circle>
            )
          })}
        </svg>
      </div>
      <div className={styles.legend}>
        {groups.map((group, i) => (
          <div key={i} className={styles.deviceGroup}>
            <p className={styles.deviceLabel}>{group.label}</p>
            <ul className={styles.pinList}>
              {group.entries.map((entry) => (
                <li key={entry.pin}>
                  <span className={styles.swatch} style={{ background: entry.color }} />
                  <span className={styles.pinName}>{entry.pin}</span>
                  <span className={styles.pinRole}>{entry.role}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
