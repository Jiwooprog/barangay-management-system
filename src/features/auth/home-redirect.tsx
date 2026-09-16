import { Navigate } from "react-router-dom"

import { useAuth } from "@/features/auth/auth-context"

export function HomeRedirect() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (
    role === "super_admin" ||
    role === "barangay_staff"
  ) {
    return <Navigate to="/dashboard" replace />
  }

  if (role === "resident") {
    return (
      <Navigate
        to="/resident/dashboard"
        replace
      />
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      No role assigned to this account.
    </div>
  )
}