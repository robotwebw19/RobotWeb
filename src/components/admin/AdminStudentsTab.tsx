import { useEffect, useState } from 'react'
import { userRepository, levelRepository } from '../../data'
import { useLiveLevelResults } from '../../hooks/useLiveLevelResults'
import { getStudentStats, type StudentStats } from '../leaderboard/leaderboardAggregation'
import { useTranslation } from '../../i18n/useTranslation'
import type { Level, User } from '../../types/domain'
import styles from './AdminStudentsTab.module.css'

const EMPTY_STATS: StudentStats = { totalStars: 0, levelsPassed: 0, perLevel: [] }

export function AdminStudentsTab() {
  const { t } = useTranslation()
  const [students, setStudents] = useState<User[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [statsByStudentId, setStatsByStudentId] = useState<Record<string, StudentStats>>({})

  useEffect(() => {
    userRepository.getAll().then(setStudents)
    levelRepository.getAll().then(setLevels)
  }, [])

  useLiveLevelResults(
    () =>
      Promise.all(students.map((student) => getStudentStats(student.studentId, levels))).then((allStats) =>
        Object.fromEntries(students.map((student, index) => [student.studentId, allStats[index]])),
      ),
    setStatsByStudentId,
    students.length > 0 && levels.length > 0,
    [students, levels],
  )

  async function handleDelete(studentId: string) {
    if (!window.confirm(t('admin.confirmDeleteStudent'))) return
    await userRepository.delete(studentId)
    setStudents(await userRepository.getAll())
  }

  if (students.length === 0) {
    return <p className={styles.empty}>{t('admin.noStudents')}</p>
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>{t('admin.studentId')}</th>
          <th>{t('admin.displayName')}</th>
          <th>{t('admin.robot')}</th>
          <th>{t('profile.levelsPassed')}</th>
          <th>{t('profile.totalStars')}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {students.map((student) => {
          const stats = statsByStudentId[student.studentId] ?? EMPTY_STATS
          return (
            <tr key={student.studentId}>
              <td>{student.studentId}</td>
              <td>{student.displayName}</td>
              <td>{student.robotConfig.sensors.length}</td>
              <td>{stats.levelsPassed}</td>
              <td>{stats.totalStars}</td>
              <td>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDelete(student.studentId)}
                >
                  {t('admin.deleteStudent')}
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
