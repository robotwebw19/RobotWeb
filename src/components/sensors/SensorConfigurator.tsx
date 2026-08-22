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
import { IrModulePanel } from './IrModulePanel'
import { UltrasonicModulePanel } from './UltrasonicModulePanel'
import { MotorModulePanel } from './MotorModulePanel'
import { SensorPlacementPreview } from './SensorPlacementPreview'
import styles from './SensorConfigurator.module.css'

interface SensorConfiguratorProps {
  initialConfig: RobotConfig
  onSave: (config: RobotConfig) => void
  saveLabel?: string
  /** Where the equipment hover panel floats. Defaults to 'center' (the main app's Equipment
   * tab); onboarding's Build-Robot step passes 'right' since the catalog there sits inside one
   * centered card that a dead-center panel would otherwise cover — see SensorModulePanel. */
  hoverPanelPlacement?: 'center' | 'right'
  /** Onboarding's Build-Robot step only: shrinks the robot preview to exactly match the combined
   * height of the 4 catalog buttons and the 2-line warning area below them, instead of the fixed
   * square it renders as in the main app's Equipment tab. See .layoutCompact in the stylesheet. */
  compactPreview?: boolean
  /** The main app's Equipment tab only: the left column is a fixed 280px wide, so the catalog
   * and preview stack vertically (flex-wrap) instead of sitting side by side — a 200px-square
   * preview on top of 4 stacked cards routinely needed more height than the panel had, forcing a
   * scrollbar. Shrinks the preview (and the box around it) to this px size instead. */
  previewSize?: number
  /** The main app's Equipment tab only: puts the warning list after the save button instead of
   * before it, and tightens the vertical rhythm between layout/warnings/button — saves more of
   * that same limited height previewSize is already fighting for. */
  compactFooter?: boolean
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

export function SensorConfigurator({
  initialConfig,
  onSave,
  saveLabel,
  hoverPanelPlacement,
  compactPreview,
  previewSize,
  compactFooter,
}: SensorConfiguratorProps) {
  const { t } = useTranslation()
  const [sensors, setSensors] = useState<SensorConfig[]>(initialConfig.sensors)
  const [motors, setMotors] = useState<MotorConfig[]>(initialConfig.motors)
  const [irCardHovered, setIrCardHovered] = useState(false)
  const [ultrasonicCardHovered, setUltrasonicCardHovered] = useState(false)
  const [motorCardHovered, setMotorCardHovered] = useState(false)

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

  const errorsList = (
    <ul className={`${styles.errors} ${compactPreview ? styles.errorsInLayout : ''}`}>
      {validation.errors.map((error) => (
        <li key={`${error.key}-${JSON.stringify(error.vars ?? {})}`}>{t(error.key, error.vars)}</li>
      ))}
    </ul>
  )

  const saveButton = (
    <button type="button" className={styles.saveButton} disabled={!validation.valid} onClick={handleSave}>
      {saveLabel ?? t('sensors.saveRobot')}
    </button>
  )

  return (
    <div className={`${styles.configurator} ${compactFooter ? styles.configuratorTight : ''}`}>
      <div className={`${styles.layout} ${compactPreview ? styles.layoutCompact : ''}`}>
        <div className={styles.catalog}>
          {sensorCatalog.map((entry) => {
            if (entry.type === 'ir') {
              return (
                <div
                  key="ir"
                  onMouseEnter={() => setIrCardHovered(true)}
                  onMouseLeave={() => setIrCardHovered(false)}
                  onFocus={() => setIrCardHovered(true)}
                  onBlur={() => setIrCardHovered(false)}
                >
                  <EquipmentCard
                    label={t(CATALOG_LABEL_KEYS.ir)}
                    description={t(CATALOG_DESCRIPTION_KEYS.ir)}
                    meta={`${entry.weightGrams}g`}
                    mounted={irMounted}
                    onToggle={handleToggleIrRow}
                    suppressNativeTooltip
                  />
                  {irCardHovered && <IrModulePanel placement={hoverPanelPlacement} />}
                </div>
              )
            }

            const sensorType = entry.type
            const mounted = sensors.some((s) => s.type === sensorType)

            if (sensorType === 'ultrasonic') {
              return (
                <div
                  key={sensorType}
                  onMouseEnter={() => setUltrasonicCardHovered(true)}
                  onMouseLeave={() => setUltrasonicCardHovered(false)}
                  onFocus={() => setUltrasonicCardHovered(true)}
                  onBlur={() => setUltrasonicCardHovered(false)}
                >
                  <EquipmentCard
                    label={t(CATALOG_LABEL_KEYS.ultrasonic)}
                    description={t(CATALOG_DESCRIPTION_KEYS.ultrasonic)}
                    meta={`${entry.weightGrams}g`}
                    mounted={mounted}
                    onToggle={() => handleToggleSingle(sensorType)}
                    suppressNativeTooltip
                  />
                  {ultrasonicCardHovered && <UltrasonicModulePanel placement={hoverPanelPlacement} />}
                </div>
              )
            }

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
              <div
                key={entry.side}
                onMouseEnter={() => setMotorCardHovered(true)}
                onMouseLeave={() => setMotorCardHovered(false)}
                onFocus={() => setMotorCardHovered(true)}
                onBlur={() => setMotorCardHovered(false)}
              >
                <EquipmentCard
                  label={t(MOTOR_LABEL_KEYS[entry.side])}
                  description={t(MOTOR_DESCRIPTION_KEY)}
                  meta={`${entry.weightGrams}g · ${entry.in1Pin}/${entry.in2Pin}/${entry.enablePin}`}
                  mounted={mounted}
                  onToggle={() => handleToggleMotor(entry.side)}
                  suppressNativeTooltip
                />
              </div>
            )
          })}
        </div>

        <div className={styles.side} style={previewSize ? { flexBasis: previewSize, width: previewSize } : undefined}>
          <SensorPlacementPreview sensors={sensors} motors={motors} fillContainer={compactPreview} size={previewSize} />
        </div>

        {motorCardHovered && <MotorModulePanel placement={hoverPanelPlacement} />}

        {/* Grid-placed into the row below the catalog (see .layoutCompact) so .side can span
         * both rows and match their combined height — only in the compact onboarding layout. */}
        {compactPreview && errorsList}
      </div>

      {/* Outside .layout (its default position) when not compact — always mounted (even with
       * zero errors) and height-reserved in CSS — the built-in levels' two independent checks
       * (sensors, both motors) toggle on and off as the student mounts equipment, and letting
       * the list disappear entirely shifted the whole card up/down each time one cleared.
       * compactFooter (main app only) puts the button first and the warnings after it instead. */}
      {!compactPreview && !compactFooter && errorsList}
      {compactFooter && saveButton}
      {!compactPreview && compactFooter && errorsList}
      {!compactFooter && saveButton}
    </div>
  )
}
