import type { User } from '../../types/domain'
import { readItem, writeItem, removeItem, listKeySuffixes } from '../storage/localStorageClient'
import { keys } from '../storage/keys'
import type { IUserRepository } from './IUserRepository'

export class LocalUserRepository implements IUserRepository {
  getById(studentId: string): User | undefined {
    return readItem<User>(keys.user(studentId))
  }

  getAll(): User[] {
    return listKeySuffixes(keys.userPrefix)
      .map((studentId) => this.getById(studentId))
      .filter((user): user is User => user !== undefined)
  }

  save(user: User): void {
    writeItem(keys.user(user.studentId), user)
  }

  delete(studentId: string): void {
    removeItem(keys.user(studentId))
  }
}
