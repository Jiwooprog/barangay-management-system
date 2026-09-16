import { useState, type FormEvent } from "react"
import {
    Link,
    useNavigate,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/auth-context"

export function LoginPage() {
    const navigate = useNavigate()
    const { signIn } = useAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        setError("")
        setLoading(true)

        try {
            await signIn(
                email.trim(),
                password
            )

            navigate("/", {
                replace: true,
            })
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to sign in."
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">
                        Barangay Management System
                    </CardTitle>

                    <CardDescription>
                        Sign in to your account
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                required
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <Label htmlFor="password">
                                    Password
                                </Label>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                required
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
                            >
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    )
}