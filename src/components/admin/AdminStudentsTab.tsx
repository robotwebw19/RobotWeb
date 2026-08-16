import { useState } from 'react'
import { userRepository, levelRepository } from '../../data'
import { getStudentStats } from '../leaderboard/leaderboardAggregation'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './AdminStudentsTab.module.css'

export function AdminStudentsTab() {
  const { t } = useTranslation()
  const [students, setStudents] = useState(() => userRepository.getAll())
  const levels = levelRepository.getAll()

  function handleDelete(studentId: string) {
    if (!window.confirm(t('admin.confirmDeleteStudent'))) return
    userRepository.delete(studentId)
    setStudents(userRepository.getAll())
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
          const stats = getStudentStats(student.studentId, levels)
          return (
            <tr key={student.studentId}>
              <td>{student.studentId}</td>
              <td>{student.displayName}</td>
              <td>
                {student.robotConfig.name} ({student.robotConfig.sensors.length})
              </td>
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
