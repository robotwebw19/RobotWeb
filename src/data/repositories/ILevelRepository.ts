import type { Level } from '../../types/domain'

export interface ILevelRepository {
  /** Seed levels plus every user-created level, seed levels first. */
  getAll(): Level[]
  getById(id: string): Level | undefined
  saveUserLevel(level: Level): void
  deleteUserLevel(id: string): void
}
