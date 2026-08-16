import { LocalUserRepository } from './repositories/LocalUserRepository'
import { LocalRobotRepository } from './repositories/LocalRobotRepository'
import { LocalLevelRepository } from './repositories/LocalLevelRepository'
import { LocalUserCodeRepository } from './repositories/LocalUserCodeRepository'
import { LocalLevelResultRepository } from './repositories/LocalLevelResultRepository'
import { seedLevels } from './seedLevels'

export type { IUserRepository } from './repositories/IUserRepository'
export type { IRobotRepository } from './repositories/IRobotRepository'
export type { ILevelRepository } from './repositories/ILevelRepository'
export type { IUserCodeRepository } from './repositories/IUserCodeRepository'
export type { ILevelResultRepository } from './repositories/ILevelResultRepository'

// Composition root: this is the ONLY place that wires concrete repository
// implementations. To swap localStorage for a real backend later, write
// Api*Repository classes implementing the same I*Repository interfaces and
// change only the instantiations below — no consumer imports change.
export const userRepository = new LocalUserRepository()
export const robotRepository = new LocalRobotRepository()
export const levelRepository = new LocalLevelRepository(seedLevels)
export const userCodeRepository = new LocalUserCodeRepository()
export const levelResultRepository = new LocalLevelResultRepository()
