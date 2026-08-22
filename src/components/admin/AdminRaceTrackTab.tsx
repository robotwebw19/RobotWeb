import { useEffect, useMemo, useRef, useState } from 'react'
import { levelRepository, levelResultRepository } from '../../data'
import { supabase } from '../../data/supabaseClient'
import { useTranslation } from '../../i18n/useTranslation'
import type { Level, LevelDifficulty } from '../../types/domain'
import type { TranslationKey } from '../../i18n/translations'
import {
  RACE_TRACK_BROADCAST_EVENT,
  RACE_TRACK_STALE_MS,
  raceTrackChannelName,
  type RaceTrackRobotPayload,
} from '../../sim/engine/raceTrackChannel'
import { EDITOR_CANVAS_WIDTH_PX, EDITOR_CANVAS_HEIGHT_PX } from '../../utils/constants'
import { getLevelLeaderboard, type LevelLeaderboardRow } from '../leaderboard/leaderboardAggregation'
import { useLiveLevelResults } from '../../hooks/useLiveLevelResults'
import { useSortableRows } from '../../hooks/useSortableRows'
import { FilterTabs } from '../common/FilterTabs'
import { SortableHeader } from '../common/SortableHeader'
import { SegmentDisplay } from '../common/SegmentDisplay'
import { StarPips } from '../common/StarPips'
import { RaceTrackCanvas } from './RaceTrackCanvas'
import styles from './AdminRaceTrackTab.module.css'

type ScoreSortKey = 'firstName' | 'classroom' | 'studentNumber' | 'bestTimeMs' | 'stars'

/** Same placard-tag map as AdminLevelsTab.tsx. */
const DIFFICULTY_KEYS: Record<LevelDifficulty, TranslationKey> = {
  beginner: 'difficulty.beginner',
  easy: 'difficulty.easy',
  medium: 'difficulty.medium',
  hard: 'difficulty.hard',
  expert: 'difficulty.expert',
}

interface TrackedRobot extends RaceTrackRobotPayload {
  lastSeenMs: number
}

interface PassToast {
  id: string
  firstName: string
  studentNumber: string
}

const PASS_TOAST_VISIBLE_MS = 4000

