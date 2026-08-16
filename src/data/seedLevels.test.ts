import { describe, expect, it } from 'vitest'
import { seedLevels } from './seedLevels'
import { parseProgram } from '../interpreter/parser/parser'

describe('seedLevels solution code', () => {
  it('has 5 levels, each with solution code that parses cleanly', () => {
    expect(seedLevels).toHaveLength(5)
    for (const level of seedLevels) {
      expect(level.solutionCode, `${level.id} is missing solutionCode`).toBeTruthy()
      expect(() => parseProgram(level.solutionCode ?? ''), `${level.id} solution failed to parse`).not.toThrow()
    }
  })

  it('every level id is unique', () => {
    const ids = seedLevels.map((level) => level.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('lists required equipment with both motors and at least one sensor', () => {
    for (const level of seedLevels) {
      const equipment = level.requiredEquipment ?? []
      expect(equipment.length, `${level.id} is missing requiredEquipment`).toBeGreaterThan(0)
      expect(equipment.some((item) => item.kind === 'motor' && item.side === 'left'), `${level.id} missing left motor`).toBe(true)
      expect(equipment.some((item) => item.kind === 'motor' && item.side === 'right'), `${level.id} missing right motor`).toBe(true)
      expect(equipment.some((item) => item.kind === 'sensor'), `${level.id} missing at least one sensor`).toBe(true)
    }
  })

  it('has a finish zone reachable within the level canvas bounds', () => {
    for (const level of seedLevels) {
      expect(level.finishZone.x).toBeGreaterThan(0)
      expect(level.finishZone.y).toBeGreaterThan(0)
      expect(level.finishZone.radius).toBeGreaterThan(0)
    }
  })
})
