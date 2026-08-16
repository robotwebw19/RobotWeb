import type { User } from '../../types/domain'

export interface IUserRepository {
  getById(studentId: string): Promise<User | undefined>
  getAll(): Promise<User[]>
  save(user: User): Promise<void>
  delete(studentId: string): Promise<void>
}
