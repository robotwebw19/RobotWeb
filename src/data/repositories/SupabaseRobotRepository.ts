import type { RobotConfig } from '../../types/domain'
import { supabase } from '../supabaseClient'
import type { IRobotRepository } from './IRobotRepository'

/** Backed by the same `users.robot_config` column IUserRepository writes — see data/index.ts. */
export class SupabaseRobotRepository implements IRobotRepository {
  async getByStudentId(studentId: string): Promise<RobotConfig | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('robot_config')
      .eq('student_id', studentId)
      .maybeSingle()
    if (error) throw error
    return data?.robot_config ?? undefined
  }

  async save(studentId: string, config: RobotConfig): Promise<void> {
    const { error } = await supabase.from('users').update({ robot_config: config }).eq('student_id', studentId)
    if (error) throw error
  }
}
