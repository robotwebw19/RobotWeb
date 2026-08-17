import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore, type OnboardingProfile } from './authStore'
import { readItem } from '../data/storage/localStorageClient'
import { keys } from '../data/storage/keys'

function profileFor(firstName: string): OnboardingProfile {
  return { prefix: 'นาย', firstName, lastName: 'Lovelace', grade: 'ม.1', classroom: '1', studentNumber: '1' }
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: null, isAdmin: false, isLoading: false, pendingStudentId: null })
})

describe('authStore', () => {
  it('login with an unknown studentId sets pendingStudentId and returns "new"', async () => {
    const result = await useAuthStore.getState().login('11111')
    expect(result).toBe('new')
    expect(useAuthStore.getState().pendingStudentId).toBe('11111')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('completeOnboarding saves the user + robot and clears pendingStudentId', async () => {
    await useAuthStore.getState().login('11111')
    await useAuthStore.getState().completeOnboarding(profileFor('Ada'), { sensors: [], motors: [] })
    const state = useAuthStore.getState()
    expect(state.user?.displayName).toBe('Ada Lovelace')
    expect(state.user?.studentId).toBe('11111')
    expect(state.pendingStudentId).toBeNull()
  })

  it('login with a returning studentId returns "known" and restores the saved user', async () => {
    await useAuthStore.getState().login('22222')
    await useAuthStore.getState().completeOnboarding(profileFor('Grace'), { sensors: [], motors: [] })
    useAuthStore.getState().logout()

    const result = await useAuthStore.getState().login('22222')
    expect(result).toBe('known')
    expect(useAuthStore.getState().user?.displayName).toBe('Grace Lovelace')
  })

  it('completeOnboarding throws when there is no pending studentId', async () => {
    await expect(
      useAuthStore.getState().completeOnboarding(profileFor('X'), { sensors: [], motors: [] }),
    ).rejects.toThrow()
  })

  it('logout clears the current user', async () => {
    await useAuthStore.getState().login('33333')
    await useAuthStore.getState().completeOnboarding(profileFor('Grace'), { sensors: [], motors: [] })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('loginAsAdmin succeeds only for the admin username, case-insensitively, and sets no student user', () => {
    expect(useAuthStore.getState().loginAsAdmin('SuperUrrwnm')).toBe(true)
    expect(useAuthStore.getState().isAdmin).toBe(true)
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('loginAsAdmin rejects anything else without side effects', () => {
    expect(useAuthStore.getState().loginAsAdmin('not-the-admin')).toBe(false)
    expect(useAuthStore.getState().isAdmin).toBe(false)
  })

  it('a student login after an admin session clears admin state, and vice versa', async () => {
    useAuthStore.getState().loginAsAdmin('superurrwnm')
    expect(useAuthStore.getState().isAdmin).toBe(true)

    await useAuthStore.getState().login('44444')
    await useAuthStore.getState().completeOnboarding(profileFor('Lin'), { sensors: [], motors: [] })
    expect(useAuthStore.getState().isAdmin).toBe(false)
    expect(useAuthStore.getState().user?.displayName).toBe('Lin Lovelace')
  })

  it('persists the admin session flag to storage on login', () => {
    useAuthStore.getState().loginAsAdmin('superurrwnm')
    expect(readItem<boolean>(keys.adminSession)).toBe(true)
  })
})
