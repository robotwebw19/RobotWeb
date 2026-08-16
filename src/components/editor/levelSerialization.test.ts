import { describe, expect, it } from 'vitest'
import { exportLevelToJson, importLevelFromJson } from './levelSerialization'
import type { Level } from '../../types/domain'

const level: Level = {
  id: 'user-abc123',
  name: 'My Level',
  difficulty: 'medium',
  trackPath: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]],
  obstacles: [{ x: 50, y: 0, radius: 10 }],
  colorZones: [{ x: 20, y: 0, radius: 10, color: 'red' }],
  startPosition: { x: 0, y: 0, headingDeg: 0 },
  finishZone: { x: 100, y: 0, radius: 24 },
  timeLimitMs: 30_000,
  parConditions: { threeStarTimeMs: 10_000, twoStarTimeMs: 18_000, maxOffTrackEventsForThreeStars: 1 },
}

describe('level import/export', () => {
  it('round-trips a level through JSON', () => {
    expect(importLevelFromJson(exportLevelToJson(level))).toEqual(level)
  })

  it('rejects invalid JSON with a clear error', () => {
    expect(() => importLevelFromJson('{not json')).toThrow(/not valid JSON/)
  })

  it('rejects well-formed JSON missing required level fields', () => {
    expect(() => importLevelFromJson(JSON.stringify({ id: 'x', name: 'x' }))).toThrow(/does not look like a level/)
  })

  it('rejects a trackPath with malformed points', () => {
    const broken = { ...level, trackPath: [[{ x: 0 }]] }
    expect(() => importLevelFromJson(JSON.stringify(broken))).toThrow(/does not look like a level/)
  })
})
