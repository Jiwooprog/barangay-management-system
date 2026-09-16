import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/auth-context"

export function ResidentDashboardPage() {
    const { user, signOut } = useAuth()

    return (
        <main className="min-h-screen p-8">
            <h1 className="text-3xl font-bold">
                Resident Portal
            </h1>

            <p className="mt-4">
                Welcome, {user?.email}
            </p>

            <Button
                variant="outline"
                className="mt-6"
                onClick={() => void signOut()}
            >
                Logout
            </Button>
        </main>
    )
}