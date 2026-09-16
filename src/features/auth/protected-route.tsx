import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAuth } from "@/features/auth/auth-context"
import type { UserRole } from "@/types/auth"

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: UserRole[]
}

export function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const { user, role, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">
                    Loading...
                </p>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (
        allowedRoles &&
        (!role || !allowedRoles.includes(role))
    ) {
        return <Navigate to="/" replace />
    }

    return children
}