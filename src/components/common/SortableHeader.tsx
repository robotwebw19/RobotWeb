import type { SortDir } from '../../hooks/useSortableRows'
import styles from './SortableHeader.module.css'

function SortIcon({ direction }: { direction: SortDir | null }) {
  return (
    <svg
      className={styles.sortIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: direction ? 1 : 0.35, transform: direction === 'desc' ? 'rotate(180deg)' : undefined }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

interface SortableHeaderProps<K extends string> {
  label: string
  sortKey: K
  activeKey: K | null
  dir: SortDir
  onSort: (key: K) => void
  className?: string
}

export function SortableHeader<K extends string>({ label, sortKey, activeKey, dir, onSort, className }: SortableHeaderProps<K>) {
  return (
    <th className={className}>
      <button type="button" className={styles.sortButton} onClick={() => onSort(sortKey)}>
        <span>{label}</span>
        <SortIcon direction={activeKey === sortKey ? dir : null} />
      </button>
    </th>
  )
}
