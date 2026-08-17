import type { User } from '../../types/domain'

export interface IUserRepository {
  getById(studentId: string): Promise<User | undefined>
  getAll(): Promise<User[]>
  /** Batch lookup — one round trip instead of N getById calls when rendering a list of users. */
  getByIds(studentIds: string[]): Promise<User[]>
  save(user: User): Promise<void>
  delete(studentId: string): Promise<void>
}
