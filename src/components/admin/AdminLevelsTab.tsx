import { useEffect, useState } from 'react'
import { levelRepository } from '../../data'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import type { Level, MotorSide, RequiredEquipmentItem, SensorType } from '../../types/domain'
import styles from './AdminLevelsTab.module.css'

const SENSOR_LABEL_KEYS: Record<SensorType, TranslationKey> = {
  ir: 'catalog.ir.label',
  ultrasonic: 'catalog.ultrasonic.label',
  color: 'catalog.color.label',
}
const MOTOR_LABEL_KEYS: Record<MotorSide, TranslationKey> = {
  left: 'catalog.motor.left.label',
  right: 'catalog.motor.right.label',
}

function equipmentLabel(item: RequiredEquipmentItem, t: (key: TranslationKey) => string): string {
  if (item.kind === 'motor') return `${t(MOTOR_LABEL_KEYS[item.side])} (${item.pin})`
  const mode = item.irMode ? ` — ${t(item.irMode === 'analog' ? 'sensors.analogMode' : 'sensors.digitalMode')}` : ''
  return `${t(SENSOR_LABEL_KEYS[item.type])} (${item.pin})${mode}`
}

export function AdminLevelsTab() {
  const { t, tLevelName } = useTranslation()
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedId, setSelectedId] = useState('')
  const selected = levels.find((level) => level.id === selectedId)

  useEffect(() => {
    levelRepository.getAll().then((loaded) => {
      setLevels(loaded)
      setSelectedId((current) => current || (loaded[0]?.id ?? ''))
    })
  }, [])

  async function handleDelete(id: string) {
    if (!window.confirm(t('admin.confirmDeleteLevel'))) return
    await levelRepository.deleteUserLevel(id)
    const refreshed = await levelRepository.getAll()
    setLevels(refreshed)
    setSelectedId((current) => (current === id ? (refreshed[0]?.id ?? '') : current))
  }

  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`${styles.levelButton} ${level.id === selectedId ? styles.levelButtonActive : ''}`}
            onClick={() => setSelectedId(level.id)}
          >
            <span>{tLevelName(level.id, level.name)}</span>
            <span className={styles.badge}>{level.createdBy ? t('admin.userCreated') : t('admin.builtIn')}</span>
          </button>
        ))}
      </div>
      <div className={styles.detail}>
        {selected && (
          <>
            <div className={styles.detailHeader}>
              <h3>{tLevelName(selected.id, selected.name)}</h3>
              {selected.createdBy && (
                <button type="button" className={styles.deleteButton} onClick={() => handleDelete(selected.id)}>
                  {t('admin.deleteLevel')}
                </button>
              )}
            </div>

            <h4>{t('admin.requiredEquipment')}</h4>
            {selected.requiredEquipment && selected.requiredEquipment.length > 0 ? (
              <ul className={styles.equipmentList}>
                {selected.requiredEquipment.map((item, index) => (
                  <li key={index}>{equipmentLabel(item, t)}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>{t('admin.noEquipment')}</p>
            )}

            <h4>{t('admin.solutionCode')}</h4>
            <pre className={styles.code}>{selected.solutionCode ?? t('admin.noSolution')}</pre>
          </>
        )}
      </div>
    </div>
  )
}
