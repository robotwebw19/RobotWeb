import type { Level, LevelResult, User } from '../../types/domain'
import { levelResultRepository, userRepository } from '../../data'

/** Batch-fetches students by id and returns them keyed by studentId — the shared user lookup
 * behind both leaderboards, so each only pays for one round trip instead of N. */
async function resolveStudents(studentIds: string[]): Promise<Map<string, User>> {
  const students = await userRepository.getByIds(studentIds)
  return new Map(students.map((student) => [student.studentId, student]))
}

/** The identity columns every leaderboard row shows, with a display fallback for a student
 * record that's gone missing (e.g. deleted after earning the result). */
function studentIdentity(student: User | undefined): Pick<User, 'displayName' | 'classroom' | 'studentNumber'> {
  return {
    displayName: student?.displayName ?? 'Unknown player',
    classroom: student?.classroom ?? '',
    studentNumber: student?.studentNumber ?? '',
  }
}

/** Each level's fastest passed attempt, keyed by levelId — the per-student "best" reduction
 * shared by the level board and the student stats view. */
export function bestPassedPerLevel(results: LevelResult[]): Map<string, LevelResult> {
  const best = new Map<string, LevelResult>()
  for (const result of results) {
    if (!result.passed) continue
    const existing = best.get(result.levelId)
    if (!existing || result.completionTimeMs < existing.completionTimeMs) {
      best.set(result.levelId, result)
    }
  }
  return best
}

export interface LevelLeaderboardRow {
  studentId: string
  displayName: string
  classroom: string
  studentNumber: string
  bestTimeMs: number
  stars: number
  completedAt: string
}

/** Per-level leaderboard: each student's single best passed attempt, fastest first. */
export async function getLevelLeaderboard(levelId: string): Promise<LevelLeaderboardRow[]> {
  const results = await levelResultRepository.getForLevel(levelId)
  const bestByStudent = new Map<string, LevelResult>()
  for (const result of results) {
    if (!result.passed) continue
    const existing = bestByStudent.get(result.studentId)
    if (!existing || result.completionTimeMs < existing.completionTimeMs) {
      bestByStudent.set(result.studentId, result)
    }
  }

  const bestResults = Array.from(bestByStudent.values())
  const studentById = await resolveStudents(bestResults.map((result) => result.studentId))

  const rows = bestResults.map((result) => ({
    studentId: result.studentId,
    ...studentIdentity(studentById.get(result.studentId)),
    bestTimeMs: result.completionTimeMs,
    stars: result.stars,
    completedAt: result.submittedAt,
  }))

  return rows.sort((a, b) => b.stars - a.stars || a.bestTimeMs - b.bestTimeMs)
}

export interface GlobalLeaderboardRow {
  studentId: string
  displayName: string
  classroom: string
  studentNumber: string
  totalStars: number
  levelsPassed: number
}

/** Global leaderboard: total stars across each student's best passed attempt per level. */
export async function getGlobalLeaderboard(levels: Level[]): Promise<GlobalLeaderboardRow[]> {
  const resultsByLevel = await Promise.all(levels.map((level) => levelResultRepository.getForLevel(level.id)))
  const bestByStudentThenLevel = new Map<string, Map<string, LevelResult>>()

  for (const results of resultsByLevel) {
    for (const result of results) {
      if (!result.passed) continue
      const studentLevels = bestByStudentThenLevel.get(result.studentId) ?? new Map<string, LevelResult>()
      const existing = studentLevels.get(result.levelId)
      if (!existing || result.completionTimeMs < existing.completionTimeMs) {
        studentLevels.set(result.levelId, result)
      }
      bestByStudentThenLevel.set(result.studentId, studentLevels)
    }
  }

  const entries = Array.from(bestByStudentThenLevel.entries())
  const studentById = await resolveStudents(entries.map(([studentId]) => studentId))

  const rows = entries.map(([studentId, levelResults]) => {
    let totalStars = 0
    for (const result of levelResults.values()) totalStars += result.stars
    return {
      studentId,
      ...studentIdentity(studentById.get(studentId)),
      totalStars,
      levelsPassed: levelResults.size,
    }
  })

  return rows.sort((a, b) => b.totalStars - a.totalStars || b.levelsPassed - a.levelsPassed)
}

export interface StudentLevelStat {
  level: Level
  best?: LevelResult
}

export interface StudentStats {
  totalStars: number
  levelsPassed: number
  perLevel: StudentLevelStat[]
}

export async function getStudentStats(studentId: string, levels: Level[]): Promise<StudentStats> {
  const bestByLevel = bestPassedPerLevel(await levelResultRepository.getForUser(studentId))

  let totalStars = 0
  let levelsPassed = 0
  const perLevel = levels.map((level) => {
    const best = bestByLevel.get(level.id)
    if (best) {
      totalStars += best.stars
      levelsPassed += 1
    }
    return { level, best }
  })

  return { totalStars, levelsPassed, perLevel }
}
