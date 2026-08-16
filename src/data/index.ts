import { SupabaseUserRepository } from './repositories/SupabaseUserRepository'
import { SupabaseRobotRepository } from './repositories/SupabaseRobotRepository'
import { SupabaseLevelRepository } from './repositories/SupabaseLevelRepository'
import { SupabaseUserCodeRepository } from './repositories/SupabaseUserCodeRepository'
import { SupabaseLevelResultRepository } from './repositories/SupabaseLevelResultRepository'
import { seedLevels } from './seedLevels'

export type { IUserRepository } from './repositories/IUserRepository'
export type { IRobotRepository } from './repositories/IRobotRepository'
export type { ILevelRepository } from './repositories/ILevelRepository'
export type { IUserCodeRepository } from './repositories/IUserCodeRepository'
export type { ILevelResultRepository } from './repositories/ILevelResultRepository'

// Composition root: this is the ONLY place that wires concrete repository
// implementations. To swap the backend again later, write new Api*Repository
// classes implementing the same I*Repository interfaces and change only the
// instantiations below — no consumer imports change.
export const userRepository = new SupabaseUserRepository()
export const robotRepository = new SupabaseRobotRepository()
export const levelRepository = new SupabaseLevelRepository(seedLevels)
export const userCodeRepository = new SupabaseUserCodeRepository()
export const levelResultRepository = new SupabaseLevelResultRepository()
