import type { LevelResult } from '../../types/domain'

/**
 * Only `LevelRuntime`'s internal LevelCompleteEvent handler (see sim/engine/LevelRuntime.ts,
 * built in M8) is meant to call `save()`. That's the anti-cheat boundary: a result can only be
 * produced by an actual completed simulation run, not by an arbitrary caller.
 */
export interface ILevelResultRepository {
  getForLevel(levelId: string): LevelResult[]
  getForUser(studentId: string): LevelResult[]
  getBestForUserLevel(studentId: string, levelId: string): LevelResult | undefined
  save(result: LevelResult): void
}
