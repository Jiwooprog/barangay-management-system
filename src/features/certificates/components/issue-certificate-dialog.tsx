import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"

import {
  BadgeCheck,
  Hash,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"

import {
  useIssueCertificate,
} from "@/features/certificates/hooks/use-certificates"

import type {
  CertificateRequest,
} from "@/features/certificates/types"

interface IssueCertificateDialogProps {
  open: boolean

  onOpenChange: (
    open: boolean
  ) => void

  request:
    | CertificateRequest
    | null
}

function getResidentName(
  request:
    | CertificateRequest
    | null
) {
  const resident =
    request?.residents

  if (!resident) {
    return "Unknown resident"
  }

  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

export function IssueCertificateDialog({
  open,
  onOpenChange,
  request,
}: IssueCertificateDialogProps) {
  const issueMutation =
    useIssueCertificate()

  const [
    notes,
    setNotes,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  const errorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  useEffect(
    () => {
      if (
        !error ||
        !open
      ) {
        return
      }

      const timer =
        window.setTimeout(
          () => {
            errorRef.current
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
          },
          50
        )

      return () => {
        window.clearTimeout(
          timer
        )
      }
    },
    [
      error,
      open,
    ]
  )

  // ========================================
  // RESET
  // ========================================

  useEffect(() => {
    if (
      !open ||
      !request
    ) {
      return
    }

    setNotes(
      request.notes ?? ""
    )

    setError("")
  }, [
    open,
    request,
  ])

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!request) {
      return
    }

    if (
      request.status !==
      "approved"
    ) {
      setError(
        "Only approved requests can be issued."
      )

      return
    }

    try {
      setError("")

      await issueMutation.mutateAsync({
        id:
          request.id,

        notes:
          notes.trim(),
      })

      onOpenChange(false)
    } catch (issueError) {
      console.error(
        "Issue certificate error:",
        issueError
      )

      if (
        typeof issueError ===
          "object" &&
        issueError !== null &&
        "message" in issueError
      ) {
        setError(
          String(
            issueError.message
          )
        )
      } else {
        setError(
          "Unable to issue certificate."
        )
      }
    }
  }

  const isBusy =
    issueMutation.isPending

  if (!request) {
    return null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Issue Certificate
          </DialogTitle>

          <DialogDescription>
            Confirm the approved
            request and issue the
            certificate.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =========================
              REQUEST SUMMARY
          ========================= */}

          <section className="rounded-md border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* REQUEST NUMBER */}

              <div>
                <p className="text-xs text-muted-foreground">
                  Request Number
                </p>

                <p className="font-medium">
                  {
                    request.request_number
                  }
                </p>
              </div>

              {/* TYPE */}

              <div>
                <p className="text-xs text-muted-foreground">
                  Certificate Type
                </p>

                <p className="font-medium">
                  {request
                    .certificate_types
                    ?.name ??
                    "Unknown certificate"}
                </p>
              </div>

              {/* RESIDENT */}

              <div>
                <p className="text-xs text-muted-foreground">
                  Resident
                </p>

                <p className="font-medium">
                  {getResidentName(
                    request
                  )}
                </p>

                <p className="text-xs text-muted-foreground">
                  {request
                    .residents
                    ?.resident_number ??
                    "—"}
                </p>
              </div>

              {/* STATUS */}

              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="font-medium capitalize">
                  {
                    request.status
                  }
                </p>
              </div>

              {/* PAYMENT */}

              <div>
                <p className="text-xs text-muted-foreground">
                  Payment Status
                </p>

                <p className="font-medium capitalize">
                  {
                    request.payment_status
                  }
                </p>
              </div>

              {/* AMOUNT */}

              <div>
                <p className="text-xs text-muted-foreground">
                  Amount
                </p>

                <p className="font-medium">
                  ₱
                  {Number(
                    request.amount ??
                      0
                  ).toFixed(2)}
                </p>
              </div>
            </div>

            {/* PURPOSE */}

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Purpose
              </p>

              <p className="text-sm">
                {
                  request.purpose
                }
              </p>
            </div>

            {/* BUSINESS */}

            {request.business_name && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Business Name
                  </p>

                  <p className="text-sm font-medium">
                    {
                      request.business_name
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Business Address
                  </p>

                  <p className="text-sm">
                    {request.business_address ??
                      "—"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* =========================
              AUTOMATIC NUMBER
          ========================= */}

          <section className="rounded-md border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background">
                <Hash className="h-4 w-4" />
              </div>

              <div>
                <p className="font-medium">
                  Certificate Number
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  The certificate
                  number will be
                  generated
                  automatically when
                  this request is
                  issued.
                </p>

                <p className="mt-2 font-mono text-sm">
                  CERT-YYYY-XXXXXX
                </p>
              </div>
            </div>
          </section>

          {/* =========================
              VERIFICATION TOKEN
          ========================= */}

          <section className="rounded-md bg-muted p-4">
            <p className="text-xs text-muted-foreground">
              Verification Token
            </p>

            <p className="mt-1 break-all font-mono text-sm">
              {
                request.verification_token
              }
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              This token is encoded
              into the certificate QR
              code for public
              verification.
            </p>
          </section>

          {/* =========================
              NOTES
          ========================= */}

          <div className="space-y-2">
            <Label htmlFor="issue-notes">
              Notes
            </Label>

            <textarea
              id="issue-notes"
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional issuance notes"
              disabled={isBusy}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          {/* =========================
              BUTTONS
          ========================= */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isBusy}
            >
              <BadgeCheck className="mr-2 h-4 w-4" />

              {issueMutation.isPending
                ? "Issuing..."
                : "Issue Certificate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}