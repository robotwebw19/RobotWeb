import { useEffect, useState } from 'react'
import { levelRepository, levelResultRepository } from '../../data'
import type { Level } from '../../types/domain'
import { getGlobalLeaderboard, getLevelLeaderboard, type GlobalLeaderboardRow, type LevelLeaderboardRow } from './leaderboardAggregation'
import { LevelLeaderboardTable } from './LevelLeaderboardTable'
import { GlobalLeaderboardTable } from './GlobalLeaderboardTable'
import { Navbar } from '../layout/Navbar'
import { FilterTabs } from '../common/FilterTabs'
import { useTranslation } from '../../i18n/useTranslation'
import styles from './LeaderboardPage.module.css'

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'th', { numeric: true }))
}

type LeaderboardView = 'level' | 'global'

export function LeaderboardPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [levelRows, setLevelRows] = useState<LevelLeaderboardRow[]>([])
  const [globalRows, setGlobalRows] = useState<GlobalLeaderboardRow[]>([])
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedClassroom, setSelectedClassroom] = useState('')
  const [view, setView] = useState<LeaderboardView>('level')
  const { t, tLevelName } = useTranslation()

  const allRows = [...levelRows, ...globalRows]
  const grades = uniqueSorted(allRows.map((row) => row.grade))
  const classrooms = uniqueSorted(
    allRows.filter((row) => !selectedGrade || row.grade === selectedGrade).map((row) => row.classroom),
  )

  function changeGrade(grade: string) {
    setSelectedGrade(grade)
    setSelectedClassroom('')
  }

  const matchesFilter = (row: { grade: string; classroom: string }) =>
    (!selectedGrade || row.grade === selectedGrade) && (!selectedClassroom || row.classroom === selectedClassroom)
  const filteredLevelRows = levelRows.filter(matchesFilter)
  const filteredGlobalRows = globalRows.filter(matchesFilter)

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
        <div className={styles.viewToggle} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'level'}
            className={`${styles.viewButton} ${view === 'level' ? styles.viewButtonActive : ''}`}
            title={t('leaderboard.levelTitle')}
            aria-label={t('leaderboard.levelTitle')}
            onClick={() => setView('level')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3v18" />
              <path d="M6 4c2-1 4-1 6 0s4 1 6 0v8c-2 1-4 1-6 0s-4-1-6 0V4Z" />
            </svg>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'global'}
            className={`${styles.viewButton} ${view === 'global' ? styles.viewButtonActive : ''}`}
            title={t('leaderboard.globalTitle')}
            aria-label={t('leaderboard.globalTitle')}
            onClick={() => setView('global')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
              <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
              <path d="M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
            </svg>
          </button>
        </div>

        <div className={styles.filterRow}>
          <FilterTabs options={grades} value={selectedGrade} onChange={changeGrade} allLabel={t('common.allGrades')} />
          <FilterTabs
            options={classrooms}
            value={selectedClassroom}
            onChange={setSelectedClassroom}
            allLabel={t('common.allClassrooms')}
          />
        </div>

        {view === 'level' ? (
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
              <LevelLeaderboardTable rows={filteredLevelRows} />
            </div>
          </div>
        ) : (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>{t('leaderboard.globalTitle')}</h2>
            </div>
            <div className={styles.card}>
              <GlobalLeaderboardTable rows={filteredGlobalRows} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
