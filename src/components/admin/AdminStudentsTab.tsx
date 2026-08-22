import { useEffect, useMemo, useState } from 'react'
import { userRepository, levelRepository } from '../../data'
import { useLiveLevelResults } from '../../hooks/useLiveLevelResults'
import { getStudentStats, type StudentStats } from '../leaderboard/leaderboardAggregation'
import { FilterTabs } from '../common/FilterTabs'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'
import { PREFIX_OPTIONS, GRADE_OPTIONS } from '../../types/studentOptions'
import type { Level, StudentPrefix, User } from '../../types/domain'
import { HIDDEN_CLASSROOMS } from '../../utils/constants'
import styles from './AdminStudentsTab.module.css'

const EMPTY_STATS: StudentStats = { totalStars: 0, levelsPassed: 0, perLevel: [] }

interface EditDraft {
  prefix: StudentPrefix
  firstName: string
  lastName: string
  grade: string
  classroom: string
  studentNumber: string
}

function draftFrom(student: User): EditDraft {
  const { prefix, firstName, lastName, grade, classroom, studentNumber } = student
  return { prefix, firstName, lastName, grade, classroom, studentNumber }
}

type SortKey = 'studentId' | 'prefix' | 'firstName' | 'lastName' | 'grade' | 'classroom' | 'studentNumber' | 'levelsPassed' | 'totalStars'
type SortDir = 'asc' | 'desc'

function sortValue(student: User, stats: StudentStats, key: SortKey): string | number {
  if (key === 'levelsPassed') return stats.levelsPassed
  if (key === 'totalStars') return stats.totalStars
  return student[key]
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}

function CancelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2.5l2.9 6 6.6.8-4.8 4.6 1.2 6.6-5.9-3.2-5.9 3.2 1.2-6.6-4.8-4.6 6.6-.8z" />
    </svg>
  )
}

