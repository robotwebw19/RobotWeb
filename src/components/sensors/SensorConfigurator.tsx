import { useMemo, useState } from 'react'
import type { IrMode, MotorConfig, MotorSide, RobotConfig, SensorConfig } from '../../types/domain'
import { IR_COUNT_OPTIONS, sensorCatalog } from '../../robot/sensorCatalog'
import { addSingleSensor, buildIrRow } from '../../robot/sensorFactory'
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
  const [irMode, setIrMode] = useState<IrMode>(sensors.find((s) => s.type === 'ir')?.irMode ?? 'digital')

  const nonIrSensors = useMemo(() => sensors.filter((s) => s.type !== 'ir'), [sensors])
  const validation = validateRobotConfig(sensors, motors)
  const usedPins = [...sensors.map((s) => s.pin), ...motors.map((m) => m.pin)]

  function applyIrRow() {
    setSensors([...buildIrRow(irCount, irMode, nonIrSensors), ...nonIrSensors])
  }

  function handleRemove(id: string) {
    setSensors((prev) => prev.filter((s) => s.id !== id))
  }

  /** Same button mounts and unmounts a single-instance sensor (ultrasonic/color) — no second control elsewhere. */
  function handleToggleSingle(type: 'ultrasonic' | 'color') {
    setSensors((prev) => (prev.some((s) => s.type === type) ? prev.filter((s) => s.type !== type) : addSingleSensor(type, prev)))
  }

  function handlePinChange(id: string, pin: string) {
    setSensors((prev) => prev.map((s) => (s.id === id ? { ...s, pin } : s)))
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
                  <select
                    className={styles.field}
                    value={irMode}
                    onChange={(event) => setIrMode(event.target.value as IrMode)}
                    aria-label={t('sensors.irModeLabel')}
                  >
                    <option value="digital">{t('sensors.digitalMode')}</option>
                    <option value="analog">{t('sensors.analogMode')}</option>
                  </select>
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
            const tooltip = `${label} — ${t(MOTOR_DESCRIPTION_KEY)} (${entry.priceCredits}cr, ${entry.weightGrams}g, ${entry.pin})`
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
            <span>{motor.pin}</span>
          </div>
        ))}
        {sensors.map((sensor) => {
          const catalogEntry = sensorCatalog.find((entry) => entry.type === sensor.type)
          if (!catalogEntry) return null
          return (
            <div key={sensor.id} className={styles.mountedRow}>
              <span>{t(CATALOG_LABEL_KEYS[sensor.type])}</span>
              <PinAssignmentSelect
                value={sensor.pin}
                options={catalogEntry.availablePins}
                usedPins={usedPins}
                onChange={(pin) => handlePinChange(sensor.id, pin)}
              />
              {sensor.type === 'ir' && <span>{sensor.irMode}</span>}
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
