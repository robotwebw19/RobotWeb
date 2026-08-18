import { useEffect, useState } from 'react'
import { levelRepository } from '../../data'
import { sensorPins } from '../../robot/sensorPins'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import type { Level, LevelDifficulty, MotorSide, RequiredEquipmentItem, SensorType } from '../../types/domain'
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
/** Same map as LevelCard.tsx's own local copy — see DESIGN.md Components > Cards > Level card. */
const DIFFICULTY_KEYS: Record<LevelDifficulty, TranslationKey> = {
  beginner: 'difficulty.beginner',
  easy: 'difficulty.easy',
  medium: 'difficulty.medium',
  hard: 'difficulty.hard',
  expert: 'difficulty.expert',
}

function equipmentLabel(item: RequiredEquipmentItem, t: (key: TranslationKey) => string): string {
  if (item.kind === 'motor') return `${t(MOTOR_LABEL_KEYS[item.side])} (${item.in1Pin}/${item.in2Pin}/${item.enablePin})`
  return `${t(SENSOR_LABEL_KEYS[item.type])} (${sensorPins(item).join(', ')})`
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}

/** A read-only, VS Code-flavored solution viewer: a tab strip (filename + copy) over a line-numbered pane. */
function SolutionCodeViewer({ fileName, code, t }: { fileName: string; code: string; t: (key: TranslationKey) => string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.editor}>
      <div className={styles.editorTabBar}>
        <span className={styles.editorTab}>{fileName}</span>
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopy}
          aria-label={t('admin.copyCode')}
          title={t('admin.copyCode')}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <div className={styles.editorBody}>
        <pre className={styles.editorPre}>
          {code.split('\n').map((line, index) => (
            <div key={index} className={styles.codeLine}>
              <span className={styles.lineNumber}>{index + 1}</span>
              <span className={styles.lineContent}>{line.length > 0 ? line : ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
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
            <span className={styles.levelButtonTop}>
              <span>{tLevelName(level.id, level.name)}</span>
              <span className={styles.difficultyTag}>{t(DIFFICULTY_KEYS[level.difficulty])}</span>
            </span>
            <span className={styles.badge}>{level.createdBy ? t('admin.userCreated') : t('admin.builtIn')}</span>
          </button>
        ))}
      </div>
      <div className={styles.detail}>
        {selected && (
          <>
            {selected.createdBy && (
              <div className={styles.detailHeader}>
                <button type="button" className={styles.deleteButton} onClick={() => handleDelete(selected.id)}>
                  {t('admin.deleteLevel')}
                </button>
              </div>
            )}

            <div className={styles.bodyRow}>
              <div className={styles.equipmentColumn}>
                <h4 className={styles.sectionTitle}>{t('admin.requiredEquipment')}</h4>
                {selected.requiredEquipment && selected.requiredEquipment.length > 0 ? (
                  <ul className={styles.equipmentList}>
                    {selected.requiredEquipment.map((item, index) => (
                      <li key={index}>{equipmentLabel(item, t)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>{t('admin.noEquipment')}</p>
                )}
              </div>

              <div className={styles.codeColumn}>
                <h4 className={styles.sectionTitle}>{t('admin.solutionCode')}</h4>
                {selected.solutionCode ? (
                  <SolutionCodeViewer key={selected.id} fileName={`${selected.id}.ino`} code={selected.solutionCode} t={t} />
                ) : (
                  <p className={styles.empty}>{t('admin.noSolution')}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
