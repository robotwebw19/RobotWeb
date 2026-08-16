import { useSimulationStore } from '../../state/simulationStore'
import type { SimSpeed } from '../../sim/engine/SimulationClock'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './RunControls.module.css'

interface RunControlsProps {
  onRun: () => void
  onPause: () => void
  onReset: () => void
}

const SPEEDS: SimSpeed[] = [0.5, 1, 2, 4]

export function RunControls({ onRun, onPause, onReset }: RunControlsProps) {
  const status = useSimulationStore((state) => state.simState.status)
  const speed = useSimulationStore((state) => state.speed)
  const setSpeed = useSimulationStore((state) => state.setSpeed)
  const { t } = useTranslation()

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.runKey} onClick={onRun} disabled={status === 'running'}>
        {status === 'paused' ? t('run.resume') : t('run.run')}
      </button>
      <button type="button" onClick={onPause} disabled={status !== 'running'}>
        {t('run.pause')}
      </button>
      <button type="button" onClick={onReset}>
        {t('run.reset')}
      </button>
      <select value={speed} onChange={(event) => setSpeed(Number(event.target.value) as SimSpeed)}>
        {SPEEDS.map((speedOption) => (
          <option key={speedOption} value={speedOption}>
            {speedOption}x
          </option>
        ))}
      </select>
    </div>
  )
}
