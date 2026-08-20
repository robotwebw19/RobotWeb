import type { GlobalLeaderboardRow } from './leaderboardAggregation'
import { useTranslation } from '../../i18n/useTranslation'
import { SegmentDisplay } from '../common/SegmentDisplay'
import { SortableHeader } from '../common/SortableHeader'
import { useSortableRows } from '../../hooks/useSortableRows'
import { RankBadge } from './RankBadge'
import styles from './LeaderboardTable.module.css'

interface GlobalLeaderboardTableProps {
  rows: GlobalLeaderboardRow[]
}

type SortKey = 'displayName' | 'classroom' | 'studentNumber' | 'totalStars' | 'levelsPassed'

function sortValue(row: GlobalLeaderboardRow, key: SortKey): string | number {
  return row[key]
}

export function GlobalLeaderboardTable({ rows }: GlobalLeaderboardTableProps) {
  const { t } = useTranslation()
  const { sortedRows, sortKey, sortDir, toggleSort } = useSortableRows(rows, sortValue)

  if (rows.length === 0) {
    return <p className={styles.empty}>{t('leaderboard.globalEmpty')}</p>
  }

  return (
    <div className={styles.scrollWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.rank}>{t('leaderboard.rank')}</th>
            <SortableHeader label={t('leaderboard.player')} sortKey="displayName" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            <SortableHeader label={t('leaderboard.classroom')} sortKey="classroom" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            <SortableHeader
              label={t('leaderboard.studentNumber')}
              sortKey="studentNumber"
              activeKey={sortKey}
              dir={sortDir}
              onSort={toggleSort}
            />
            <SortableHeader label={t('leaderboard.totalStars')} sortKey="totalStars" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            <SortableHeader
              label={t('leaderboard.levelsPassed')}
              sortKey="levelsPassed"
              activeKey={sortKey}
              dir={sortDir}
              onSort={toggleSort}
            />
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, index) => (
            <tr key={row.studentId}>
              <RankBadge rank={index + 1} />
              <td>{row.displayName}</td>
              <td>{row.classroom}</td>
              <td>{row.studentNumber}</td>
              <td>
                <SegmentDisplay value={String(row.totalStars).padStart(2, '0')} size={14} />
              </td>
              <td>
                <SegmentDisplay value={String(row.levelsPassed).padStart(2, '0')} size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
