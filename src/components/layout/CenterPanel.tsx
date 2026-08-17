import { useEffect, useRef, useState } from 'react'
import type { ColorZone, FinishZone, Obstacle, SensorConfig, Vector2 } from '../../types/domain'
import { useSimulationStore } from '../../state/simulationStore'
import type { LevelOutcome } from '../../sim/engine/LevelRuntime'
import { SimCanvas } from '../canvas/SimCanvas'
import { RunControls } from '../code/RunControls'
import { SimHud } from '../hud/SimHud'
import { LevelResultModal } from '../levels/LevelResultModal'
import { useTranslation } from '../../i18n/useTranslation'
import { EDITOR_CANVAS_HEIGHT_PX, EDITOR_CANVAS_WIDTH_PX } from '../../utils/constants'
import styles from './CenterPanel.module.css'

const CANVAS_WIDTH = EDITOR_CANVAS_WIDTH_PX
const CANVAS_HEIGHT = EDITOR_CANVAS_HEIGHT_PX

interface CenterPanelProps {
  trackPath: Vector2[][]
  obstacles: Obstacle[]
  colorZones: ColorZone[]
  finishZone: FinishZone
  lineInversionBoundaryY?: number
  sensors: SensorConfig[]
  resultOutcome: LevelOutcome | null
  onRun: () => void
  onPause: () => void
  onReset: () => void
}

export function CenterPanel({
  trackPath,
  obstacles,
  colorZones,
  finishZone,
  lineInversionBoundaryY,
  sensors,
  resultOutcome,
  onRun,
  onPause,
  onReset,
}: CenterPanelProps) {
  const pose = useSimulationStore((state) => state.simState.pose)
  const leftMotorSpeed = useSimulationStore((state) => state.simState.leftMotorSpeed)
  const rightMotorSpeed = useSimulationStore((state) => state.simState.rightMotorSpeed)
  const sensorReadings = useSimulationStore((state) => state.simState.sensorReadings)
  const { t } = useTranslation()

  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // The level canvas is drawn at a fixed logical resolution (CANVAS_WIDTH x CANVAS_HEIGHT);
  // scaling it visually to whatever room canvasWrap actually has keeps it fully on screen
  // instead of relying on overflow:auto scrollbars.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.panel}>
      <div className={styles.canvasWrap} ref={wrapRef}>
        <div
          className={styles.canvasScaled}
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})` }}
        >
          <SimCanvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            trackPath={trackPath}
            obstacles={obstacles}
            colorZones={colorZones}
            finishZone={finishZone}
            lineInversionBoundaryY={lineInversionBoundaryY}
            sensors={sensors}
            pose={pose}
            leftMotorSpeed={leftMotorSpeed}
            rightMotorSpeed={rightMotorSpeed}
            sensorReadings={sensorReadings}
          />
        </div>
        <LevelResultModal outcome={resultOutcome} onRetry={onReset} />
      </div>
      <RunControls onRun={onRun} onPause={onPause} onReset={onReset} />
      <SimHud />
      <p className={styles.hint}>{t('center.runHint')}</p>
    </div>
  )
}
