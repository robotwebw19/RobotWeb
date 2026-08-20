import { useMemo, useState } from 'react'

export type SortDir = 'asc' | 'desc'

/** Numeric-aware compare so string columns like student number ("2" vs "10") sort by
 * value, not lexicographically. */
function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'th', { numeric: true })
}

/** Click-to-sort table state: first click on a column sorts ascending, a second click
 * on the same column flips to descending. */
export function useSortableRows<T, K extends string>(rows: T[], valueFor: (row: T, key: K) => string | number) {
  const [sortKey, setSortKey] = useState<K | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      const cmp = compareValues(valueFor(a, sortKey), valueFor(b, sortKey))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir, valueFor])

  function toggleSort(key: K) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return { sortedRows, sortKey, sortDir, toggleSort }
}
