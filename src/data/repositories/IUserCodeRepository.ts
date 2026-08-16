import type { UserCode } from '../../types/domain'

export interface IUserCodeRepository {
  get(studentId: string, levelId: string): UserCode | undefined
  save(userCode: UserCode): void
}
