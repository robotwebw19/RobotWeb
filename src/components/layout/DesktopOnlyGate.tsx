import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './DesktopOnlyGate.module.css'

/** Below this, the code editor + Konva robot simulator side-by-side layout has no room to work. */
const MIN_DESKTOP_WIDTH_PX = 900

/** `(hover: none) and (pointer: coarse)` is the standard way to ask "is this a touch-primary
 * device" — it's false on a desktop even with a touchscreen (mouse still present), true on
 * phones/tablets. Combined with a width floor so a genuinely narrow desktop window still gets
 * through (resizing it back out clears the gate), while a phone in landscape doesn't. */
function isDesktopEnvironment(): boolean {
  if (typeof window === 'undefined') return true
  const touchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches
  return !touchPrimary && window.innerWidth >= MIN_DESKTOP_WIDTH_PX
}

/** Blocks the whole app behind a "please use a computer" notice on phones/tablets/narrow windows
 * — the code editor and Konva simulator need a mouse and a wide layout neither can offer. */
export function DesktopOnlyGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [isDesktop, setIsDesktop] = useState(isDesktopEnvironment)

  useEffect(() => {
    function recheck() {
      setIsDesktop(isDesktopEnvironment())
    }
    window.addEventListener('resize', recheck)
    const pointerQuery = window.matchMedia('(hover: none) and (pointer: coarse)')
    pointerQuery.addEventListener('change', recheck)
    return () => {
      window.removeEventListener('resize', recheck)
      pointerQuery.removeEventListener('change', recheck)
    }
  }, [])

  if (isDesktop) return <>{children}</>

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="13" rx="1.5" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
        <h1 className={styles.title}>{t('desktopOnly.title')}</h1>
      </div>
    </div>
  )
}
