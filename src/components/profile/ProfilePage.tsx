import { useAuthStore } from '../../state/authStore'
import { levelRepository } from '../../data'
import { getStudentStats } from '../leaderboard/leaderboardAggregation'
import { Navbar } from '../layout/Navbar'
import { useTranslation } from '../../i18n/useTranslation'
import { SevenSegmentDisplay } from '../common/SevenSegmentDisplay'
import { StarPips } from '../common/StarPips'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const { t, tLevelName } = useTranslation()
  if (!user) return null

  const levels = levelRepository.getAll()
  const stats = getStudentStats(user.studentId, levels)

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>{user.displayName}</h1>
          <p>{t('profile.robotSummary', { robotName: user.robotConfig.name, count: user.robotConfig.sensors.length })}</p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <SevenSegmentDisplay value={String(stats.levelsPassed).padStart(2, '0')} size={24} />
            <div className={styles.statLabel}>{t('profile.levelsPassed')}</div>
          </div>
          <div className={styles.stat}>
            <SevenSegmentDisplay value={String(stats.totalStars).padStart(2, '0')} size={24} />
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
                    {best ? <SevenSegmentDisplay value={(best.completionTimeMs / 1000).toFixed(1).padStart(4, '0')} size={13} /> : '—'}
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
