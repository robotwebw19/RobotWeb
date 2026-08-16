import type { RobotConfig } from '../../types/domain'

export interface IRobotRepository {
  getByStudentId(studentId: string): RobotConfig | undefined
  save(studentId: string, config: RobotConfig): void
}
