import { create } from 'zustand'
import type { RobotConfig, User } from '../types/domain'
import { userRepository, robotRepository } from '../data'
import { readItem, writeItem, removeItem } from '../data/storage/localStorageClient'
import { keys } from '../data/storage/keys'

const ADMIN_USERNAME = 'superurrwnm'

interface AuthState {
  user: User | null
  isAdmin: boolean
  /** True until the initial session (if any) has finished loading from the backend. */
  isLoading: boolean
  /** studentId awaiting name + robot setup, set right after login() sees an unknown id. */
  pendingStudentId: string | null
  login: (studentId: string) => Promise<'known' | 'new'>
  loginAsAdmin: (username: string) => boolean
  completeOnboarding: (displayName: string, robotConfig: RobotConfig) => Promise<void>
  updateRobotConfig: (robotConfig: RobotConfig) => Promise<void>
  logout: () => void
}

// The session pointer (which studentId, or admin) lives in localStorage — only the user record
// itself now lives in the backend, so restoring a session needs one async fetch on load.
function loadInitialLocalSession(): { studentId: string | null; isAdmin: boolean } {
  if (readItem<boolean>(keys.adminSession)) {
    return { studentId: null, isAdmin: true }
  }
  return { studentId: readItem<string>(keys.session) ?? null, isAdmin: false }
}

const initialSession = loadInitialLocalSession()

export const useAuthStore = create<AuthState>((set, get) => {
  if (initialSession.studentId) {
    userRepository
      .getById(initialSession.studentId)
      .then((user) => set({ user: user ?? null, isLoading: false }))
      .catch(() => set({ isLoading: false }))
  }

  return {
    user: null,
    isAdmin: initialSession.isAdmin,
    isLoading: initialSession.studentId !== null,
    pendingStudentId: null,

    login: async (studentId) => {
      const existing = await userRepository.getById(studentId)
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

    completeOnboarding: async (displayName, robotConfig) => {
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
      await userRepository.save(user)
      await robotRepository.save(studentId, robotConfig)
      writeItem(keys.session, studentId)
      set({ user, pendingStudentId: null })
    },

    updateRobotConfig: async (robotConfig) => {
      const currentUser = get().user
      if (!currentUser) {
        throw new Error('updateRobotConfig called with no signed-in user')
      }
      const updatedUser: User = { ...currentUser, robotConfig }
      await userRepository.save(updatedUser)
      await robotRepository.save(currentUser.studentId, robotConfig)
      set({ user: updatedUser })
    },

    logout: () => {
      removeItem(keys.session)
      removeItem(keys.adminSession)
      set({ user: null, isAdmin: false, pendingStudentId: null })
    },
  }
})
