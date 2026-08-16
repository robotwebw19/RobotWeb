import type { UserCode } from '../../types/domain'
import { supabase } from '../supabaseClient'
import type { IUserCodeRepository } from './IUserCodeRepository'

interface UserCodeRow {
  student_id: string
  level_id: string
  source_code: string
  updated_at: string
}

function toDomain(row: UserCodeRow): UserCode {
  return {
    studentId: row.student_id,
    levelId: row.level_id,
    sourceCode: row.source_code,
    updatedAt: row.updated_at,
  }
}

export class SupabaseUserCodeRepository implements IUserCodeRepository {
  async get(studentId: string, levelId: string): Promise<UserCode | undefined> {
    const { data, error } = await supabase
      .from('user_code')
      .select('*')
      .eq('student_id', studentId)
      .eq('level_id', levelId)
      .maybeSingle()
    if (error) throw error
    return data ? toDomain(data) : undefined
  }

  async save(userCode: UserCode): Promise<void> {
    const { error } = await supabase.from('user_code').upsert({
      student_id: userCode.studentId,
      level_id: userCode.levelId,
      source_code: userCode.sourceCode,
      updated_at: userCode.updatedAt,
    })
    if (error) throw error
  }
}
