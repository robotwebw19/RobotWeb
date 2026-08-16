import { useState } from 'react'
import { levelRepository } from '../../data'
import { getGlobalLeaderboard, getLevelLeaderboard } from './leaderboardAggregation'
import { LevelLeaderboardTable } from './LevelLeaderboardTable'
import { GlobalLeaderboardTable } from './GlobalLeaderboardTable'
import { Navbar } from '../layout/Navbar'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './LeaderboardPage.module.css'

export function LeaderboardPage() {
  const levels = levelRepository.getAll()
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0]?.id ?? '')
  const { t, tLevelName } = useTranslation()

  return (
    <div>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t('leaderboard.levelTitle')}</h2>
            <select
              className={styles.select}
              value={selectedLevelId}
              onChange={(event) => setSelectedLevelId(event.target.value)}
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {tLevelName(level.id, level.name)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.card}>
            <LevelLeaderboardTable rows={selectedLevelId ? getLevelLeaderboard(selectedLevelId) : []} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t('leaderboard.globalTitle')}</h2>
          </div>
          <div className={styles.card}>
            <GlobalLeaderboardTable rows={getGlobalLeaderboard(levels)} />
          </div>
        </div>
      </div>
    </div>
  )
}
