import type { UserCode } from '../../types/domain'
import { readItem, writeItem } from '../storage/localStorageClient'
import { keys } from '../storage/keys'
import type { IUserCodeRepository } from './IUserCodeRepository'

export class LocalUserCodeRepository implements IUserCodeRepository {
  get(studentId: string, levelId: string): UserCode | undefined {
    return readItem<UserCode>(keys.userCode(studentId, levelId))
  }

  save(userCode: UserCode): void {
    writeItem(keys.userCode(userCode.studentId, userCode.levelId), userCode)
  }
}
