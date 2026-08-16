import { beforeEach, describe, expect, it } from 'vitest'
import { getGlobalLeaderboard, getLevelLeaderboard, getStudentStats } from './leaderboardAggregation'
import { userRepository, levelResultRepository } from '../../data'
import type { Level, User } from '../../types/domain'

beforeEach(() => {
  localStorage.clear()
})

const fixtureLevel = (id: string): Level => ({
  id,
  name: id,
  difficulty: 'beginner',
  trackPath: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 0, y: 0, headingDeg: 0 },
  finishZone: { x: 100, y: 0, radius: 10 },
  timeLimitMs: 30_000,
  parConditions: { threeStarTimeMs: 5000, twoStarTimeMs: 10_000, maxOffTrackEventsForThreeStars: 0 },
})

const fixtureUser = (studentId: string, displayName: string): User => ({
  studentId,
  displayName,
  robotConfig: { name: 'Bot', sensors: [], motors: [] },
  createdAt: '2026-08-16T00:00:00.000Z',
})

describe('getLevelLeaderboard', () => {
  it('ranks each student by their fastest passed attempt, hiding studentId from display', () => {
    userRepository.save(fixtureUser('11111', 'Ada'))
    userRepository.save(fixtureUser('22222', 'Grace'))
    levelResultRepository.save({ studentId: '11111', levelId: 'l1', completionTimeMs: 9000, stars: 2, passed: true, submittedAt: 't1' })
    levelResultRepository.save({ studentId: '11111', levelId: 'l1', completionTimeMs: 6000, stars: 3, passed: true, submittedAt: 't2' })
    levelResultRepository.save({ studentId: '22222', levelId: 'l1', completionTimeMs: 7000, stars: 2, passed: true, submittedAt: 't3' })
    levelResultRepository.save({ studentId: '22222', levelId: 'l1', completionTimeMs: 20_000, stars: 0, passed: false, submittedAt: 't4' })

    const rows = getLevelLeaderboard('l1')
    expect(rows).toEqual([
      { studentId: '11111', displayName: 'Ada', bestTimeMs: 6000, stars: 3, completedAt: 't2' },
      { studentId: '22222', displayName: 'Grace', bestTimeMs: 7000, stars: 2, completedAt: 't3' },
    ])
  })

  it('falls back to a placeholder name if the user record is missing', () => {
    levelResultRepository.save({ studentId: '99999', levelId: 'l1', completionTimeMs: 5000, stars: 1, passed: true, submittedAt: 't1' })
    expect(getLevelLeaderboard('l1')[0].displayName).toBe('Unknown player')
  })
})

describe('getGlobalLeaderboard', () => {
  it('sums stars across each student best per level', () => {
    userRepository.save(fixtureUser('11111', 'Ada'))
    const levels = [fixtureLevel('l1'), fixtureLevel('l2')]
    levelResultRepository.save({ studentId: '11111', levelId: 'l1', completionTimeMs: 5000, stars: 3, passed: true, submittedAt: 't1' })
    levelResultRepository.save({ studentId: '11111', levelId: 'l2', completionTimeMs: 5000, stars: 2, passed: true, submittedAt: 't2' })

    const rows = getGlobalLeaderboard(levels)
    expect(rows).toEqual([{ studentId: '11111', displayName: 'Ada', totalStars: 5, levelsPassed: 2 }])
  })

  it('orders by total stars then levels passed', () => {
    userRepository.save(fixtureUser('11111', 'Ada'))
    userRepository.save(fixtureUser('22222', 'Grace'))
    const levels = [fixtureLevel('l1'), fixtureLevel('l2')]
    levelResultRepository.save({ studentId: '11111', levelId: 'l1', completionTimeMs: 5000, stars: 3, passed: true, submittedAt: 't1' })
    levelResultRepository.save({ studentId: '22222', levelId: 'l1', completionTimeMs: 5000, stars: 1, passed: true, submittedAt: 't2' })
    levelResultRepository.save({ studentId: '22222', levelId: 'l2', completionTimeMs: 5000, stars: 2, passed: true, submittedAt: 't3' })

    const rows = getGlobalLeaderboard(levels)
    expect(rows.map((r) => r.displayName)).toEqual(['Grace', 'Ada'])
  })
})

describe('getStudentStats', () => {
  it('reports per-level best results and totals for one student', () => {
    const levels = [fixtureLevel('l1'), fixtureLevel('l2')]
    levelResultRepository.save({ studentId: '11111', levelId: 'l1', completionTimeMs: 4000, stars: 3, passed: true, submittedAt: 't1' })

    const stats = getStudentStats('11111', levels)
    expect(stats.totalStars).toBe(3)
    expect(stats.levelsPassed).toBe(1)
    expect(stats.perLevel[0].best?.stars).toBe(3)
    expect(stats.perLevel[1].best).toBeUndefined()
  })
})
