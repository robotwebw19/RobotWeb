import { userCodeRepository } from '../../data'
import type { UserCode } from '../../types/domain'

export function loadSavedCode(studentId: string, levelId: string): string | null {
  return userCodeRepository.get(studentId, levelId)?.sourceCode ?? null
}

export function saveCode(studentId: string, levelId: string, sourceCode: string): void {
  const userCode: UserCode = {
    studentId,
    levelId,
    sourceCode,
    updatedAt: new Date().toISOString(),
  }
  userCodeRepository.save(userCode)
}
