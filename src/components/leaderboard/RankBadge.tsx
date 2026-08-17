import styles from './LeaderboardTable.module.css'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface RankBadgeProps {
  rank: number
}

/** Ranks 1-3 get a medal icon; everything else just shows the plain number. */
export function RankBadge({ rank }: RankBadgeProps) {
  const medal = MEDALS[rank]
  return (
    <td className={styles.rank}>
      {medal ? (
        <span className={styles.medal} aria-label={String(rank)}>
          {medal}
        </span>
      ) : (
        rank
      )}
    </td>
  )
}
