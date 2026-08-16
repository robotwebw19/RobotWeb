import type { LevelResult } from '../../types/domain'
import { readItem, writeItem, listKeySuffixes } from '../storage/localStorageClient'
import { keys } from '../storage/keys'
import type { ILevelResultRepository } from './ILevelResultRepository'

export class LocalLevelResultRepository implements ILevelResultRepository {
  getForLevel(levelId: string): LevelResult[] {
    return readItem<LevelResult[]>(keys.levelResults(levelId)) ?? []
  }

  getForUser(studentId: string): LevelResult[] {
    const levelIds = listKeySuffixes(keys.levelResultsPrefix)
    return levelIds.flatMap((levelId) =>
      this.getForLevel(levelId).filter((result) => result.studentId === studentId),
    )
  }

  getBestForUserLevel(studentId: string, levelId: string): LevelResult | undefined {
    const passedAttempts = this.getForLevel(levelId).filter(
      (result) => result.studentId === studentId && result.passed,
    )
    if (passedAttempts.length === 0) return undefined
    return passedAttempts.reduce((best, current) =>
      current.completionTimeMs < best.completionTimeMs ? current : best,
    )
  }

  save(result: LevelResult): void {
    const existing = this.getForLevel(result.levelId)
    writeItem(keys.levelResults(result.levelId), [...existing, result])
  }
}
