import { useEffect, useState } from 'react'
import { levelRepository, levelResultRepository } from '../../data'
import { useAuthStore } from '../../state/authStore'
import { useLevelSelectionStore } from '../../state/levelSelectionStore'
import { useLevelResultsStore } from '../../state/levelResultsStore'
import { useOwnLevelResults } from '../../hooks/useLiveLevelResults'
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

  // This is the student's own list — only their own saves change it, and useLevelProgress
  // already bumps resultsVersion right after a save lands, so no realtime subscription needed.
  useOwnLevelResults(
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
