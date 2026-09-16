import {
    useState,
    type FormEvent,
} from "react"

import {
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react"

import {
    Link,
    useNavigate,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/features/auth/auth-context"

export function LoginPage() {
    const navigate = useNavigate()
    const { signIn } = useAuth()

    const [email, setEmail] =
        useState("")

    const [password, setPassword] =
        useState("")

    const [
        showPassword,
        setShowPassword,
    ] = useState(false)

    const [error, setError] =
        useState("")

    const [loading, setLoading] =
        useState(false)

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
        <main className="min-h-screen bg-slate-50">
            <div className="grid min-h-screen lg:grid-cols-2">
                {/* =========================================
                    BRANDING PANEL
                ========================================= */}

                <section className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 lg:flex lg:flex-col lg:justify-between">
                    {/* Decorative backgrounds */}

                    <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
                        {/* Top brand */}

                        <div className="flex items-center gap-3 text-white">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
                                <ShieldCheck className="h-5 w-5" />
                            </div>

                            <div>
                                <p className="font-semibold">
                                    Laoac
                                </p>

                                <p className="text-xs text-emerald-100/70">
                                    Barangay Management System
                                </p>
                            </div>
                        </div>

                        {/* Main branding */}

                        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                            <div className="mb-8 flex h-44 w-44 items-center justify-center rounded-full border border-white/20 bg-white p-3 shadow-2xl">
                                <img
                                    src="/barangay-logo.png"
                                    alt="Laoac Barangay Management System"
                                    className="h-full w-full rounded-full object-contain"
                                />
                            </div>

                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-medium text-amber-100">
                                <ShieldCheck className="h-4 w-4" />

                                Secure Barangay Information System
                            </div>

                            <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
                                Laoac Barangay
                                Management System
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-7 text-emerald-50/70">
                                A secure digital platform for
                                efficient barangay services,
                                resident management, records,
                                certificates, and community
                                administration.
                            </p>
                        </div>

                        {/* Bottom */}

                        <div className="flex items-center justify-between border-t border-white/10 pt-6 text-xs text-emerald-100/60">
                            <span>
                                People • Service • Progress
                            </span>

                            <span>
                                © 2026 Laoac BMS
                            </span>
                        </div>
                    </div>
                </section>

                {/* =========================================
                    LOGIN PANEL
                ========================================= */}

                <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}

                        <div className="mb-8 text-center lg:hidden">
                            <img
                                src="/barangay-logo.png"
                                alt="Laoac Barangay Management System"
                                className="mx-auto h-24 w-24 rounded-full object-contain"
                            />

                            <h1 className="mt-4 text-xl font-bold text-slate-900">
                                Laoac Barangay Management
                                System
                            </h1>
                        </div>

                        {/* Icon */}

                        <div className="mb-6 hidden h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 lg:flex">
                            <LockKeyhole className="h-6 w-6" />
                        </div>

                        {/* Heading */}

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Sign in to access the Laoac
                                Barangay Management System.
                            </p>
                        </div>

                        {/* Form */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="space-y-5"
                        >
                            {/* Email */}

                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Email address
                                </Label>

                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(
                                        event
                                    ) => {
                                        setEmail(
                                            event
                                                .target
                                                .value
                                        )

                                        setError("")
                                    }}
                                    required
                                    autoComplete="email"
                                    disabled={
                                        loading
                                    }
                                    className="h-11 bg-white"
                                />
                            </div>

                            {/* Password */}

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-4">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-slate-700"
                                    >
                                        Password
                                    </Label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            password
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setPassword(
                                                event
                                                    .target
                                                    .value
                                            )

                                            setError(
                                                ""
                                            )
                                        }}
                                        required
                                        autoComplete="current-password"
                                        disabled={
                                            loading
                                        }
                                        className="h-11 bg-white pr-11"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (
                                                    current
                                                ) =>
                                                    !current
                                            )
                                        }
                                        disabled={
                                            loading
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}

                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            {/* Sign In */}

                            <Button
                                type="submit"
                                disabled={
                                    loading
                                }
                                className="h-11 w-full bg-emerald-700 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800"
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign In"}
                            </Button>
                        </form>

                        {/* Security notice */}

                        <div className="mt-8 flex items-start gap-3 rounded-xl border bg-white p-4">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                            <p className="text-xs leading-5 text-slate-500">
                                Access is restricted to
                                authorized barangay personnel
                                and registered resident
                                accounts.
                            </p>
                        </div>

                        {/* Mobile footer */}

                        <p className="mt-8 text-center text-xs text-slate-400 lg:hidden">
                            © 2026 Laoac Barangay
                            Management System
                        </p>
                    </div>
                </section>
            </div>
        </main>
    )
}