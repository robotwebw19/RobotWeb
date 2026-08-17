import { useMemo, useState } from 'react'
import type { MotorConfig, MotorSide, RobotConfig, SensorConfig } from '../../types/domain'
import { IR_COUNT_OPTIONS, sensorCatalog } from '../../robot/sensorCatalog'
import { addSingleSensor, buildIrRow } from '../../robot/sensorFactory'
import { sensorPins } from '../../robot/sensorPins'
import { motorCatalog } from '../../robot/motorCatalog'
import { addMotor, removeMotor } from '../../robot/motorFactory'
import { validateRobotConfig } from '../../robot/robotConfigValidation'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { SensorCatalogCard } from './SensorCatalogCard'
import { SensorPlacementPreview } from './SensorPlacementPreview'
import { PinAssignmentSelect } from './PinAssignmentSelect'
import styles from './SensorConfigurator.module.css'

interface SensorConfiguratorProps {
  initialConfig: RobotConfig
  onSave: (config: RobotConfig) => void
  saveLabel?: string
}

const CATALOG_LABEL_KEYS: Record<SensorConfig['type'], TranslationKey> = {
  ir: 'catalog.ir.label',
  ultrasonic: 'catalog.ultrasonic.label',
  color: 'catalog.color.label',
}

type PinField = 'pin' | 'echoPin' | 's0Pin' | 's1Pin' | 's2Pin' | 's3Pin'

/** Which pin fields a sensor type wires, and the label for each — one entry means the plain,
 * unlabeled select IR/color-as-a-single-pin used to have; more than one shows a label per pin so
 * ultrasonic's Trig/Echo and color's OUT/S0-S3 read unambiguously. */
const PIN_FIELDS_BY_TYPE: Record<SensorConfig['type'], { field: PinField; labelKey: TranslationKey }[]> = {
  ir: [{ field: 'pin', labelKey: 'sensors.pin' }],
  ultrasonic: [
    { field: 'pin', labelKey: 'sensors.trigPin' },
    { field: 'echoPin', labelKey: 'sensors.echoPin' },
  ],
  color: [
    { field: 'pin', labelKey: 'sensors.outPin' },
    { field: 's0Pin', labelKey: 'sensors.s0Pin' },
    { field: 's1Pin', labelKey: 'sensors.s1Pin' },
    { field: 's2Pin', labelKey: 'sensors.s2Pin' },
    { field: 's3Pin', labelKey: 'sensors.s3Pin' },
  ],
}

const MOTOR_LABEL_KEYS: Record<MotorSide, TranslationKey> = {
  left: 'catalog.motor.left.label',
  right: 'catalog.motor.right.label',
}
const MOTOR_DESCRIPTION_KEY: TranslationKey = 'catalog.motor.description'

