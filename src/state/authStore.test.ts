import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'
import { readItem } from '../data/storage/localStorageClient'
import { keys } from '../data/storage/keys'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: null, isAdmin: false, pendingStudentId: null })
})

describe('authStore', () => {
  it('login with an unknown studentId sets pendingStudentId and returns "new"', () => {
    const result = useAuthStore.getState().login('11111')
    expect(result).toBe('new')
    expect(useAuthStore.getState().pendingStudentId).toBe('11111')
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('completeOnboarding saves the user + robot and clears pendingStudentId', () => {
    useAuthStore.getState().login('11111')
    useAuthStore.getState().completeOnboarding('Ada', { name: 'Bot', sensors: [], motors: [] })
    const state = useAuthStore.getState()
    expect(state.user?.displayName).toBe('Ada')
    expect(state.user?.studentId).toBe('11111')
    expect(state.pendingStudentId).toBeNull()
  })

  it('login with a returning studentId returns "known" and restores the saved user', () => {
    useAuthStore.getState().login('22222')
    useAuthStore.getState().completeOnboarding('Grace', { name: 'Bot', sensors: [], motors: [] })
    useAuthStore.getState().logout()

    const result = useAuthStore.getState().login('22222')
    expect(result).toBe('known')
    expect(useAuthStore.getState().user?.displayName).toBe('Grace')
  })

  it('completeOnboarding throws when there is no pending studentId', () => {
    expect(() =>
      useAuthStore.getState().completeOnboarding('X', { name: 'Bot', sensors: [], motors: [] }),
    ).toThrow()
  })

  it('logout clears the current user', () => {
    useAuthStore.getState().login('33333')
    useAuthStore.getState().completeOnboarding('Grace', { name: 'Bot', sensors: [], motors: [] })
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

  it('a student login after an admin session clears admin state, and vice versa', () => {
    useAuthStore.getState().loginAsAdmin('superurrwnm')
    expect(useAuthStore.getState().isAdmin).toBe(true)

    useAuthStore.getState().login('44444')
    useAuthStore.getState().completeOnboarding('Lin', { name: 'Bot', sensors: [], motors: [] })
    expect(useAuthStore.getState().isAdmin).toBe(false)
    expect(useAuthStore.getState().user?.displayName).toBe('Lin')
  })

  it('persists the admin session flag to storage on login', () => {
    useAuthStore.getState().loginAsAdmin('superurrwnm')
    expect(readItem<boolean>(keys.adminSession)).toBe(true)
  })
})
