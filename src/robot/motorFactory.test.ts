import { describe, expect, it } from 'vitest'
import { addMotor, removeMotor } from './motorFactory'

describe('addMotor', () => {
  it('adds the requested side with its fixed pins', () => {
    const motors = addMotor('left', [])
    expect(motors).toHaveLength(1)
    expect(motors[0]).toMatchObject({ side: 'left', in1Pin: 'IN1', in2Pin: 'IN2', enablePin: 'ENA' })
  })

  it('caps at one motor per side', () => {
    const first = addMotor('left', [])
    const second = addMotor('left', first)
    expect(second).toBe(first)
  })

  it('allows both sides simultaneously with distinct pins', () => {
    const motors = addMotor('right', addMotor('left', []))
    expect(motors.flatMap((m) => [m.in1Pin, m.in2Pin, m.enablePin]).sort()).toEqual(['ENA', 'ENB', 'IN1', 'IN2', 'IN3', 'IN4'])
  })
})

describe('removeMotor', () => {
  it('removes only the given side', () => {
    const motors = addMotor('right', addMotor('left', []))
    const remaining = removeMotor('left', motors)
    expect(remaining).toHaveLength(1)
    expect(remaining[0].side).toBe('right')
  })
})
