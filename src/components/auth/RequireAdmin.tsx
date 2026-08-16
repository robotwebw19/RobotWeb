import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const isLoading = useAuthStore((state) => state.isLoading)
  if (isLoading) {
    return null
  }
  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
