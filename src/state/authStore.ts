import { create } from 'zustand'
import type { RobotConfig, User } from '../types/domain'
import { userRepository, robotRepository } from '../data'
import { readItem, writeItem, removeItem } from '../data/storage/localStorageClient'
import { keys } from '../data/storage/keys'

const ADMIN_USERNAME = 'superurrwnm'

interface AuthState {
  user: User | null
  isAdmin: boolean
  /** studentId awaiting name + robot setup, set right after login() sees an unknown id. */
  pendingStudentId: string | null
  login: (studentId: string) => 'known' | 'new'
  loginAsAdmin: (username: string) => boolean
  completeOnboarding: (displayName: string, robotConfig: RobotConfig) => void
  updateRobotConfig: (robotConfig: RobotConfig) => void
  logout: () => void
}

function loadInitialAuthState(): { user: User | null; isAdmin: boolean } {
  if (readItem<boolean>(keys.adminSession)) {
    return { user: null, isAdmin: true }
  }
  const studentId = readItem<string>(keys.session)
  return { user: studentId ? (userRepository.getById(studentId) ?? null) : null, isAdmin: false }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadInitialAuthState(),
  pendingStudentId: null,

  login: (studentId) => {
    const existing = userRepository.getById(studentId)
    if (existing) {
      removeItem(keys.adminSession)
      writeItem(keys.session, studentId)
      set({ user: existing, isAdmin: false, pendingStudentId: null })
      return 'known'
    }
    set({ pendingStudentId: studentId, isAdmin: false })
    return 'new'
  },

  loginAsAdmin: (username) => {
    if (username.trim().toLowerCase() !== ADMIN_USERNAME) return false
    removeItem(keys.session)
    writeItem(keys.adminSession, true)
    set({ isAdmin: true, user: null, pendingStudentId: null })
    return true
  },

  completeOnboarding: (displayName, robotConfig) => {
    const studentId = get().pendingStudentId
    if (!studentId) {
      throw new Error('completeOnboarding called with no pending studentId')
    }
    const user: User = {
      studentId,
      displayName,
      robotConfig,
      createdAt: new Date().toISOString(),
    }
    userRepository.save(user)
    robotRepository.save(studentId, robotConfig)
    writeItem(keys.session, studentId)
    set({ user, pendingStudentId: null })
  },

  updateRobotConfig: (robotConfig) => {
    const currentUser = get().user
    if (!currentUser) {
      throw new Error('updateRobotConfig called with no signed-in user')
    }
    const updatedUser: User = { ...currentUser, robotConfig }
    userRepository.save(updatedUser)
    robotRepository.save(currentUser.studentId, robotConfig)
    set({ user: updatedUser })
  },

  logout: () => {
    removeItem(keys.session)
    removeItem(keys.adminSession)
    set({ user: null, isAdmin: false, pendingStudentId: null })
  },
}))
