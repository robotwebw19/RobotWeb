import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
  it('shows built-in levels with their solution code and lets admin delete only user-created ones', async () => {
    await levelRepository.saveUserLevel(userLevel)
    render(<AdminLevelsTab />)

    // First seed level is selected by default and shows its solution code.
    expect(await screen.findByText(/pinMode\(D2, INPUT\)/)).toBeInTheDocument()

    fireEvent.click(await screen.findByText('Community Level'))
    expect(await screen.findByRole('button', { name: 'ลบด่าน' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'ลบด่าน' }))
    await waitFor(() => expect(screen.queryByText('Community Level')).not.toBeInTheDocument())
    expect(await levelRepository.getById('user-abc')).toBeUndefined()
  })
})

describe('AdminStudentsTab', () => {
  const student: User = {
    studentId: '22222',
    displayName: 'Ada',
    prefix: 'นางสาว',
    firstName: 'Ada',
    lastName: 'Test',
    grade: 'ม.1',
    classroom: '1',
    studentNumber: '1',
    robotConfig: { sensors: [], motors: [] },
    createdAt: 't',
  }

  it('lists students and removes one on delete', async () => {
    await userRepository.save(student)
    render(<AdminStudentsTab />)

    expect(await screen.findByText('Ada')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ลบนักเรียน' }))

    await waitFor(() => expect(screen.queryByText('Ada')).not.toBeInTheDocument())
    expect(await userRepository.getById('22222')).toBeUndefined()
  })

  it('edits a student profile in place', async () => {
    await userRepository.save(student)
    render(<AdminStudentsTab />)

    expect(await screen.findByText('Ada')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'แก้ไขนักเรียน' }))

    const firstNameInput = screen.getByLabelText('ชื่อ')
    fireEvent.change(firstNameInput, { target: { value: 'Grace' } })
    fireEvent.click(screen.getByRole('button', { name: 'บันทึก' }))

    expect(await screen.findByText('Grace')).toBeInTheDocument()
    expect((await userRepository.getById('22222'))?.displayName).toBe('Grace Test')
  })

  it('shows an empty state with no students', () => {
    render(<AdminStudentsTab />)
    expect(screen.getByText('ยังไม่มีนักเรียนเข้าสู่ระบบ')).toBeInTheDocument()
  })
})
