import { useState } from 'react'
import { useAuthStore } from '../../state/authStore'
import { SensorConfigurator } from '../sensors/SensorConfigurator'
import { LevelList } from '../levels/LevelList'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import styles from './LeftPanel.module.css'

type Tab = 'levels' | 'sensors'

const TABS: { id: Tab; labelKey: TranslationKey }[] = [
  { id: 'levels', labelKey: 'leftPanel.levels' },
  { id: 'sensors', labelKey: 'leftPanel.sensors' },
]

export function LeftPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('levels')
  const user = useAuthStore((state) => state.user)
  const updateRobotConfig = useAuthStore((state) => state.updateRobotConfig)
  const { t } = useTranslation()

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {activeTab === 'levels' && <LevelList />}
        {activeTab === 'sensors' && user && (
          <SensorConfigurator
            initialConfig={user.robotConfig}
            onSave={updateRobotConfig}
            saveLabel={t('sensors.saveChanges')}
          />
        )}
      </div>
    </div>
  )
}
