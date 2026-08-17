import type { GlobalLeaderboardRow } from './leaderboardAggregation'
import { useTranslation } from '../../i18n/useTranslation'
import { SevenSegmentDisplay } from '../common/SevenSegmentDisplay'
import { RankBadge } from './RankBadge'
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
    <div className={styles.scrollWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.rank}>{t('leaderboard.rank')}</th>
            <th>{t('leaderboard.player')}</th>
            <th>{t('leaderboard.classroom')}</th>
            <th>{t('leaderboard.studentNumber')}</th>
            <th>{t('leaderboard.totalStars')}</th>
            <th>{t('leaderboard.levelsPassed')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.studentId}>
              <RankBadge rank={index + 1} />
              <td>{row.displayName}</td>
              <td>{row.classroom}</td>
              <td>{row.studentNumber}</td>
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
    </div>
  )
}
