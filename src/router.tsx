import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './components/auth/LoginPage'
import { NewUserOnboarding } from './components/auth/NewUserOnboarding'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireAdmin } from './components/auth/RequireAdmin'
import { MainAppPage, LeaderboardPage, ProfilePage, AdminDashboard, AdminStudentsPage } from './lazyPages'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/onboarding', element: <NewUserOnboarding /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Suspense fallback={null}>
          <MainAppPage />
        </Suspense>
      </RequireAuth>
    ),
  },
  {
    path: '/leaderboard',
    element: (
      <RequireAuth>
        <Suspense fallback={null}>
          <LeaderboardPage />
        </Suspense>
      </RequireAuth>
    ),
  },
  {
    path: '/profile',
    element: (
      <RequireAuth>
        <Suspense fallback={null}>
          <ProfilePage />
        </Suspense>
      </RequireAuth>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <Suspense fallback={null}>
          <AdminDashboard />
        </Suspense>
      </RequireAdmin>
    ),
  },
  {
    path: '/admin/students',
    element: (
      <RequireAdmin>
        <Suspense fallback={null}>
          <AdminStudentsPage />
        </Suspense>
      </RequireAdmin>
    ),
  },
])
