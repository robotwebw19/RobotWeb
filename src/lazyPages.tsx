import { lazy } from 'react'

// Code-split the heavy per-route screens (MainAppPage alone pulls in the Monaco editor) so
// /login, /leaderboard, /profile, and /admin don't each pay for every other route's bundle.
// Kept in their own module (rather than router.tsx) because a file mixing component exports
// with the non-component `router` export breaks React Fast Refresh.
export const MainAppPage = lazy(() =>
  import('./components/layout/MainAppPage').then((m) => ({ default: m.MainAppPage })),
)
export const LeaderboardPage = lazy(() =>
  import('./components/leaderboard/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })),
)
export const ProfilePage = lazy(() =>
  import('./components/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
export const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
)
export const AdminStudentsPage = lazy(() =>
  import('./components/admin/AdminStudentsPage').then((m) => ({ default: m.AdminStudentsPage })),
)
