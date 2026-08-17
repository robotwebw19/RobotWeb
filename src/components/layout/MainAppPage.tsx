import { useEffect, useState } from 'react'
import blankTemplate from '../../levels/starterCode/blank.ino.txt?raw'
import { useAuthStore } from '../../state/authStore'
import { useLevelSelectionStore } from '../../state/levelSelectionStore'
import { useSimulationStore } from '../../state/simulationStore'
import { useSimulation } from '../../hooks/useSimulation'
import { useInterpreterConsole } from '../../hooks/useInterpreterConsole'
import { useLevelProgress } from '../../hooks/useLevelProgress'
import { loadSavedCode, saveCode } from '../code/codeStorage'
import { levelRepository } from '../../data'
import { seedLevels } from '../../data/seedLevels'
import type { Level } from '../../types/domain'
import { AppShell } from './AppShell'
import { LeftPanel } from './LeftPanel'
import { CenterPanel } from './CenterPanel'
import { RightPanel } from './RightPanel'

export function MainAppPage() {
  const user = useAuthStore((state) => state.user)
  const studentId = user?.studentId ?? ''
  const sensors = user?.robotConfig.sensors ?? []

  const selectedLevelId = useLevelSelectionStore((state) => state.selectedLevelId)
  const [level, setLevel] = useState<Level>(
    () => seedLevels.find((candidate) => candidate.id === selectedLevelId) ?? seedLevels[0],
  )

  // The seed lookup above only covers built-in levels — resolve the full set (including
  // user-created ones) once the backend responds, and whenever the selected level changes.
  useEffect(() => {
    let cancelled = false
    levelRepository.getById(selectedLevelId).then((loaded) => {
      if (!cancelled) setLevel(loaded ?? seedLevels[0])
    })
    return () => {
      cancelled = true
    }
  }, [selectedLevelId])

  const [sourceCode, setSourceCode] = useState(blankTemplate)

  // Each level has its own saved code slot — (re)load it whenever the selected level changes.
  useEffect(() => {
    if (!studentId) {
      setSourceCode(blankTemplate)
      return
    }
    let cancelled = false
    loadSavedCode(studentId, level.id).then((saved) => {
      if (!cancelled) setSourceCode(saved || blankTemplate)
    })
    return () => {
      cancelled = true
    }
  }, [level.id, studentId])

  const { consoleLines, codeError, loadProgram, clearProgram, checkProgram, stepInterpreterBudgeted } = useInterpreterConsole()

  const { run, pause, reset } = useSimulation({
    trackPath: level.trackPath,
    obstacles: level.obstacles,
    colorZones: level.colorZones,
    sensors,
    startPosition: level.startPosition,
    onBeforePhysicsTick: stepInterpreterBudgeted,
  })

  const { lastOutcome, resetProgress } = useLevelProgress(level, studentId)

  function handleRun() {
    // Resuming from a pause continues in place — only a fresh run (from idle/passed/failed)
    // reloads the code and resets the robot to the start position.
    if (useSimulationStore.getState().simState.status === 'paused') {
      run()
      return
    }
    if (studentId) {
      saveCode(studentId, level.id, sourceCode).catch((error) => console.error('Failed to save code', error))
    }
    resetProgress()
    reset()
    if (loadProgram(sourceCode, sensors)) run()
  }

  function handleCheckCode() {
    checkProgram(sourceCode)
  }

  function handleReset() {
    resetProgress()
    clearProgram()
    reset()
  }

  return (
    <AppShell
      left={<LeftPanel />}
      center={
        <CenterPanel
          trackPath={level.trackPath}
          obstacles={level.obstacles}
          colorZones={level.colorZones}
          finishZone={level.finishZone}
          sensors={sensors}
          resultOutcome={lastOutcome}
          onRun={handleRun}
          onPause={pause}
          onReset={handleReset}
        />
      }
      right={
        <RightPanel
          sourceCode={sourceCode}
          onSourceCodeChange={setSourceCode}
          consoleLines={consoleLines}
          codeError={codeError}
          onCheckCode={handleCheckCode}
        />
      }
    />
  )
}
