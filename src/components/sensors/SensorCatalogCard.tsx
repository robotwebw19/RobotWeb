import type { ReactNode } from 'react'
import type { SensorCatalogEntry } from '../../robot/sensorCatalog'
import type { SensorType } from '../../types/domain'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import styles from './SensorCatalogCard.module.css'

const CATALOG_TEXT_KEYS: Record<SensorType, { label: TranslationKey; description: TranslationKey }> = {
  ir: { label: 'catalog.ir.label', description: 'catalog.ir.description' },
  ultrasonic: { label: 'catalog.ultrasonic.label', description: 'catalog.ultrasonic.description' },
  color: { label: 'catalog.color.label', description: 'catalog.color.description' },
}

interface SensorCatalogCardProps {
  entry: SensorCatalogEntry
  children?: ReactNode
  wide?: boolean
}

export function SensorCatalogCard({ entry, children, wide }: SensorCatalogCardProps) {
  const { t } = useTranslation()
  const textKeys = CATALOG_TEXT_KEYS[entry.type]
  const label = t(textKeys.label)
  const tooltip = `${label} — ${t(textKeys.description)} (${entry.priceCredits}cr, ${entry.weightGrams}g)`

  return (
    <div className={`${styles.card} ${wide ? styles.cardWide : ''}`} title={tooltip}>
      <strong className={styles.label}>{label}</strong>
      <div className={styles.actions}>{children}</div>
    </div>
  )
}
