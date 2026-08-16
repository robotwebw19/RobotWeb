import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminLevelsTab } from './AdminLevelsTab'
import { AdminStudentsTab } from './AdminStudentsTab'
import { levelRepository, userRepository } from '../../data'
import type { Level, User } from '../../types/domain'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

const userLevel: Level = {
  id: 'user-abc',
  name: 'Community Level',
  difficulty: 'medium',
  trackPath: [[{ x: 0, y: 0 }, { x: 10, y: 0 }]],
  obstacles: [],
  colorZones: [],
  startPosition: { x: 0, y: 0, headingDeg: 0 },
  finishZone: { x: 10, y: 0, radius: 5 },
  timeLimitMs: 10_000,
  parConditions: { threeStarTimeMs: 1000, twoStarTimeMs: 2000, maxOffTrackEventsForThreeStars: 0 },
  createdBy: '11111',
}

describe('AdminLevelsTab', () => {
  it('shows built-in levels with their solution code and lets admin delete only user-created ones', () => {
    levelRepository.saveUserLevel(userLevel)
    render(<AdminLevelsTab />)

    // First seed level is selected by default and shows its solution code.
    expect(screen.getByRole('heading', { name: /1\. เส้นตรง/ })).toBeInTheDocument()
    expect(screen.getByText(/pinMode\(A0, INPUT\)/)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Community Level'))
    expect(screen.getByRole('button', { name: 'ลบด่าน' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'ลบด่าน' }))
    expect(levelRepository.getById('user-abc')).toBeUndefined()
    expect(screen.queryByText('Community Level')).not.toBeInTheDocument()
  })
})

describe('AdminStudentsTab', () => {
  const student: User = {
    studentId: '22222',
    displayName: 'Ada',
    robotConfig: { name: 'Bot', sensors: [], motors: [] },
    createdAt: 't',
  }

  it('lists students and removes one on delete', () => {
    userRepository.save(student)
    render(<AdminStudentsTab />)

    expect(screen.getByText('Ada')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ลบนักเรียน' }))

    expect(userRepository.getById('22222')).toBeUndefined()
    expect(screen.queryByText('Ada')).not.toBeInTheDocument()
  })

  it('shows an empty state with no students', () => {
    render(<AdminStudentsTab />)
    expect(screen.getByText('ยังไม่มีนักเรียนเข้าสู่ระบบ')).toBeInTheDocument()
  })
})
