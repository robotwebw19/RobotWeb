import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './components/auth/LoginPage'
import { NewUserOnboarding } from './components/auth/NewUserOnboarding'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireAdmin } from './components/auth/RequireAdmin'
import { MainAppPage } from './components/layout/MainAppPage'
import { LeaderboardPage } from './components/leaderboard/LeaderboardPage'
import { ProfilePage } from './components/profile/ProfilePage'
import { AdminDashboard } from './components/admin/AdminDashboard'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/onboarding', element: <NewUserOnboarding /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainAppPage />
      </RequireAuth>
    ),
  },
  {
    path: '/leaderboard',
    element: (
      <RequireAuth>
        <LeaderboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '/profile',
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminDashboard />
      </RequireAdmin>
    ),
  },
])
