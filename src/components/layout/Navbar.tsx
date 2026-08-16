import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'
import { useTranslation } from '../../i18n/useTranslation'
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
        {t('nav.brand')}
      </Link>
      <nav className={styles.links}>
        {isAdmin && (
          <>
            <Link to="/admin">{t('nav.admin')}</Link>
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
