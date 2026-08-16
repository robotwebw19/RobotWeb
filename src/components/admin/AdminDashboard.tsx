import { useState } from 'react'
import { Navbar } from '../layout/Navbar'
import { useTranslation } from '../../i18n/useTranslation'
import { AdminLevelsTab } from './AdminLevelsTab'
import { AdminStudentsTab } from './AdminStudentsTab'
import styles from './AdminDashboard.module.css'

type AdminTab = 'levels' | 'students'

export function AdminDashboard() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<AdminTab>('levels')

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <h1>{t('admin.title')}</h1>
        <div className={styles.tabs}>
          <button
            type="button"
            className={tab === 'levels' ? styles.tabActive : styles.tab}
            onClick={() => setTab('levels')}
          >
            {t('admin.tabLevels')}
          </button>
          <button
            type="button"
            className={tab === 'students' ? styles.tabActive : styles.tab}
            onClick={() => setTab('students')}
          >
            {t('admin.tabStudents')}
          </button>
        </div>
        {tab === 'levels' ? <AdminLevelsTab /> : <AdminStudentsTab />}
      </div>
    </div>
  )
}
