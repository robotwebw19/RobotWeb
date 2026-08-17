import { useEffect, useState } from 'react'
import { levelRepository, levelResultRepository } from '../../data'
import { useAuthStore } from '../../state/authStore'
import { useLevelSelectionStore } from '../../state/levelSelectionStore'
import { useLevelResultsStore } from '../../state/levelResultsStore'
import { useLiveLevelResults } from '../../hooks/useLiveLevelResults'
import type { Level, LevelResult } from '../../types/domain'
import { bestPassedPerLevel } from '../leaderboard/leaderboardAggregation'
import { LevelCard } from './LevelCard'
import styles from './LevelList.module.css'

export function LevelList() {
  const studentId = useAuthStore((state) => state.user?.studentId ?? '')
  const selectedLevelId = useLevelSelectionStore((state) => state.selectedLevelId)
  const selectLevel = useLevelSelectionStore((state) => state.selectLevel)
  const resultsVersion = useLevelResultsStore((state) => state.resultsVersion)
  const [levels, setLevels] = useState<Level[]>([])
  const [bestByLevelId, setBestByLevelId] = useState<Record<string, LevelResult | undefined>>({})

  useEffect(() => {
    levelRepository.getAll().then(setLevels)
  }, [])

  const hasLevels = levels.length > 0
  useEffect(() => {
    if (!studentId || !hasLevels) setBestByLevelId({})
  }, [studentId, hasLevels])

  // Realtime: passing (or re-passing) a level anywhere refreshes each level card's best
  // time/stars live, so the board updates on its own right after a run completes.
  useLiveLevelResults(
    () =>
      levelResultRepository.getForUser(studentId).then((results) => {
        const bestByLevel = bestPassedPerLevel(results)
        return Object.fromEntries(levels.map((level) => [level.id, bestByLevel.get(level.id)]))
      }),
    setBestByLevelId,
    Boolean(studentId) && hasLevels,
    [levels, studentId, resultsVersion],
  )

  return (
    <div className={styles.list}>
      {levels.map((level) => (
        <LevelCard
          key={level.id}
          level={level}
          selected={level.id === selectedLevelId}
          best={bestByLevelId[level.id]}
          onSelect={() => selectLevel(level.id)}
        />
      ))}
    </div>
  )
}
