import { Link, useRouteError } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './RouteErrorBoundary.module.css'

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return String(error)
}

function isStaleChunkError(message: string): boolean {
  return /dynamically imported module|Importing a module script failed/i.test(message)
}

export function RouteErrorBoundary() {
  const error = useRouteError()
  const { t } = useTranslation()
  const message = errorMessage(error)
  const stale = isStaleChunkError(message)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.29 2.25h17.78A1.5 1.5 0 0 0 22.18 18L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z" />
        </svg>
        <h1 className={styles.title}>{stale ? t('error.staleTitle') : t('error.title')}</h1>
        <p className={styles.subtitle}>{stale ? t('error.staleSubtitle') : t('error.subtitle')}</p>
        <button type="button" className={styles.reload} onClick={() => window.location.reload()}>
          {t('error.reload')}
        </button>
        <Link to="/" className={styles.homeLink}>
          {t('error.backHome')}
        </Link>
        <p className={styles.detail}>{message}</p>
      </div>
    </div>
  )
}
