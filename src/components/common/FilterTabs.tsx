import styles from './FilterTabs.module.css'

interface FilterTabsProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  allLabel: string
}

/** Pill tab bar for splitting a student table/leaderboard by a field (grade, classroom, ...).
 * Empty `value` means "all". Hides itself when there's nothing to split by. */
export function FilterTabs({ options, value, onChange, allLabel }: FilterTabsProps) {
  if (options.length <= 1) return null

  return (
    <div className={styles.tabs} role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={value === ''}
        className={`${styles.tab} ${value === '' ? styles.tabActive : ''}`}
        onClick={() => onChange('')}
      >
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={value === option}
          className={`${styles.tab} ${value === option ? styles.tabActive : ''}`}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
