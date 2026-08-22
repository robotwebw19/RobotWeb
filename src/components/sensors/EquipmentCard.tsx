import styles from './EquipmentCard.module.css'

interface EquipmentCardProps {
  label: string
  description: string
  meta: string
  mounted: boolean
  onToggle: () => void
  /** Skip the native browser tooltip — for cards with their own hover panel (see
   * SensorModulePanel), which shows this same label/description/meta plus a labeled photo.
   * Hovering triggers that panel's own DOM churn nearby, which reliably cancels a pending
   * native tooltip anyway, so keeping both around was actually already unreliable. */
  suppressNativeTooltip?: boolean
}

/** The card itself is the control — click anywhere to mount/unmount, no separate add/remove
 * button. A `<button>` gives this free keyboard/focus/ARIA behavior for what's visually a card. */
export function EquipmentCard({ label, description, meta, mounted, onToggle, suppressNativeTooltip }: EquipmentCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${mounted ? styles.cardMounted : ''}`}
      onClick={onToggle}
      title={suppressNativeTooltip ? undefined : `${label} — ${description} (${meta})`}
      aria-pressed={mounted}
    >
      <strong className={styles.label}>{label}</strong>
      <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true">
        <circle cx={8} cy={8} r={8} />
        <path d="M4.5 8.2 6.8 10.5 11.5 5.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
