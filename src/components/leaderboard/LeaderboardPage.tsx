import { useEffect, useState } from 'react'
import { levelRepository, levelResultRepository } from '../../data'
import type { Level } from '../../types/domain'
import { getGlobalLeaderboard, getLevelLeaderboard, type GlobalLeaderboardRow, type LevelLeaderboardRow } from './leaderboardAggregation'
import { LevelLeaderboardTable } from './LevelLeaderboardTable'
import { GlobalLeaderboardTable } from './GlobalLeaderboardTable'
import { Navbar } from '../layout/Navbar'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './LeaderboardPage.module.css'

export function LeaderboardPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [levelRows, setLevelRows] = useState<LevelLeaderboardRow[]>([])
  const [globalRows, setGlobalRows] = useState<GlobalLeaderboardRow[]>([])
  const { t, tLevelName } = useTranslation()

  useEffect(() => {
    levelRepository.getAll().then((loaded) => {
      setLevels(loaded)
      setSelectedLevelId((current) => current || (loaded[0]?.id ?? ''))
    })
  }, [])

  useEffect(() => {
    if (levels.length > 0) getGlobalLeaderboard(levels).then(setGlobalRows)
  }, [levels])

  useEffect(() => {
    if (selectedLevelId) getLevelLeaderboard(selectedLevelId).then(setLevelRows)
    else setLevelRows([])
  }, [selectedLevelId])

  // Realtime: any student passing (or re-passing) any level anywhere refreshes both tables live,
  // so the leaderboard updates on its own mid-lesson without a manual refresh.
  useEffect(() => {
    return levelResultRepository.subscribeToChanges(() => {
      if (levels.length > 0) getGlobalLeaderboard(levels).then(setGlobalRows)
      if (selectedLevelId) getLevelLeaderboard(selectedLevelId).then(setLevelRows)
    })
  }, [levels, selectedLevelId])

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
            <LevelLeaderboardTable rows={levelRows} />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t('leaderboard.globalTitle')}</h2>
          </div>
          <div className={styles.card}>
            <GlobalLeaderboardTable rows={globalRows} />
          </div>
        </div>
      </div>
    </div>
  )
}
