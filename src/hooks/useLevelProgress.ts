import { useCallback, useEffect, useRef, useState } from 'react'
import type { Level } from '../types/domain'
import { evaluateLevelState, type LevelOutcome } from '../sim/engine/LevelRuntime'
import { useSimulationStore } from '../state/simulationStore'
import { useLevelResultsStore } from '../state/levelResultsStore'
import { levelResultRepository } from '../data'

/**
 * Reactively evaluates the current sim state against the active level's pass/fail/star rules
 * and records the outcome. This is the ONLY code path that calls
 * levelResultRepository.save() — see ILevelResultRepository's anti-cheat note — so a result can
 * only be produced by an actual completed simulation run.
 *
 * `resetProgress` must be called explicitly whenever a new run starts (Run/Reset), rather than
 * relying on watching simState.status pass through 'idle': React can batch a reset()-then-run()
 * pair into a single commit, so this effect may never observe that intermediate 'idle' state.
 */
export function useLevelProgress(level: Level, studentId: string) {
  const simState = useSimulationStore((state) => state.simState)
  const setStatus = useSimulationStore((state) => state.setStatus)
  const bumpResultsVersion = useLevelResultsStore((state) => state.bumpResultsVersion)
  const completedRef = useRef(false)
  const [lastOutcome, setLastOutcome] = useState<LevelOutcome | null>(null)

  const resetProgress = useCallback(() => {
    completedRef.current = false
    setLastOutcome(null)
  }, [])

  // Switching to a different level should always drop any stale result-modal state, even if the
  // player never pressed Run/Reset on the previous level.
  useEffect(() => {
    resetProgress()
  }, [level.id, resetProgress])

  useEffect(() => {
    if (simState.status !== 'running' || completedRef.current || !studentId) return

    const outcome = evaluateLevelState(simState, level)
    if (outcome.kind === 'none') return

    completedRef.current = true
    setLastOutcome(outcome)
    const submittedAt = new Date().toISOString()

    if (outcome.kind === 'passed') {
      setStatus('passed')
      levelResultRepository
        .save({
          studentId,
          levelId: level.id,
          completionTimeMs: outcome.completionTimeMs,
          stars: outcome.stars,
          passed: true,
          submittedAt,
        })
        .then(bumpResultsVersion)
        .catch((error) => console.error('Failed to save level result', error))
    } else {
      setStatus('failed')
      levelResultRepository
        .save({
          studentId,
          levelId: level.id,
          completionTimeMs: simState.elapsedMs,
          stars: 0,
          passed: false,
          submittedAt,
        })
        .catch((error) => console.error('Failed to save level result', error))
    }
  }, [simState, level, studentId, setStatus, bumpResultsVersion])

  return { lastOutcome, resetProgress }
}
