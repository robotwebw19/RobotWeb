import type { RobotConfig } from '../../types/domain'
import { readItem, writeItem } from '../storage/localStorageClient'
import { keys } from '../storage/keys'
import type { IRobotRepository } from './IRobotRepository'

export class LocalRobotRepository implements IRobotRepository {
  getByStudentId(studentId: string): RobotConfig | undefined {
    return readItem<RobotConfig>(keys.robot(studentId))
  }

  save(studentId: string, config: RobotConfig): void {
    writeItem(keys.robot(studentId), config)
  }
}
