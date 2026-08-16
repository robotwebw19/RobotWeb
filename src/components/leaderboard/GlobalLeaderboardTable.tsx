import type { GlobalLeaderboardRow } from './leaderboardAggregation'
import { useTranslation } from '../../i18n/useTranslation'
import { SevenSegmentDisplay } from '../common/SevenSegmentDisplay'
import styles from './LeaderboardTable.module.css'

interface GlobalLeaderboardTableProps {
  rows: GlobalLeaderboardRow[]
}

export function GlobalLeaderboardTable({ rows }: GlobalLeaderboardTableProps) {
  const { t } = useTranslation()

  if (rows.length === 0) {
    return <p className={styles.empty}>{t('leaderboard.globalEmpty')}</p>
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.rank}>{t('leaderboard.rank')}</th>
          <th>{t('leaderboard.player')}</th>
          <th>{t('leaderboard.totalStars')}</th>
          <th>{t('leaderboard.levelsPassed')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.studentId}>
            <td className={styles.rank}>{index + 1}</td>
            <td>{row.displayName}</td>
            <td>
              <SevenSegmentDisplay value={String(row.totalStars).padStart(2, '0')} size={14} />
            </td>
            <td>
              <SevenSegmentDisplay value={String(row.levelsPassed).padStart(2, '0')} size={14} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
