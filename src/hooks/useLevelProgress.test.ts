import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLevelProgress } from './useLevelProgress'
import { useSimulationStore } from '../state/simulationStore'
import { createInitialSimState } from '../sim/engine/SimState'
import { levelResultRepository } from '../data'
import type { Level } from '../types/domain'

const level: Level = {
  id: 'level-a',
  name: 'Level A',
  difficulty: 'beginner',
  trackPath: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 0, y: 0, headingDeg: 0 },
  finishZone: { x: 100, y: 0, radius: 10 },
  timeLimitMs: 10_000,
  parConditions: { threeStarTimeMs: 3000, twoStarTimeMs: 6000, maxOffTrackEventsForThreeStars: 0 },
}

const otherLevel: Level = { ...level, id: 'level-b', name: 'Level B' }

beforeEach(() => {
  localStorage.clear()
  useSimulationStore.setState({ simState: createInitialSimState({ x: 0, y: 0, headingDeg: 0 }), speed: 1 })
})

describe('useLevelProgress', () => {
  it('records exactly one passed result even if the finished state re-renders repeatedly', () => {
    const { result, rerender } = renderHook(() => useLevelProgress(level, '11111'))

    act(() => {
      useSimulationStore.getState().applyPatch({ status: 'running', pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 2000 })
    })
    rerender()
    // A second, unrelated state update while still "passed" must not produce a second result.
    act(() => {
      useSimulationStore.getState().applyPatch({ elapsedMs: 2001 })
    })
    rerender()

    expect(result.current.lastOutcome?.kind).toBe('passed')
    expect(levelResultRepository.getForLevel(level.id)).toHaveLength(1)
  })

  it('resetProgress allows a subsequent run to be recorded again (Run after a finished run)', () => {
    const { result, rerender } = renderHook(() => useLevelProgress(level, '11111'))

    act(() => {
      useSimulationStore.getState().applyPatch({ status: 'running', pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 2000 })
    })
    rerender()
    expect(levelResultRepository.getForLevel(level.id)).toHaveLength(1)

    act(() => {
      result.current.resetProgress()
      useSimulationStore.getState().resetToPose({ x: 0, y: 0, headingDeg: 0 })
      useSimulationStore.getState().applyPatch({ status: 'running' })
      useSimulationStore.getState().applyPatch({ pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 1500 })
    })
    rerender()

    expect(levelResultRepository.getForLevel(level.id)).toHaveLength(2)
  })

  it('clears the last outcome when switching to a different level', () => {
    const { result, rerender } = renderHook(({ activeLevel }) => useLevelProgress(activeLevel, '11111'), {
      initialProps: { activeLevel: level },
    })

    act(() => {
      useSimulationStore.getState().applyPatch({ status: 'running', pose: { x: 100, y: 0, headingDeg: 0 }, elapsedMs: 2000 })
    })
    rerender({ activeLevel: level })
    expect(result.current.lastOutcome).not.toBeNull()

    rerender({ activeLevel: otherLevel })
    expect(result.current.lastOutcome).toBeNull()
  })
})
