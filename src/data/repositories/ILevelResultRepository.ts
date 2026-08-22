import type { LevelResult } from '../../types/domain'

/**
 * Only `LevelRuntime`'s internal LevelCompleteEvent handler (see sim/engine/LevelRuntime.ts,
 * built in M8) is meant to call `save()`. That's the anti-cheat boundary: a result can only be
 * produced by an actual completed simulation run, not by an arbitrary caller.
 */
export interface ILevelResultRepository {
  getForLevel(levelId: string): Promise<LevelResult[]>
  getForUser(studentId: string): Promise<LevelResult[]>
  getBestForUserLevel(studentId: string, levelId: string): Promise<LevelResult | undefined>
  save(result: LevelResult): Promise<void>
  /** Admin-only: deletes every result any student has for one level, resetting the whole
   * level's scoreboard back to empty. */
  resetForLevel(levelId: string): Promise<void>
  /** Fires `onChange` (debounced) whenever any result is saved anywhere (any student, any
   * level) — the leaderboard's live-update signal. Returns an unsubscribe function. */
  subscribeToChanges(onChange: () => void): () => void
}