function SortIcon({ direction }: { direction: SortDir | null }) {
  return (
    <svg
      className={styles.sortIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: direction ? 1 : 0.35, transform: direction === 'desc' ? 'rotate(180deg)' : undefined }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string
  sortKey: SortKey
  activeKey: SortKey | null
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  return (
    <th>
      <button type="button" className={styles.sortButton} onClick={() => onSort(sortKey)}>
        <span>{label}</span>
        <SortIcon direction={activeKey === sortKey ? dir : null} />
      </button>
    </th>
  )
}

export function AdminStudentsTab() {
  const { t } = useTranslation()
  const [students, setStudents] = useState<User[]>([])
  const [levels, setLevels] = useState<Level[]>([])
  const [statsByStudentId, setStatsByStudentId] = useState<Record<string, StudentStats>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<EditDraft | null>(null)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedClassroom, setSelectedClassroom] = useState('')

  useEffect(() => {
    userRepository.getAll().then((loaded) => setStudents(loaded.filter((student) => !HIDDEN_CLASSROOMS.has(student.classroom))))
    levelRepository.getAll().then(setLevels)
  }, [])

  useLiveLevelResults(
    () =>
      Promise.all(students.map((student) => getStudentStats(student.studentId, levels))).then((allStats) =>
        Object.fromEntries(students.map((student, index) => [student.studentId, allStats[index]])),
      ),
    setStatsByStudentId,
    students.length > 0 && levels.length > 0,
    [students, levels],
  )

  const grades = useMemo(
    () =>
      Array.from(new Set(students.map((student) => student.grade).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, 'th', { numeric: true }),
      ),
    [students],
  )

  const classrooms = useMemo(
    () =>
      Array.from(
        new Set(
          students
            .filter((student) => !selectedGrade || student.grade === selectedGrade)
            .map((student) => student.classroom)
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, 'th', { numeric: true })),
    [students, selectedGrade],
  )

  function changeGrade(grade: string) {
    setSelectedGrade(grade)
    setSelectedClassroom('')
  }

  const sortedStudents = useMemo(() => {
    const scoped = students.filter(
      (student) => (!selectedGrade || student.grade === selectedGrade) && (!selectedClassroom || student.classroom === selectedClassroom),
    )
    if (!sortKey) return scoped
    const sorted = [...scoped].sort((a, b) => {
      const av = sortValue(a, statsByStudentId[a.studentId] ?? EMPTY_STATS, sortKey)
      const bv = sortValue(b, statsByStudentId[b.studentId] ?? EMPTY_STATS, sortKey)
      const cmp =
        typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'th', { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [students, statsByStudentId, sortKey, sortDir, selectedGrade, selectedClassroom])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function startEdit(student: User) {
    setEditingId(student.studentId)
    setDraft(draftFrom(student))
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft(null)
  }

  function updateDraft<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
  }

  async function saveEdit(student: User) {
    if (!draft) return
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.classroom.trim() || !draft.studentNumber.trim()) return
    await userRepository.save({
      ...student,
      ...draft,
      displayName: `${draft.firstName} ${draft.lastName}`.trim(),
    })
    setStudents((await userRepository.getAll()).filter((student) => !HIDDEN_CLASSROOMS.has(student.classroom)))
    cancelEdit()
  }

  async function handleDelete(studentId: string) {
    if (!window.confirm(t('admin.confirmDeleteStudent'))) return
    await userRepository.delete(studentId)
    setStudents((await userRepository.getAll()).filter((student) => !HIDDEN_CLASSROOMS.has(student.classroom)))
  }

  if (students.length === 0) {
    return <p className={styles.empty}>{t('admin.noStudents')}</p>
  }

  const headerColumns: { key: SortKey; labelKey: TranslationKey }[] = [
    { key: 'studentId', labelKey: 'admin.studentId' },
    { key: 'prefix', labelKey: 'onboarding.prefixLabel' },
    { key: 'firstName', labelKey: 'onboarding.firstNameLabel' },
    { key: 'lastName', labelKey: 'onboarding.lastNameLabel' },
    { key: 'grade', labelKey: 'onboarding.gradeLabel' },
    { key: 'classroom', labelKey: 'onboarding.classroomLabel' },
    { key: 'studentNumber', labelKey: 'onboarding.numberLabel' },
    { key: 'levelsPassed', labelKey: 'profile.levelsPassed' },
    { key: 'totalStars', labelKey: 'profile.totalStars' },
  ]

  return (
    <div>
      <div className={styles.filterRow}>
        <FilterTabs options={grades} value={selectedGrade} onChange={changeGrade} allLabel={t('common.allGrades')} />
        <FilterTabs
          options={classrooms}
          value={selectedClassroom}
          onChange={setSelectedClassroom}
          allLabel={t('common.allClassrooms')}
        />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
        <thead>
          <tr>
            {headerColumns.map((column) => (
              <SortableHeader
                key={column.key}
                label={t(column.labelKey)}
                sortKey={column.key}
                activeKey={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
            ))}
            <th className={styles.actionsCell}>{t('admin.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student, index) => {
            const stats = statsByStudentId[student.studentId] ?? EMPTY_STATS
            const isEditing = editingId === student.studentId

            return (
              <tr
                key={student.studentId}
                className={`${index % 2 === 1 ? styles.stripedRow : ''} ${isEditing ? styles.editingRow : ''}`.trim()}
              >
                <td>
                  <span className={styles.idChip}>{student.studentId}</span>
                </td>
                {isEditing && draft ? (
                  <>
                    <td>
                      <select
                        className={styles.editSelect}
                        value={draft.prefix}
                        onChange={(event) => updateDraft('prefix', event.target.value as StudentPrefix)}
                      >
                        {PREFIX_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className={styles.editInput}
                        value={draft.firstName}
                        onChange={(event) => updateDraft('firstName', event.target.value)}
                        maxLength={40}
                        aria-label={t('onboarding.firstNameLabel')}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.editInput}
                        value={draft.lastName}
                        onChange={(event) => updateDraft('lastName', event.target.value)}
                        maxLength={40}
                        aria-label={t('onboarding.lastNameLabel')}
                      />
                    </td>
                    <td>
                      <select
                        className={styles.editSelect}
                        value={draft.grade}
                        onChange={(event) => updateDraft('grade', event.target.value)}
                      >
                        {GRADE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className={styles.editInputNarrow}
                        value={draft.classroom}
                        onChange={(event) => updateDraft('classroom', event.target.value)}
                        maxLength={10}
                        aria-label={t('onboarding.classroomLabel')}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.editInputNarrow}
                        value={draft.studentNumber}
                        onChange={(event) => updateDraft('studentNumber', event.target.value)}
                        maxLength={4}
                        aria-label={t('onboarding.numberLabel')}
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td className={styles.muted}>{student.prefix}</td>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td>{student.grade}</td>
                    <td>{student.classroom}</td>
                    <td>{student.studentNumber}</td>
                  </>
                )}
                <td className={styles.levelsPassed}>{stats.levelsPassed}</td>
                <td>
                  <span className={styles.starValue}>
                    <StarIcon />
                    {stats.totalStars}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <div className={styles.actions}>
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => saveEdit(student)}
                          aria-label={t('admin.saveStudent')}
                          title={t('admin.saveStudent')}
                        >
                          <SaveIcon />
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={cancelEdit}
                          aria-label={t('admin.cancelEdit')}
                          title={t('admin.cancelEdit')}
                        >
                          <CancelIcon />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.iconButton}
                          onClick={() => startEdit(student)}
                          aria-label={t('admin.editStudent')}
                          title={t('admin.editStudent')}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className={styles.iconButtonDanger}
                          onClick={() => handleDelete(student.studentId)}
                          aria-label={t('admin.deleteStudent')}
                          title={t('admin.deleteStudent')}
                        >
                          <DeleteIcon />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}
