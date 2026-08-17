import type { Level, LevelDifficulty, LevelResult } from '../../types/domain'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { useTilt } from '../../hooks/useTilt'
import { SegmentDisplay } from '../common/SegmentDisplay'
import { StarPips } from '../common/StarPips'
import styles from './LevelCard.module.css'

interface LevelCardProps {
  level: Level
  selected: boolean
  best?: LevelResult
  onSelect: () => void
}

const DIFFICULTY_KEYS: Record<LevelDifficulty, TranslationKey> = {
  beginner: 'difficulty.beginner',
  easy: 'difficulty.easy',
  medium: 'difficulty.medium',
  hard: 'difficulty.hard',
  expert: 'difficulty.expert',
}

export function LevelCard({ level, selected, best, onSelect }: LevelCardProps) {
  const { t, tLevelName } = useTranslation()
  const tiltRef = useTilt<HTMLButtonElement>()

  return (
    <button
      ref={tiltRef}
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      {best && <span className={styles.passedRibbon}>{t('level.passed')}</span>}
      <div className={styles.header}>
        <span className={styles.name}>{tLevelName(level.id, level.name)}</span>
        {!best && <span className={styles.difficulty}>{t(DIFFICULTY_KEYS[level.difficulty])}</span>}
      </div>
      <div className={styles.best}>
        {best ? (
          <>
            <StarPips lit={best.stars} size={6} />
            <SegmentDisplay value={(best.completionTimeMs / 1000).toFixed(2).padStart(5, '0')} size={12} />
          </>
        ) : (
          <span className={styles.notCompleted}>{t('level.notCompleted')}</span>
        )}
      </div>
    </button>
  )
}
