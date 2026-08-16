import type { RobotConfig } from '../../types/domain'

export interface IRobotRepository {
  getByStudentId(studentId: string): Promise<RobotConfig | undefined>
  save(studentId: string, config: RobotConfig): Promise<void>
}
