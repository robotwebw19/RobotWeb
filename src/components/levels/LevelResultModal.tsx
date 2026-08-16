import type { LevelOutcome } from '../../sim/engine/LevelRuntime'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { SevenSegmentDisplay } from '../common/SevenSegmentDisplay'
import { StarPips } from '../common/StarPips'
import styles from './LevelResultModal.module.css'

interface LevelResultModalProps {
  outcome: LevelOutcome | null
  onRetry: () => void
}

const FAIL_REASON_KEYS: Record<'off-track' | 'collision' | 'timeout', TranslationKey> = {
  'off-track': 'result.reason.off-track',
  collision: 'result.reason.collision',
  timeout: 'result.reason.timeout',
}

export function LevelResultModal({ outcome, onRetry }: LevelResultModalProps) {
  const { t } = useTranslation()
  if (!outcome || outcome.kind === 'none') return null

  const passed = outcome.kind === 'passed'
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={`${styles.title} ${passed ? styles.passed : styles.failed}`}>
          {passed ? t('result.complete') : t('result.failed')}
        </h2>
        {passed ? (
          <>
            <StarPips lit={outcome.stars} size={14} className={styles.pips} />
            <div className={styles.time}>
              <span className={styles.timeLabel}>{t('result.timeLabel')}</span>
              <SevenSegmentDisplay
                value={(outcome.completionTimeMs / 1000).toFixed(1).padStart(4, '0')}
                size={26}
                className={styles.timeSegmentGreen}
              />
            </div>
          </>
        ) : (
          <p className={styles.reason}>{t(FAIL_REASON_KEYS[outcome.reason])}</p>
        )}
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          {t('result.tryAgain')}
        </button>
      </div>
    </div>
  )
}
