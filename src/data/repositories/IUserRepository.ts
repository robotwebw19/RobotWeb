import type { User } from '../../types/domain'

export interface IUserRepository {
  getById(studentId: string): User | undefined
  getAll(): User[]
  save(user: User): void
  delete(studentId: string): void
}
