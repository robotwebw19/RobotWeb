import type { Level } from '../../types/domain'

export interface ILevelRepository {
  /** Seed levels plus every user-created level, seed levels first. */
  getAll(): Promise<Level[]>
  getById(id: string): Promise<Level | undefined>
  saveUserLevel(level: Level): Promise<void>
  deleteUserLevel(id: string): Promise<void>
}
