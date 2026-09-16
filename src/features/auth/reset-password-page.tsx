import {
  useEffect,
  useState,
  type FormEvent,
} from "react"

import {
  KeyRound,
} from "lucide-react"

import {
  useNavigate,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { supabase } from "@/lib/supabase"

export function ResetPasswordPage() {
  const navigate =
    useNavigate()

  const [
    password,
    setPassword,
  ] = useState("")

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  const [
    success,
    setSuccess,
  ] = useState("")

  const [
    isUpdating,
    setIsUpdating,
  ] = useState(false)

  const [
    recoveryReady,
    setRecoveryReady,
  ] = useState(false)

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true)

  // ========================================
  // CHECK RECOVERY SESSION
  // ========================================

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const {
        data,
      } =
        await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      if (data.session) {
        setRecoveryReady(true)
      }

      setCheckingSession(false)
    }

    void checkSession()

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (event) => {
          if (
            event ===
            "PASSWORD_RECOVERY"
          ) {
            setRecoveryReady(true)
            setCheckingSession(false)
          }
        }
      )

    return () => {
      mounted = false

      authListener.subscription.unsubscribe()
    }
  }, [])

  // ========================================
  // UPDATE PASSWORD
  // ========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters."
      )

      return
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      )

      return
    }

    try {
      setIsUpdating(true)
      setError("")
      setSuccess("")

      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          password,
        })

      if (updateError) {
        throw updateError
      }

      setSuccess(
        "Password updated successfully. You can now log in using your new password."
      )

      await supabase.auth.signOut()

      window.setTimeout(
        () => {
          navigate(
            "/login",
            {
              replace: true,
            }
          )
        },
        1500
      )
    } catch (updateError) {
      console.error(
        "Password update error:",
        updateError
      )

      if (
        typeof updateError === "object" &&
        updateError !== null &&
        "message" in updateError
      ) {
        setError(
          String(
            updateError.message
          )
        )
      } else {
        setError(
          "Unable to update password."
        )
      }
    } finally {
      setIsUpdating(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Checking recovery link...
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <KeyRound className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold">
            Reset Password
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Create a new password
            for your Barangay BMS
            account.
          </p>
        </div>

        {!recoveryReady ? (
          <div className="space-y-4">
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <p className="font-medium text-destructive">
                Recovery link is invalid or expired
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Return to Forgot Password
                and request a new recovery
                email.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() =>
                navigate(
                  "/forgot-password"
                )
              }
            >
              Request New Link
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="new-password">
                New Password
              </Label>

              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirm New Password
              </Label>

              <Input
                id="confirm-password"
                type="password"
                value={
                  confirmPassword
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Enter password again"
                autoComplete="new-password"
                disabled={isUpdating}
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md border border-green-600/30 bg-green-50 p-3 text-sm text-green-800">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isUpdating ||
                Boolean(success)
              }
            >
              {isUpdating
                ? "Updating..."
                : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}