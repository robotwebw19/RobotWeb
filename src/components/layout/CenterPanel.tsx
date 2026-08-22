import { useEffect, useRef, useState } from 'react'
import type { ColorZone, FinishZone, MotorConfig, Obstacle, SensorConfig, Vector2 } from '../../types/domain'
import { useSimulationStore } from '../../state/simulationStore'
import type { LevelOutcome } from '../../sim/engine/LevelRuntime'
import { SimCanvas } from '../canvas/SimCanvas'
import { RobotPinoutPanel } from '../canvas/RobotPinoutPanel'
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
  motors: MotorConfig[]
  resultOutcome: LevelOutcome | null
  onRun: () => void
  onReset: () => void
}

export function CenterPanel({
  trackPath,
  obstacles,
  colorZones,
  finishZone,
  lineInversionBoundaryY,
  sensors,
  motors,
  resultOutcome,
  onRun,
  onReset,
}: CenterPanelProps) {
  const pose = useSimulationStore((state) => state.simState.pose)
  const leftMotorSpeed = useSimulationStore((state) => state.simState.leftMotorSpeed)
  const rightMotorSpeed = useSimulationStore((state) => state.simState.rightMotorSpeed)
  const sensorReadings = useSimulationStore((state) => state.simState.sensorReadings)
  const { t } = useTranslation()

  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [robotHovered, setRobotHovered] = useState(false)

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
        <div className={styles.canvasFrame} style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}>
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
              onRobotHoverChange={setRobotHovered}
            />
          </div>
        </div>
        <LevelResultModal outcome={resultOutcome} onRetry={onReset} />
      </div>
      {robotHovered && <RobotPinoutPanel sensors={sensors} motors={motors} />}
      <RunControls onRun={onRun} onReset={onReset} />
      <SimHud />
      <p className={styles.hint}>{t('center.runHint')}</p>
    </div>
  )
}
