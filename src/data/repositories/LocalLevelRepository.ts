import type { Level } from '../../types/domain'
import { readItem, writeItem, removeItem } from '../storage/localStorageClient'
import { keys } from '../storage/keys'
import type { ILevelRepository } from './ILevelRepository'

export class LocalLevelRepository implements ILevelRepository {
  private readonly seedLevels: Level[]

  constructor(seedLevels: Level[]) {
    this.seedLevels = seedLevels
  }

  private getUserLevelIds(): string[] {
    return readItem<string[]>(keys.userLevelIndex) ?? []
  }

  private setUserLevelIds(ids: string[]): void {
    writeItem(keys.userLevelIndex, ids)
  }

  getAll(): Level[] {
    const userLevels = this.getUserLevelIds()
      .map((id) => readItem<Level>(keys.userLevel(id)))
      .filter((level): level is Level => level !== undefined)
    return [...this.seedLevels, ...userLevels]
  }

  getById(id: string): Level | undefined {
    const seed = this.seedLevels.find((level) => level.id === id)
    if (seed) return seed
    return readItem<Level>(keys.userLevel(id))
  }

  saveUserLevel(level: Level): void {
    writeItem(keys.userLevel(level.id), level)
    const ids = this.getUserLevelIds()
    if (!ids.includes(level.id)) {
      this.setUserLevelIds([...ids, level.id])
    }
  }

  deleteUserLevel(id: string): void {
    removeItem(keys.userLevel(id))
    this.setUserLevelIds(this.getUserLevelIds().filter((existingId) => existingId !== id))
  }
}
