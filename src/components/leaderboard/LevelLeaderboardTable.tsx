import type { LevelLeaderboardRow } from './leaderboardAggregation'
import { useTranslation } from '../../i18n/useTranslation'
import { SevenSegmentDisplay } from '../common/SevenSegmentDisplay'
import { StarPips } from '../common/StarPips'
import styles from './LeaderboardTable.module.css'

interface LevelLeaderboardTableProps {
  rows: LevelLeaderboardRow[]
}

export function LevelLeaderboardTable({ rows }: LevelLeaderboardTableProps) {
  const { t } = useTranslation()

  if (rows.length === 0) {
    return <p className={styles.empty}>{t('leaderboard.levelEmpty')}</p>
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.rank}>{t('leaderboard.rank')}</th>
          <th>{t('leaderboard.player')}</th>
          <th>{t('leaderboard.time')}</th>
          <th>{t('leaderboard.stars')}</th>
          <th>{t('leaderboard.date')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.studentId}>
            <td className={styles.rank}>{index + 1}</td>
            <td>{row.displayName}</td>
            <td>
              <SevenSegmentDisplay value={(row.bestTimeMs / 1000).toFixed(1).padStart(4, '0')} size={14} />
            </td>
            <td>
              <StarPips lit={row.stars} />
            </td>
            <td>{new Date(row.completedAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
