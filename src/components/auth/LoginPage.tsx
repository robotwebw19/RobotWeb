import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'
import { useTranslation } from '../../i18n/useTranslation'
import loginAvatar from './login-avatar.png'
import { DigitCodeInput } from './DigitCodeInput'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const [mode, setMode] = useState<'student' | 'admin'>('student')
  const [studentId, setStudentId] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminError, setAdminError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const login = useAuthStore((state) => state.login)
  const loginAsAdmin = useAuthStore((state) => state.loginAsAdmin)
  const navigate = useNavigate()
  const { t } = useTranslation()

  async function handleStudentSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (studentId.length !== 5 || submitting) return
    setSubmitting(true)
    try {
      const result = await login(studentId)
      navigate(result === 'known' ? '/' : '/onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  function handleAdminSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (loginAsAdmin(adminUsername)) {
      navigate('/admin')
    } else {
      setAdminError(true)
    }
  }

  if (mode === 'admin') {
    return (
      <div className={styles.page}>
        <form className={styles.card} onSubmit={handleAdminSubmit}>
          <img className={styles.avatar} src={loginAvatar} alt="" aria-hidden="true" />
          <h1 className={styles.title}>{t('admin.title')}</h1>
          <input
            className={`${styles.digits} ${adminError ? styles.digitsError : ''}`}
            style={{ letterSpacing: 0, fontSize: 16 }}
            type="text"
            autoFocus
            value={adminUsername}
            onChange={(event) => {
              setAdminUsername(event.target.value)
              setAdminError(false)
            }}
            placeholder={t('login.adminUsernameLabel')}
            aria-label={t('login.adminUsernameLabel')}
          />
          {adminError && <p className={styles.hint}>{t('login.adminError')}</p>}
          <button className={styles.submit} type="submit" disabled={adminUsername.trim().length === 0}>
            {t('login.continue')}
          </button>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => {
              setMode('student')
              setAdminError(false)
            }}
          >
            {t('login.backToStudent')}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleStudentSubmit}>
        <img className={styles.avatar} src={loginAvatar} alt="" aria-hidden="true" />
        <h1 className={styles.brand}>{t('login.brand')}</h1>
        <div className={`${styles.idWrap} ${studentId.length === 5 ? styles.complete : ''}`}>
          <p className={styles.idHint}>{t('login.idHint')}</p>
          <DigitCodeInput length={5} value={studentId} onChange={setStudentId} autoFocus label={t('login.idLabel')} />
        </div>
        <button className={styles.submit} type="submit" disabled={studentId.length !== 5 || submitting}>
          {t('login.continue')}
        </button>
        <button type="button" className={styles.linkButton} onClick={() => setMode('admin')}>
          {t('login.adminLogin')}
        </button>
      </form>
    </div>
  )
}
