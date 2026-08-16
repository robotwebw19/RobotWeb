import { levelRepository, levelResultRepository } from '../../data'
import { useAuthStore } from '../../state/authStore'
import { useLevelSelectionStore } from '../../state/levelSelectionStore'
import { LevelCard } from './LevelCard'
import styles from './LevelList.module.css'

export function LevelList() {
  const studentId = useAuthStore((state) => state.user?.studentId ?? '')
  const selectedLevelId = useLevelSelectionStore((state) => state.selectedLevelId)
  const selectLevel = useLevelSelectionStore((state) => state.selectLevel)
  const levels = levelRepository.getAll()

  return (
    <div className={styles.list}>
      {levels.map((level) => (
        <LevelCard
          key={level.id}
          level={level}
          selected={level.id === selectedLevelId}
          best={studentId ? levelResultRepository.getBestForUserLevel(studentId, level.id) : undefined}
          onSelect={() => selectLevel(level.id)}
        />
      ))}
    </div>
  )
}
