import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'
import { useTranslation } from '../../i18n/useTranslation'
import logoMark from '../auth/login-avatar.png'
import styles from './Navbar.module.css'

export function Navbar() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const { t } = useTranslation()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.navbar}>
      <Link to={isAdmin ? '/admin' : '/'} className={styles.logo}>
        <img src={logoMark} alt="" className={styles.logoMark} />
        {t('nav.brand')}
      </Link>
      <nav className={styles.links}>
        {isAdmin && (
          <>
            <Link to="/admin/students" className={styles.iconLink} title={t('nav.adminStudents')} aria-label={t('nav.adminStudents')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="8" r="3.2" />
                <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                <circle cx="17" cy="9" r="2.4" />
                <path d="M15 20c.2-2.8 2-4.6 4.5-4.6" />
              </svg>
            </Link>
            <Link to="/admin" className={styles.iconLink} title={t('nav.adminSolutions')} aria-label={t('nav.adminSolutions')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="15" r="4" />
                <path d="M11 12l9-9" />
                <path d="M17 6l3 3" />
                <path d="M14 9l2 2" />
              </svg>
            </Link>
            <button className={styles.logoutButton} type="button" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        )}
        {!isAdmin && user && (
          <>
            <Link to="/leaderboard">{t('nav.leaderboard')}</Link>
            <Link to="/profile">{t('nav.profile')}</Link>
            <span className={styles.status}>{user.displayName}</span>
            <button className={styles.logoutButton} type="button" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          </>
        )}
        {!isAdmin && !user && <span className={styles.status}>{t('nav.notSignedIn')}</span>}
      </nav>
    </header>
  )
}
