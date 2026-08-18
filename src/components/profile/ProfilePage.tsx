import { useState } from 'react'
import { useAuthStore } from '../../state/authStore'
import { levelRepository } from '../../data'
import { useLiveLevelResults } from '../../hooks/useLiveLevelResults'
import { getStudentStats, type StudentStats } from '../leaderboard/leaderboardAggregation'
import { Navbar } from '../layout/Navbar'
import { useTranslation } from '../../i18n/useTranslation'
import { SegmentDisplay } from '../common/SegmentDisplay'
import { StarPips } from '../common/StarPips'
import styles from './ProfilePage.module.css'

const EMPTY_STATS: StudentStats = { totalStars: 0, levelsPassed: 0, perLevel: [] }

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const { t, tLevelName } = useTranslation()
  const [stats, setStats] = useState<StudentStats>(EMPTY_STATS)

  useLiveLevelResults(
    () => levelRepository.getAll().then((levels) => getStudentStats(user!.studentId, levels)),
    setStats,
    Boolean(user),
    [user],
  )

  if (!user) return null

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>{user.displayName}</h1>
          <p>{t('profile.gradeAndNumber', { grade: user.grade, number: user.studentNumber })}</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <SegmentDisplay value={String(stats.levelsPassed).padStart(2, '0')} size={24} />
            <div className={styles.statLabel}>{t('profile.levelsPassed')}</div>
          </div>
          <div className={styles.stat}>
            <SegmentDisplay value={String(stats.totalStars).padStart(2, '0')} size={24} />
            <div className={styles.statLabel}>{t('profile.totalStars')}</div>
          </div>
        </div>

        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('profile.level')}</th>
                <th>{t('profile.bestTime')}</th>
                <th>{t('leaderboard.stars')}</th>
              </tr>
            </thead>
            <tbody>
              {stats.perLevel.map(({ level, best }) => (
                <tr key={level.id}>
                  <td>{tLevelName(level.id, level.name)}</td>
                  <td>
                    {best ? <SegmentDisplay value={(best.completionTimeMs / 1000).toFixed(2).padStart(5, '0')} size={13} /> : '—'}
                  </td>
                  <td>{best ? <StarPips lit={best.stars} /> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
