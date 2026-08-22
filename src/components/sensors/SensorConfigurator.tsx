import { useMemo, useState } from 'react'
import type { MotorConfig, MotorSide, RobotConfig, SensorConfig } from '../../types/domain'
import { sensorCatalog } from '../../robot/sensorCatalog'
import { addSingleSensor, buildIrRow } from '../../robot/sensorFactory'
import { motorCatalog } from '../../robot/motorCatalog'
import { addMotor, removeMotor } from '../../robot/motorFactory'
import { validateRobotConfig } from '../../robot/robotConfigValidation'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { EquipmentCard } from './EquipmentCard'
import { SensorPlacementPreview } from './SensorPlacementPreview'
import styles from './SensorConfigurator.module.css'

interface SensorConfiguratorProps {
  initialConfig: RobotConfig
  onSave: (config: RobotConfig) => void
  saveLabel?: string
}

const CATALOG_LABEL_KEYS: Record<SensorConfig['type'], TranslationKey> = {
  ir: 'catalog.ir.label',
  ultrasonic: 'catalog.ultrasonic.label',
}
const CATALOG_DESCRIPTION_KEYS: Record<SensorConfig['type'], TranslationKey> = {
  ir: 'catalog.ir.description',
  ultrasonic: 'catalog.ultrasonic.description',
}

const MOTOR_LABEL_KEYS: Record<MotorSide, TranslationKey> = {
  left: 'catalog.motor.left.label',
  right: 'catalog.motor.right.label',
}
const MOTOR_DESCRIPTION_KEY: TranslationKey = 'catalog.motor.description'

/** IR always mounts as a fixed left/right pair — matches the two-line-sensor layout every
 * built-in level's requiredEquipment expects (see levels/definitions/equipmentPresets.ts). */
const IR_ROW_COUNT = 2

export function SensorConfigurator({ initialConfig, onSave, saveLabel }: SensorConfiguratorProps) {
  const { t } = useTranslation()
  const [sensors, setSensors] = useState<SensorConfig[]>(initialConfig.sensors)
  const [motors, setMotors] = useState<MotorConfig[]>(initialConfig.motors)

  const nonIrSensors = useMemo(() => sensors.filter((s) => s.type !== 'ir'), [sensors])
  const irMounted = sensors.some((s) => s.type === 'ir')
  const validation = validateRobotConfig(sensors, motors)

  /** Same button mounts the fixed 2-sensor row and unmounts it — matches ultrasonic's
   * single-button toggle in handleToggleSingle below. */
  function handleToggleIrRow() {
    if (irMounted) {
      setSensors(nonIrSensors)
    } else {
      setSensors([...buildIrRow(IR_ROW_COUNT, nonIrSensors), ...nonIrSensors])
    }
  }

  /** Same button mounts and unmounts a single-instance sensor (ultrasonic) — no second control elsewhere. */
  function handleToggleSingle(type: 'ultrasonic') {
    setSensors((prev) => (prev.some((s) => s.type === type) ? prev.filter((s) => s.type !== type) : addSingleSensor(type, prev)))
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
                <EquipmentCard
                  key="ir"
                  label={t(CATALOG_LABEL_KEYS.ir)}
                  description={t(CATALOG_DESCRIPTION_KEYS.ir)}
                  meta={`${entry.weightGrams}g`}
                  mounted={irMounted}
                  onToggle={handleToggleIrRow}
                />
              )
            }

            const sensorType = entry.type
            const mounted = sensors.some((s) => s.type === sensorType)
            return (
              <EquipmentCard
                key={sensorType}
                label={t(CATALOG_LABEL_KEYS[sensorType])}
                description={t(CATALOG_DESCRIPTION_KEYS[sensorType])}
                meta={`${entry.weightGrams}g`}
                mounted={mounted}
                onToggle={() => handleToggleSingle(sensorType)}
              />
            )
          })}

          {motorCatalog.map((entry) => {
            const mounted = motors.some((m) => m.side === entry.side)
            return (
              <EquipmentCard
                key={entry.side}
                label={t(MOTOR_LABEL_KEYS[entry.side])}
                description={t(MOTOR_DESCRIPTION_KEY)}
                meta={`${entry.weightGrams}g · ${entry.in1Pin}/${entry.in2Pin}/${entry.enablePin}`}
                mounted={mounted}
                onToggle={() => handleToggleMotor(entry.side)}
              />
            )
          })}
        </div>

        <div className={styles.side}>
          <SensorPlacementPreview sensors={sensors} motors={motors} />
        </div>
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
