import {
  useEffect,
  useState,
} from "react"

import {
  BadgeCheck,
  FileCheck2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react"

import { useParams } from "react-router-dom"

import { verifyCertificate } from "@/features/certificates/services/certificate-verification.service"

import type {
  CertificateVerification,
} from "@/features/certificates/types"

// ========================================
// HELPERS
// ========================================

function isValidUuid(
  value: string
) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

function formatDate(
  value: string
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date)
}

// ========================================
// PAGE
// ========================================

export function CertificateVerificationPage() {
  const {
    token,
  } = useParams<{
    token: string
  }>()

  const [
    certificate,
    setCertificate,
  ] =
    useState<CertificateVerification | null>(
      null
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState("")

  // ========================================
  // VERIFY
  // ========================================

  useEffect(() => {
    let cancelled = false

    async function loadVerification() {
      setIsLoading(true)
      setError("")
      setCertificate(null)

      if (
        !token ||
        !isValidUuid(token)
      ) {
        if (!cancelled) {
          setError(
            "The verification link is invalid."
          )

          setIsLoading(false)
        }

        return
      }

      try {
        const result =
          await verifyCertificate(
            token
          )

        if (cancelled) {
          return
        }

        if (!result) {
          setError(
            "This certificate could not be verified."
          )

          return
        }

        setCertificate(
          result
        )
      } catch (verificationError) {
        console.error(
          "Unable to verify certificate:",
          verificationError
        )

        if (!cancelled) {
          setError(
            "Unable to verify the certificate at this time."
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadVerification()

    return () => {
      cancelled = true
    }
  }, [token])

  // ========================================
  // LOADING
  // ========================================

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 animate-pulse text-muted-foreground" />

          <h1 className="mt-4 text-xl font-semibold">
            Verifying Certificate
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while the certificate is being verified.
          </p>
        </div>
      </div>
    )
  }

  // ========================================
  // INVALID
  // ========================================

  if (
    error ||
    !certificate
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <TriangleAlert className="h-8 w-8 text-red-700" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Certificate Not Verified
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error ||
              "This certificate could not be verified."}
          </p>

          <div className="mt-6 rounded-md border bg-muted/40 p-4 text-left text-sm">
            <p className="font-medium">
              Possible reasons:
            </p>

            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                The QR code or verification link is invalid.
              </li>

              <li>
                The certificate has not been issued.
              </li>

              <li>
                The certificate record no longer exists.
              </li>
            </ul>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Barangay Management System
          </p>
        </div>
      </div>
    )
  }

  // ========================================
  // VALID
  // ========================================

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* HEADER */}

        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <BadgeCheck className="h-9 w-9 text-green-700" />
          </div>

          <h1 className="mt-4 text-2xl font-bold">
            Certificate Verified
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This certificate was found in the Barangay Management System.
          </p>
        </div>

        {/* CERTIFICATE DETAILS */}

        <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
          <div className="border-b bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <FileCheck2 className="h-5 w-5 text-green-700" />

              <div>
                <p className="font-semibold text-green-900">
                  Valid Issued Certificate
                </p>

                <p className="text-sm text-green-800">
                  Verification successful
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            {/* CERTIFICATE NUMBER */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Certificate Number
              </p>

              <p className="mt-1 font-semibold">
                {
                  certificate.certificate_number
                }
              </p>
            </div>

            {/* REQUEST NUMBER */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Request Number
              </p>

              <p className="mt-1 font-semibold">
                {
                  certificate.request_number
                }
              </p>
            </div>

            {/* TYPE */}

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Certificate Type
              </p>

              <p className="mt-1 font-semibold">
                {
                  certificate.certificate_type
                }
              </p>
            </div>

            {/* RESIDENT */}

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Issued To
              </p>

              <p className="mt-1 text-lg font-semibold">
                {
                  certificate.resident_name
                }
              </p>
            </div>

            {/* ISSUED DATE */}

            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Date Issued
              </p>

              <p className="mt-1 font-medium">
                {formatDate(
                  certificate.issued_at
                )}
              </p>
            </div>
          </div>

          {/* FOOTER */}

          <div className="border-t bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

              <div>
                <p className="text-sm font-medium">
                  Official Verification
                </p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  The information above was retrieved directly from the
                  Barangay Management System verification database.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Barangay Management System
        </p>
      </div>
    </div>
  )
}