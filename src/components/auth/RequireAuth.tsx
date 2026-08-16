import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const isLoading = useAuthStore((state) => state.isLoading)
  if (isLoading) {
    return null
  }
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
