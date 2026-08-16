import { describe, expect, it } from 'vitest'
import { SupabaseUserRepository } from './SupabaseUserRepository'
import { SupabaseRobotRepository } from './SupabaseRobotRepository'
import { SupabaseLevelRepository } from './SupabaseLevelRepository'
import { SupabaseUserCodeRepository } from './SupabaseUserCodeRepository'
import { SupabaseLevelResultRepository } from './SupabaseLevelResultRepository'
import type { Level, LevelResult, RobotConfig, User } from '../../types/domain'

describe('SupabaseUserRepository', () => {
  it('returns undefined for an unknown studentId', async () => {
    expect(await new SupabaseUserRepository().getById('12345')).toBeUndefined()
  })

  it('lists all saved users and omits deleted ones', async () => {
    const repo = new SupabaseUserRepository()
    await repo.save({ studentId: '11111', displayName: 'Ada', robotConfig: { name: 'Bot', sensors: [], motors: [] }, createdAt: 't' })
    await repo.save({ studentId: '22222', displayName: 'Grace', robotConfig: { name: 'Bot', sensors: [], motors: [] }, createdAt: 't' })

    expect((await repo.getAll()).map((u) => u.studentId).sort()).toEqual(['11111', '22222'])

    await repo.delete('11111')
    expect((await repo.getAll()).map((u) => u.studentId)).toEqual(['22222'])
    expect(await repo.getById('11111')).toBeUndefined()
  })

  it('round-trips a saved user', async () => {
    const repo = new SupabaseUserRepository()
    const user: User = {
      studentId: '12345',
      displayName: 'Ada',
      robotConfig: { name: 'Bot', sensors: [], motors: [] },
      createdAt: '2026-08-16T00:00:00.000Z',
    }
    await repo.save(user)
    expect(await repo.getById('12345')).toEqual(user)
  })
})

describe('SupabaseRobotRepository', () => {
  it('round-trips a saved robot config (backed by users.robot_config)', async () => {
    const userRepo = new SupabaseUserRepository()
    await userRepo.save({ studentId: '12345', displayName: 'Ada', robotConfig: { name: 'Bot', sensors: [], motors: [] }, createdAt: 't' })

    const repo = new SupabaseRobotRepository()
    const config: RobotConfig = {
      name: 'Bot',
      sensors: [{ id: 's1', type: 'ir', pin: 'A0', position: { x: 0, y: 10 } }],
      motors: [],
    }
    await repo.save('12345', config)
    expect(await repo.getByStudentId('12345')).toEqual(config)
  })
})

const fixtureLevel = (id: string): Level => ({
  id,
  name: `Level ${id}`,
  difficulty: 'beginner',
  trackPath: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 0, y: 0, headingDeg: 0 },
  finishZone: { x: 100, y: 0, radius: 10 },
  timeLimitMs: 30000,
  parConditions: { threeStarTimeMs: 5000, twoStarTimeMs: 10000, maxOffTrackEventsForThreeStars: 0 },
})

describe('SupabaseLevelRepository', () => {
  it('includes seed levels in getAll and getById', async () => {
    const repo = new SupabaseLevelRepository([fixtureLevel('seed-1')])
    expect((await repo.getAll()).map((l) => l.id)).toEqual(['seed-1'])
    expect((await repo.getById('seed-1'))?.name).toBe('Level seed-1')
  })

  it('saves, lists, and deletes user-created levels alongside seed levels', async () => {
    const repo = new SupabaseLevelRepository([fixtureLevel('seed-1')])
    const userLevel = fixtureLevel('user-1')
    await repo.saveUserLevel(userLevel)

    expect((await repo.getAll()).map((l) => l.id)).toEqual(['seed-1', 'user-1'])
    expect(await repo.getById('user-1')).toEqual(userLevel)

    await repo.deleteUserLevel('user-1')
    expect((await repo.getAll()).map((l) => l.id)).toEqual(['seed-1'])
    expect(await repo.getById('user-1')).toBeUndefined()
  })
})

describe('SupabaseUserCodeRepository', () => {
  it('round-trips saved code keyed by studentId + levelId', async () => {
    const repo = new SupabaseUserCodeRepository()
    await repo.save({
      studentId: '12345',
      levelId: 'level-1',
      sourceCode: 'void setup() {}\nvoid loop() {}',
      updatedAt: '2026-08-16T00:00:00.000Z',
    })
    expect((await repo.get('12345', 'level-1'))?.sourceCode).toContain('void setup')
    expect(await repo.get('12345', 'other-level')).toBeUndefined()
  })
})

describe('SupabaseLevelResultRepository', () => {
  const result = (overrides: Partial<LevelResult>): LevelResult => ({
    studentId: '12345',
    levelId: 'level-1',
    completionTimeMs: 8000,
    stars: 2,
    passed: true,
    submittedAt: '2026-08-16T00:00:00.000Z',
    ...overrides,
  })

  it('appends results per level and lists them via getForLevel', async () => {
    const repo = new SupabaseLevelResultRepository()
    await repo.save(result({ studentId: '11111', completionTimeMs: 9000 }))
    await repo.save(result({ studentId: '22222', completionTimeMs: 7000 }))

    const results = await repo.getForLevel('level-1')
    expect(results).toHaveLength(2)
    expect(results.map((r) => r.studentId)).toEqual(['11111', '22222'])
  })

  it('aggregates a single user across levels via getForUser', async () => {
    const repo = new SupabaseLevelResultRepository()
    await repo.save(result({ levelId: 'level-1' }))
    await repo.save(result({ levelId: 'level-2' }))
    await repo.save(result({ studentId: 'someone-else', levelId: 'level-2' }))

    expect((await repo.getForUser('12345')).map((r) => r.levelId).sort()).toEqual(['level-1', 'level-2'])
  })

  it('picks the fastest passed attempt as the best result', async () => {
    const repo = new SupabaseLevelResultRepository()
    await repo.save(result({ completionTimeMs: 9000 }))
    await repo.save(result({ completionTimeMs: 6000 }))
    await repo.save(result({ completionTimeMs: 12000, passed: false }))

    expect((await repo.getBestForUserLevel('12345', 'level-1'))?.completionTimeMs).toBe(6000)
  })

  it('returns undefined when the user has no passed attempt', async () => {
    const repo = new SupabaseLevelResultRepository()
    await repo.save(result({ passed: false }))
    expect(await repo.getBestForUserLevel('12345', 'level-1')).toBeUndefined()
  })
})
