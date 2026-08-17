import { useSimulationStore } from '../../state/simulationStore'
import type { SimStatus } from '../../sim/engine/SimState'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { SegmentDisplay } from '../common/SegmentDisplay'
import styles from './SimHud.module.css'

const STATUS_KEYS: Record<SimStatus, TranslationKey> = {
  idle: 'status.idle',
  running: 'status.running',
  paused: 'status.paused',
  passed: 'status.passed',
  failed: 'status.failed',
}

/** Fixed-width "SS.ss" so the digit count — and the readout's width — never jumps mid-run. */
function formatReadout(ms: number): string {
  return (ms / 1000).toFixed(2).padStart(5, '0')
}

export function SimHud() {
  const simState = useSimulationStore((state) => state.simState)
  const { t } = useTranslation()

  return (
    <div className={styles.hud}>
      <div className={styles.statusRow}>
        {simState.status === 'running' && <span className={styles.liveDot} aria-hidden="true" />}
        <span className={styles.label}>{t('hud.status')}</span>
        <span
          className={
            simState.status === 'passed' ? styles.statusPassed : simState.status === 'failed' ? styles.statusFailed : undefined
          }
        >
          {t(STATUS_KEYS[simState.status])}
        </span>
      </div>
      <div className={styles.readout}>
        <span className={styles.label}>{t('hud.elapsed')}</span>
        <SegmentDisplay value={formatReadout(simState.elapsedMs)} size={18} />
      </div>
      <div className={styles.readout}>
        <span className={styles.label}>{t('hud.offTrack')}</span>
        <SegmentDisplay
          value={formatReadout(simState.offTrackMs)}
          size={18}
          className={simState.offTrackMs > 0 ? styles.offTrackLit : undefined}
        />
      </div>
      <div className={styles.motors}>{t('hud.motors', { left: simState.leftMotorSpeed.toFixed(0), right: simState.rightMotorSpeed.toFixed(0) })}</div>
      {simState.collided && <div className={styles.warning}>{t('hud.collision')}</div>}
    </div>
  )
}
