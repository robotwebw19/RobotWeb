import type { LevelOutcome } from '../../sim/engine/LevelRuntime'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { SegmentDisplay } from '../common/SegmentDisplay'
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
              <SegmentDisplay
                value={(outcome.completionTimeMs / 1000).toFixed(2).padStart(5, '0')}
                size={26}
                className={styles.timeSegmentGreen}
                animateChanges
              />
            </div>
          </>
        ) : (
          <p className={styles.reason}>{t(FAIL_REASON_KEYS[outcome.reason])}</p>
        )}
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          {passed ? t('result.done') : t('result.tryAgain')}
        </button>
      </div>
    </div>
  )
}