export function AdminRaceTrackTab() {
  const { t, tLevelName } = useTranslation()
  const [levels, setLevels] = useState<Level[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [robots, setRobots] = useState<Record<string, TrackedRobot>>({})
  const selected = levels.find((level) => level.id === selectedId)
  const [passToasts, setPassToasts] = useState<PassToast[]>([])
  const prevStatusRef = useRef<Record<string, RaceTrackRobotPayload['status']>>({})

  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const [scoreRows, setScoreRows] = useState<LevelLeaderboardRow[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState('')

  useLiveLevelResults(
    () => (selectedId ? getLevelLeaderboard(selectedId) : Promise.resolve([])),
    setScoreRows,
    Boolean(selectedId),
    [selectedId],
  )

  useEffect(() => {
    setSelectedClassroom('')
  }, [selectedId])

  const classrooms = useMemo(
    () =>
      Array.from(new Set(scoreRows.map((row) => row.classroom).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'th', { numeric: true }),
      ),
    [scoreRows],
  )

  // Default order: classroom, then student number within it — sortable headers below can
  // override this, but this is what a teacher scanning a roster expects to see first.
  const classroomRows = useMemo(() => {
    const filtered = selectedClassroom ? scoreRows.filter((row) => row.classroom === selectedClassroom) : scoreRows
    return [...filtered].sort(
      (a, b) =>
        a.classroom.localeCompare(b.classroom, 'th', { numeric: true }) ||
        a.studentNumber.localeCompare(b.studentNumber, 'th', { numeric: true }),
    )
  }, [scoreRows, selectedClassroom])

  const { sortedRows: sortedScoreRows, sortKey: scoreSortKey, sortDir: scoreSortDir, toggleSort: toggleScoreSort } = useSortableRows<
    LevelLeaderboardRow,
    ScoreSortKey
  >(classroomRows, (row, key) => row[key])

  async function handleResetAllScores() {
    if (!selectedId || !window.confirm(t('admin.confirmResetAllScores'))) return
    await levelResultRepository.resetForLevel(selectedId)
  }

  useEffect(() => {
    levelRepository.getAll().then((loaded) => {
      setLevels(loaded)
      setSelectedId((current) => current || (loaded[0]?.id ?? ''))
    })
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      // No 1x cap — the track is the primary thing on this page, so it should fill whatever
      // room the layout gives it instead of staying pinned to its native editor size.
      setScale(Math.min(width / EDITOR_CANVAS_WIDTH_PX, height / EDITOR_CANVAS_HEIGHT_PX))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // One Realtime Broadcast channel per selected level — see useRaceTrackBroadcast.ts for the
  // matching student-side sender. Switching levels drops the old channel and starts clean.
  useEffect(() => {
    if (!selectedId) return
    setRobots({})
    setPassToasts([])
    prevStatusRef.current = {}

    const channel = supabase.channel(raceTrackChannelName(selectedId))
    channel
      .on('broadcast', { event: RACE_TRACK_BROADCAST_EVENT }, ({ payload }) => {
        const robot = payload as RaceTrackRobotPayload

        // Only the moment a robot's status flips *to* passed is a pass event — every broadcast
        // tick afterward still reports status 'passed' too, and would otherwise re-toast it.
        if (robot.status === 'passed' && prevStatusRef.current[robot.studentId] !== 'passed') {
          const id = `${robot.studentId}-${Date.now()}`
          setPassToasts((current) => [...current, { id, firstName: robot.firstName, studentNumber: robot.studentNumber }])
          setTimeout(() => setPassToasts((current) => current.filter((toast) => toast.id !== id)), PASS_TOAST_VISIBLE_MS)
        }
        prevStatusRef.current[robot.studentId] = robot.status

        setRobots((current) => ({ ...current, [robot.studentId]: { ...robot, lastSeenMs: Date.now() } }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedId])

  // A robot that stops broadcasting without a clean unmount (tab closed, laptop lid shut) never
  // sends a final status — drop it from the view once it's gone quiet instead of leaving a stale
  // robot frozen on the track forever.
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoff = Date.now() - RACE_TRACK_STALE_MS
      setRobots((current) => {
        const next = Object.fromEntries(Object.entries(current).filter(([, robot]) => robot.lastSeenMs >= cutoff))
        return Object.keys(next).length === Object.keys(current).length ? current : next
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const liveRobots = Object.values(robots)
  const runningCount = liveRobots.filter((robot) => robot.status === 'running').length

  return (
    <div className={styles.layout}>
      <div className={styles.list}>
        {levels.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`${styles.levelButton} ${level.id === selectedId ? styles.levelButtonActive : ''}`}
            onClick={() => setSelectedId(level.id)}
          >
            <span className={styles.levelButtonTop}>
              <span className={styles.levelName}>{tLevelName(level.id, level.name)}</span>
              <span className={styles.difficultyTag}>{t(DIFFICULTY_KEYS[level.difficulty])}</span>
            </span>
          </button>
        ))}
      </div>
      <div className={styles.detail}>
        <p className={styles.liveCount}>{t('admin.raceTrackLiveCount', { count: runningCount })}</p>
        <div className={styles.canvasWrap} ref={wrapRef}>
          {passToasts.length > 0 && (
            <div className={styles.passToastStack}>
              {passToasts.map((toast) => (
                <p key={toast.id} className={styles.passToast}>
                  {t('admin.raceTrackPassToast', { firstName: toast.firstName, studentNumber: toast.studentNumber })}
                </p>
              ))}
            </div>
          )}
          {selected && (
            <div
              className={styles.canvasFrame}
              style={{ width: EDITOR_CANVAS_WIDTH_PX * scale, height: EDITOR_CANVAS_HEIGHT_PX * scale }}
            >
              <div
                className={styles.canvasScaled}
                style={{ width: EDITOR_CANVAS_WIDTH_PX, height: EDITOR_CANVAS_HEIGHT_PX, transform: `scale(${scale})` }}
              >
                <RaceTrackCanvas level={selected} robots={liveRobots} />
              </div>
            </div>
          )}
        </div>
        <button type="button" className={styles.resetAllButton} onClick={handleResetAllScores} disabled={!selectedId}>
          {t('admin.raceTrackResetAll')}
        </button>
      </div>
      <div className={styles.scores}>
        <p className={styles.scoresTitle}>{t('admin.raceTrackScores')}</p>
        <FilterTabs options={classrooms} value={selectedClassroom} onChange={setSelectedClassroom} allLabel={t('common.allClassrooms')} />
        <div className={styles.scoresScroll}>
          {sortedScoreRows.length === 0 ? (
            <p className={styles.empty}>{t('leaderboard.levelEmpty')}</p>
          ) : (
            <table className={styles.scoresTable}>
              <thead>
                <tr>
                  <SortableHeader
                    label={t('leaderboard.player')}
                    sortKey="firstName"
                    activeKey={scoreSortKey}
                    dir={scoreSortDir}
                    onSort={toggleScoreSort}
                  />
                  <SortableHeader
                    label={t('leaderboard.classroom')}
                    sortKey="classroom"
                    activeKey={scoreSortKey}
                    dir={scoreSortDir}
                    onSort={toggleScoreSort}
                  />
                  <SortableHeader
                    label={t('leaderboard.studentNumber')}
                    sortKey="studentNumber"
                    activeKey={scoreSortKey}
                    dir={scoreSortDir}
                    onSort={toggleScoreSort}
                  />
                  <SortableHeader
                    label={t('leaderboard.time')}
                    sortKey="bestTimeMs"
                    activeKey={scoreSortKey}
                    dir={scoreSortDir}
                    onSort={toggleScoreSort}
                  />
                  <SortableHeader
                    label={t('leaderboard.stars')}
                    sortKey="stars"
                    activeKey={scoreSortKey}
                    dir={scoreSortDir}
                    onSort={toggleScoreSort}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedScoreRows.map((row) => (
                  <tr key={row.studentId}>
                    <td>{row.firstName}</td>
                    <td>{row.classroom}</td>
                    <td>{row.studentNumber}</td>
                    <td>
                      <SegmentDisplay value={(row.bestTimeMs / 1000).toFixed(2).padStart(5, '0')} size={10} />
                    </td>
                    <td>
                      <StarPips lit={row.stars} size={6} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
