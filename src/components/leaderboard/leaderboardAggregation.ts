import type { Level, LevelResult } from '../../types/domain'
import { levelResultRepository, userRepository } from '../../data'

export interface LevelLeaderboardRow {
  studentId: string
  displayName: string
  bestTimeMs: number
  stars: number
  completedAt: string
}

/** Per-level leaderboard: each student's single best passed attempt, fastest first. */
export function getLevelLeaderboard(levelId: string): LevelLeaderboardRow[] {
  const bestByStudent = new Map<string, LevelResult>()
  for (const result of levelResultRepository.getForLevel(levelId)) {
    if (!result.passed) continue
    const existing = bestByStudent.get(result.studentId)
    if (!existing || result.completionTimeMs < existing.completionTimeMs) {
      bestByStudent.set(result.studentId, result)
    }
  }

  return Array.from(bestByStudent.values())
    .map((result) => ({
      studentId: result.studentId,
      displayName: userRepository.getById(result.studentId)?.displayName ?? 'Unknown player',
      bestTimeMs: result.completionTimeMs,
      stars: result.stars,
      completedAt: result.submittedAt,
    }))
    .sort((a, b) => a.bestTimeMs - b.bestTimeMs)
}

export interface GlobalLeaderboardRow {
  studentId: string
  displayName: string
  totalStars: number
  levelsPassed: number
}

/** Global leaderboard: total stars across each student's best passed attempt per level. */
export function getGlobalLeaderboard(levels: Level[]): GlobalLeaderboardRow[] {
  const bestByStudentThenLevel = new Map<string, Map<string, LevelResult>>()

  for (const level of levels) {
    for (const result of levelResultRepository.getForLevel(level.id)) {
      if (!result.passed) continue
      const studentLevels = bestByStudentThenLevel.get(result.studentId) ?? new Map<string, LevelResult>()
      const existing = studentLevels.get(result.levelId)
      if (!existing || result.completionTimeMs < existing.completionTimeMs) {
        studentLevels.set(result.levelId, result)
      }
      bestByStudentThenLevel.set(result.studentId, studentLevels)
    }
  }

  const rows: GlobalLeaderboardRow[] = []
  for (const [studentId, levelResults] of bestByStudentThenLevel) {
    let totalStars = 0
    for (const result of levelResults.values()) totalStars += result.stars
    rows.push({
      studentId,
      displayName: userRepository.getById(studentId)?.displayName ?? 'Unknown player',
      totalStars,
      levelsPassed: levelResults.size,
    })
  }

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

export function getStudentStats(studentId: string, levels: Level[]): StudentStats {
  let totalStars = 0
  let levelsPassed = 0

  const perLevel = levels.map((level) => {
    const best = levelResultRepository.getBestForUserLevel(studentId, level.id)
    if (best) {
      totalStars += best.stars
      levelsPassed += 1
    }
    return { level, best }
  })

  return { totalStars, levelsPassed, perLevel }
}
