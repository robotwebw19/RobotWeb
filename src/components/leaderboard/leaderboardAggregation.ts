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

  const rows = await Promise.all(
    Array.from(bestByStudent.values()).map(async (result) => ({
      studentId: result.studentId,
      displayName: (await userRepository.getById(result.studentId))?.displayName ?? 'Unknown player',
      bestTimeMs: result.completionTimeMs,
      stars: result.stars,
      completedAt: result.submittedAt,
    })),
  )

  return rows.sort((a, b) => a.bestTimeMs - b.bestTimeMs)
}

export interface GlobalLeaderboardRow {
  studentId: string
  displayName: string
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

  const rows = await Promise.all(
    Array.from(bestByStudentThenLevel.entries()).map(async ([studentId, levelResults]) => {
      let totalStars = 0
      for (const result of levelResults.values()) totalStars += result.stars
      return {
        studentId,
        displayName: (await userRepository.getById(studentId))?.displayName ?? 'Unknown player',
        totalStars,
        levelsPassed: levelResults.size,
      }
    }),
  )

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
  let totalStars = 0
  let levelsPassed = 0

  const perLevel = await Promise.all(
    levels.map(async (level) => {
      const best = await levelResultRepository.getBestForUserLevel(studentId, level.id)
      if (best) {
        totalStars += best.stars
        levelsPassed += 1
      }
      return { level, best }
    }),
  )

  return { totalStars, levelsPassed, perLevel }
}
