import { useEffect, useState } from 'react'
import { levelRepository, levelResultRepository } from '../../data'
import { useAuthStore } from '../../state/authStore'
import { useLevelSelectionStore } from '../../state/levelSelectionStore'
import type { Level, LevelResult } from '../../types/domain'
import { LevelCard } from './LevelCard'
import styles from './LevelList.module.css'

export function LevelList() {
  const studentId = useAuthStore((state) => state.user?.studentId ?? '')
  const selectedLevelId = useLevelSelectionStore((state) => state.selectedLevelId)
  const selectLevel = useLevelSelectionStore((state) => state.selectLevel)
  const [levels, setLevels] = useState<Level[]>([])
  const [bestByLevelId, setBestByLevelId] = useState<Record<string, LevelResult | undefined>>({})

  useEffect(() => {
    levelRepository.getAll().then(setLevels)
  }, [])

  useEffect(() => {
    if (!studentId || levels.length === 0) {
      setBestByLevelId({})
      return
    }
    let cancelled = false
    Promise.all(levels.map((level) => levelResultRepository.getBestForUserLevel(studentId, level.id))).then(
      (results) => {
        if (cancelled) return
        setBestByLevelId(Object.fromEntries(levels.map((level, index) => [level.id, results[index]])))
      },
    )
    return () => {
      cancelled = true
    }
  }, [levels, studentId])

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
