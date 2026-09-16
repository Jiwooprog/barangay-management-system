import {
  useState,
  type FormEvent,
} from "react"

import {
  ArrowLeft,
  Mail,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { supabase } from "@/lib/supabase"

export function ForgotPasswordPage() {
  const [
    email,
    setEmail,
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
    isSending,
    setIsSending,
  ] = useState(false)

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!email.trim()) {
      setError(
        "Email address is required."
      )

      return
    }

    try {
      setIsSending(true)
      setError("")
      setSuccess("")

      const {
        error: resetError,
      } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        )

      if (resetError) {
        throw resetError
      }

      setSuccess(
        "Password recovery email sent. Check your inbox and open the recovery link."
      )
    } catch (sendError) {
      console.error(
        "Password recovery error:",
        sendError
      )

      if (
        typeof sendError === "object" &&
        sendError !== null &&
        "message" in sendError
      ) {
        setError(
          String(sendError.message)
        )
      } else {
        setError(
          "Unable to send password recovery email."
        )
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Mail className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold">
            Forgot Password
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter your account email
            and we will send you a
            password recovery link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSending}
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
            disabled={isSending}
          >
            {isSending
              ? "Sending..."
              : "Send Recovery Email"}
          </Button>
        </form>

        <div className="mt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}