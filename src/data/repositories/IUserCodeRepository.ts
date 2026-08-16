import type { UserCode } from '../../types/domain'

export interface IUserCodeRepository {
  get(studentId: string, levelId: string): Promise<UserCode | undefined>
  save(userCode: UserCode): Promise<void>
}
