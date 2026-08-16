import { beforeEach, describe, expect, it } from 'vitest'
import { LocalUserRepository } from './LocalUserRepository'
import { LocalRobotRepository } from './LocalRobotRepository'
import { LocalLevelRepository } from './LocalLevelRepository'
import { LocalUserCodeRepository } from './LocalUserCodeRepository'
import { LocalLevelResultRepository } from './LocalLevelResultRepository'
import type { Level, LevelResult, RobotConfig, User } from '../../types/domain'

beforeEach(() => {
  localStorage.clear()
})

describe('LocalUserRepository', () => {
  it('returns undefined for an unknown studentId', () => {
    expect(new LocalUserRepository().getById('12345')).toBeUndefined()
  })

  it('lists all saved users and omits deleted ones', () => {
    const repo = new LocalUserRepository()
    repo.save({ studentId: '11111', displayName: 'Ada', robotConfig: { name: 'Bot', sensors: [], motors: [] }, createdAt: 't' })
    repo.save({ studentId: '22222', displayName: 'Grace', robotConfig: { name: 'Bot', sensors: [], motors: [] }, createdAt: 't' })

    expect(repo.getAll().map((u) => u.studentId).sort()).toEqual(['11111', '22222'])

    repo.delete('11111')
    expect(repo.getAll().map((u) => u.studentId)).toEqual(['22222'])
    expect(repo.getById('11111')).toBeUndefined()
  })

  it('round-trips a saved user', () => {
    const repo = new LocalUserRepository()
    const user: User = {
      studentId: '12345',
      displayName: 'Ada',
      robotConfig: { name: 'Bot', sensors: [], motors: [] },
      createdAt: '2026-08-16T00:00:00.000Z',
    }
    repo.save(user)
    expect(repo.getById('12345')).toEqual(user)
  })
})

describe('LocalRobotRepository', () => {
  it('round-trips a saved robot config', () => {
    const repo = new LocalRobotRepository()
    const config: RobotConfig = {
      name: 'Bot',
      sensors: [{ id: 's1', type: 'ir', pin: 'A0', position: { x: 0, y: 10 } }],
      motors: [],
    }
    repo.save('12345', config)
    expect(repo.getByStudentId('12345')).toEqual(config)
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

describe('LocalLevelRepository', () => {
  it('includes seed levels in getAll and getById', () => {
    const repo = new LocalLevelRepository([fixtureLevel('seed-1')])
    expect(repo.getAll().map((l) => l.id)).toEqual(['seed-1'])
    expect(repo.getById('seed-1')?.name).toBe('Level seed-1')
  })

  it('saves, lists, and deletes user-created levels alongside seed levels', () => {
    const repo = new LocalLevelRepository([fixtureLevel('seed-1')])
    const userLevel = fixtureLevel('user-1')
    repo.saveUserLevel(userLevel)

    expect(repo.getAll().map((l) => l.id)).toEqual(['seed-1', 'user-1'])
    expect(repo.getById('user-1')).toEqual(userLevel)

    repo.deleteUserLevel('user-1')
    expect(repo.getAll().map((l) => l.id)).toEqual(['seed-1'])
    expect(repo.getById('user-1')).toBeUndefined()
  })
})

describe('LocalUserCodeRepository', () => {
  it('round-trips saved code keyed by studentId + levelId', () => {
    const repo = new LocalUserCodeRepository()
    repo.save({
      studentId: '12345',
      levelId: 'level-1',
      sourceCode: 'void setup() {}\nvoid loop() {}',
      updatedAt: '2026-08-16T00:00:00.000Z',
    })
    expect(repo.get('12345', 'level-1')?.sourceCode).toContain('void setup')
    expect(repo.get('12345', 'other-level')).toBeUndefined()
  })
})

describe('LocalLevelResultRepository', () => {
  const result = (overrides: Partial<LevelResult>): LevelResult => ({
    studentId: '12345',
    levelId: 'level-1',
    completionTimeMs: 8000,
    stars: 2,
    passed: true,
    submittedAt: '2026-08-16T00:00:00.000Z',
    ...overrides,
  })

  it('appends results per level and lists them via getForLevel', () => {
    const repo = new LocalLevelResultRepository()
    repo.save(result({ studentId: '11111', completionTimeMs: 9000 }))
    repo.save(result({ studentId: '22222', completionTimeMs: 7000 }))

    const results = repo.getForLevel('level-1')
    expect(results).toHaveLength(2)
    expect(results.map((r) => r.studentId)).toEqual(['11111', '22222'])
  })

  it('aggregates a single user across levels via getForUser', () => {
    const repo = new LocalLevelResultRepository()
    repo.save(result({ levelId: 'level-1' }))
    repo.save(result({ levelId: 'level-2' }))
    repo.save(result({ studentId: 'someone-else', levelId: 'level-2' }))

    expect(repo.getForUser('12345').map((r) => r.levelId).sort()).toEqual(['level-1', 'level-2'])
  })

  it('picks the fastest passed attempt as the best result', () => {
    const repo = new LocalLevelResultRepository()
    repo.save(result({ completionTimeMs: 9000 }))
    repo.save(result({ completionTimeMs: 6000 }))
    repo.save(result({ completionTimeMs: 12000, passed: false }))

    expect(repo.getBestForUserLevel('12345', 'level-1')?.completionTimeMs).toBe(6000)
  })

  it('returns undefined when the user has no passed attempt', () => {
    const repo = new LocalLevelResultRepository()
    repo.save(result({ passed: false }))
    expect(repo.getBestForUserLevel('12345', 'level-1')).toBeUndefined()
  })
})
