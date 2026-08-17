import type { RobotConfig, StudentPrefix, User } from '../../types/domain'
import { supabase } from '../supabaseClient'
import type { IUserRepository } from './IUserRepository'

interface UserRow {
  student_id: string
  display_name: string
  prefix: StudentPrefix
  first_name: string
  last_name: string
  grade: string
  classroom: string
  student_number: string
  robot_config: RobotConfig
  created_at: string
}

function toDomain(row: UserRow): User {
  return {
    studentId: row.student_id,
    displayName: row.display_name,
    prefix: row.prefix,
    firstName: row.first_name,
    lastName: row.last_name,
    grade: row.grade,
    classroom: row.classroom,
    studentNumber: row.student_number,
    robotConfig: row.robot_config,
    createdAt: row.created_at,
  }
}

export class SupabaseUserRepository implements IUserRepository {
  async getById(studentId: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('student_id', studentId).maybeSingle()
    if (error) throw error
    return data ? toDomain(data) : undefined
  }

  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(toDomain)
  }

  async save(user: User): Promise<void> {
    const { error } = await supabase.from('users').upsert({
      student_id: user.studentId,
      display_name: user.displayName,
      prefix: user.prefix,
      first_name: user.firstName,
      last_name: user.lastName,
      grade: user.grade,
      classroom: user.classroom,
      student_number: user.studentNumber,
      robot_config: user.robotConfig,
      created_at: user.createdAt,
    })
    if (error) throw error
  }

  async delete(studentId: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('student_id', studentId)
    if (error) throw error
  }
}