export function SensorConfigurator({ initialConfig, onSave, saveLabel }: SensorConfiguratorProps) {
  const { t } = useTranslation()
  const [sensors, setSensors] = useState<SensorConfig[]>(initialConfig.sensors)
  const [motors, setMotors] = useState<MotorConfig[]>(initialConfig.motors)
  const [irCount, setIrCount] = useState<number>(sensors.filter((s) => s.type === 'ir').length || 2)

  const nonIrSensors = useMemo(() => sensors.filter((s) => s.type !== 'ir'), [sensors])
  const validation = validateRobotConfig(sensors, motors)
  const usedPins = [...sensors.flatMap(sensorPins), ...motors.flatMap((m) => [m.in1Pin, m.in2Pin, m.enablePin])]

  function applyIrRow() {
    setSensors([...buildIrRow(irCount, nonIrSensors), ...nonIrSensors])
  }

  function handleRemove(id: string) {
    setSensors((prev) => prev.filter((s) => s.id !== id))
  }

  /** Same button mounts and unmounts a single-instance sensor (ultrasonic/color) — no second control elsewhere. */
  function handleToggleSingle(type: 'ultrasonic' | 'color') {
    setSensors((prev) => (prev.some((s) => s.type === type) ? prev.filter((s) => s.type !== type) : addSingleSensor(type, prev)))
  }

  function handleSensorPinChange(id: string, field: PinField, pin: string) {
    setSensors((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: pin } : s)))
  }

  function handleToggleMotor(side: MotorSide) {
    setMotors((prev) => (prev.some((m) => m.side === side) ? removeMotor(side, prev) : addMotor(side, prev)))
  }

  function handleSave() {
    if (!validation.valid) return
    onSave({ sensors, motors })
  }

  return (
    <div className={styles.configurator}>
      <div className={styles.layout}>
        <div className={styles.catalog}>
          {sensorCatalog.map((entry) => {
            if (entry.type === 'ir') {
              return (
                <SensorCatalogCard key={entry.type} entry={entry} wide>
                  <div className={styles.countGroup}>
                    {IR_COUNT_OPTIONS.map((count) => (
                      <button
                        key={count}
                        type="button"
                        className={`${styles.countButton} ${irCount === count ? styles.countButtonActive : ''}`}
                        onClick={() => setIrCount(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  <button type="button" className={styles.applyButton} onClick={applyIrRow}>
                    {t('sensors.applyRow', { count: irCount })}
                  </button>
                </SensorCatalogCard>
              )
            }

            const sensorType = entry.type
            const alreadyMounted = sensors.some((s) => s.type === sensorType)
            return (
              <SensorCatalogCard key={sensorType} entry={entry}>
                <button
                  type="button"
                  className={`${styles.addButton} ${alreadyMounted ? styles.addButtonMounted : ''}`}
                  onClick={() => handleToggleSingle(sensorType)}
                >
                  {alreadyMounted ? t('sensors.remove') : t('sensors.add')}
                </button>
              </SensorCatalogCard>
            )
          })}

          {motorCatalog.map((entry) => {
            const mounted = motors.some((m) => m.side === entry.side)
            const label = t(MOTOR_LABEL_KEYS[entry.side])
            const tooltip = `${label} — ${t(MOTOR_DESCRIPTION_KEY)} (${entry.priceCredits}cr, ${entry.weightGrams}g, ${entry.in1Pin}/${entry.in2Pin}/${entry.enablePin})`
            return (
              <div key={entry.side} className={styles.motorCard} title={tooltip}>
                <strong className={styles.label}>{label}</strong>
                <button
                  type="button"
                  className={`${styles.addButton} ${mounted ? styles.addButtonMounted : ''}`}
                  onClick={() => handleToggleMotor(entry.side)}
                >
                  {mounted ? t('sensors.remove') : t('sensors.add')}
                </button>
              </div>
            )
          })}
        </div>

        <div className={styles.side}>
          <SensorPlacementPreview sensors={sensors} motors={motors} />
        </div>
      </div>

      <div className={styles.mountedList}>
        {sensors.length === 0 && motors.length === 0 && <p>{t('sensors.noneMounted')}</p>}
        {motors.map((motor) => (
          <div key={motor.id} className={styles.mountedRow}>
            <span>{t(MOTOR_LABEL_KEYS[motor.side])}</span>
            <span>{motor.in1Pin}/{motor.in2Pin}/{motor.enablePin}</span>
          </div>
        ))}
        {sensors.map((sensor) => {
          const catalogEntry = sensorCatalog.find((entry) => entry.type === sensor.type)
          if (!catalogEntry) return null
          return (
            <div key={sensor.id} className={styles.mountedRow}>
              <span>{t(CATALOG_LABEL_KEYS[sensor.type])}</span>
              {PIN_FIELDS_BY_TYPE[sensor.type].map(({ field, labelKey }) => (
                <span key={field} className={styles.pinGroup}>
                  {PIN_FIELDS_BY_TYPE[sensor.type].length > 1 && (
                    <span className={styles.pinLabel}>{t(labelKey)}</span>
                  )}
                  <PinAssignmentSelect
                    value={sensor[field] ?? ''}
                    options={catalogEntry.availablePins}
                    usedPins={usedPins}
                    onChange={(pin) => handleSensorPinChange(sensor.id, field, pin)}
                  />
                </span>
              ))}
              {/* Ultrasonic/color remove via the same catalog toggle button above; only IR — a
                  batch row control, not a per-sensor toggle — still needs its own remove here. */}
              {sensor.type === 'ir' && (
                <button type="button" className={styles.removeButton} onClick={() => handleRemove(sensor.id)}>
                  {t('sensors.remove')}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {validation.errors.length > 0 && (
        <ul className={styles.errors}>
          {validation.errors.map((error) => (
            <li key={`${error.key}-${JSON.stringify(error.vars ?? {})}`}>{t(error.key, error.vars)}</li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.saveButton} disabled={!validation.valid} onClick={handleSave}>
        {saveLabel ?? t('sensors.saveRobot')}
      </button>
    </div>
  )
}
