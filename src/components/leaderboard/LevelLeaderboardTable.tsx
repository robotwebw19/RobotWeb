import type { LevelLeaderboardRow } from './leaderboardAggregation'
import { useTranslation } from '../../i18n/useTranslation'
import { SegmentDisplay } from '../common/SegmentDisplay'
import { StarPips } from '../common/StarPips'
import { SortableHeader } from '../common/SortableHeader'
import { useSortableRows } from '../../hooks/useSortableRows'
import { RankBadge } from './RankBadge'
import styles from './LeaderboardTable.module.css'

interface LevelLeaderboardTableProps {
  rows: LevelLeaderboardRow[]
}

type SortKey = 'displayName' | 'classroom' | 'studentNumber' | 'bestTimeMs' | 'stars' | 'completedAt'

function sortValue(row: LevelLeaderboardRow, key: SortKey): string | number {
  return row[key]
}

export function LevelLeaderboardTable({ rows }: LevelLeaderboardTableProps) {
  const { t } = useTranslation()
  const { sortedRows, sortKey, sortDir, toggleSort } = useSortableRows(rows, sortValue)

  if (rows.length === 0) {
    return <p className={styles.empty}>{t('leaderboard.levelEmpty')}</p>
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
            <SortableHeader label={t('leaderboard.time')} sortKey="bestTimeMs" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            <SortableHeader label={t('leaderboard.stars')} sortKey="stars" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            <SortableHeader label={t('leaderboard.date')} sortKey="completedAt" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
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
                <SegmentDisplay value={(row.bestTimeMs / 1000).toFixed(2).padStart(5, '0')} size={14} />
              </td>
              <td>
                <StarPips lit={row.stars} />
              </td>
              <td>{new Date(row.completedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
