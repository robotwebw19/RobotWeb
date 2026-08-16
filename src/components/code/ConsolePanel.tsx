import type { ConsoleLine } from '../../hooks/useInterpreterConsole'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './ConsolePanel.module.css'

interface ConsolePanelProps {
  lines: ConsoleLine[]
}

export function ConsolePanel({ lines }: ConsolePanelProps) {
  const { t } = useTranslation()
  return (
    <div className={styles.console}>
      {lines.length === 0 && <div className={styles.empty}>{t('console.empty')}</div>}
      {lines.map((line) => (
        <div key={line.id} className={line.level === 'error' ? styles.errorLine : styles.logLine}>
          {line.text}
        </div>
      ))}
    </div>
  )
}
