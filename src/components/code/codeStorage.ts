import { userCodeRepository } from '../../data'
import type { UserCode } from '../../types/domain'

export async function loadSavedCode(studentId: string, levelId: string): Promise<string | null> {
  const userCode = await userCodeRepository.get(studentId, levelId)
  return userCode?.sourceCode ?? null
}

export async function saveCode(studentId: string, levelId: string, sourceCode: string): Promise<void> {
  const userCode: UserCode = {
    studentId,
    levelId,
    sourceCode,
    updatedAt: new Date().toISOString(),
  }
  await userCodeRepository.save(userCode)
}
