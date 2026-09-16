import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"

import {
  CheckCircle2,
  XCircle,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  useApproveCertificateRequest,
  useRejectCertificateRequest,
} from "@/features/certificates/hooks/use-certificates"

import type {
  CertificatePaymentStatus,
  CertificateRequest,
} from "@/features/certificates/types"

interface ReviewRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: CertificateRequest | null
}

type ReviewAction =
  | "approve"
  | "reject"

function getResidentName(
  request: CertificateRequest | null
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

export function ReviewRequestDialog({
  open,
  onOpenChange,
  request,
}: ReviewRequestDialogProps) {
  const approveMutation =
    useApproveCertificateRequest()

  const rejectMutation =
    useRejectCertificateRequest()

  const [
    action,
    setAction,
  ] =
    useState<ReviewAction>(
      "approve"
    )

  const [
    paymentStatus,
    setPaymentStatus,
  ] =
    useState<CertificatePaymentStatus>(
      "unpaid"
    )

  const [
    amount,
    setAmount,
  ] = useState("0")

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("")

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("")

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

  useEffect(() => {
    if (
      !open ||
      !request
    ) {
      return
    }

    setAction("approve")

    setPaymentStatus(
      request.payment_status
    )

    setAmount(
      String(
        request.amount ?? 0
      )
    )

    setPaymentReference(
      request.payment_reference ??
        ""
    )

    setRejectionReason(
      request.rejection_reason ??
        ""
    )

    setNotes(
      request.notes ?? ""
    )

    setError("")
  }, [
    open,
    request,
  ])

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
      "pending"
    ) {
      setError(
        "Only pending requests can be reviewed."
      )

      return
    }

    if (
      action === "reject"
    ) {
      if (
        !rejectionReason.trim()
      ) {
        setError(
          "Rejection reason is required."
        )

        return
      }

      try {
        setError("")

        await rejectMutation.mutateAsync({
          id:
            request.id,

          rejection_reason:
            rejectionReason.trim(),

          notes:
            notes.trim(),
        })

        onOpenChange(false)
      } catch (reviewError) {
        console.error(
          "Reject request error:",
          reviewError
        )

        if (
          typeof reviewError ===
            "object" &&
          reviewError !== null &&
          "message" in reviewError
        ) {
          setError(
            String(
              reviewError.message
            )
          )
        } else {
          setError(
            "Unable to reject request."
          )
        }
      }

      return
    }

    const amountValue =
      amount.trim()

    const numericAmount =
      Number(amountValue)

    if (
      !amountValue ||
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount < 0
    ) {
      setError(
        "Amount must be a valid number that is 0 or greater."
      )

      return
    }

    try {
      setError("")

      await approveMutation.mutateAsync({
        id:
          request.id,

        payment_status:
          paymentStatus,

        amount:
          numericAmount,

        payment_reference:
          paymentReference.trim(),

        notes:
          notes.trim(),
      })

      onOpenChange(false)
    } catch (reviewError) {
      console.error(
        "Approve request error:",
        reviewError
      )

      if (
        typeof reviewError ===
          "object" &&
        reviewError !== null &&
        "message" in reviewError
      ) {
        setError(
          String(
            reviewError.message
          )
        )
      } else {
        setError(
          "Unable to approve request."
        )
      }
    }
  }

  const isBusy =
    approveMutation.isPending ||
    rejectMutation.isPending

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Review Certificate Request
          </DialogTitle>

          <DialogDescription>
            Review the request before
            approving or rejecting it.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* REQUEST SUMMARY */}

          <section className="rounded-md border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
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

              <div>
                <p className="text-xs text-muted-foreground">
                  Certificate
                </p>

                <p className="font-medium">
                  {request
                    .certificate_types
                    ?.name ??
                    "Unknown certificate"}
                </p>
              </div>

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

              <div>
                <p className="text-xs text-muted-foreground">
                  Current Status
                </p>

                <p className="font-medium capitalize">
                  {
                    request.status
                  }
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Purpose
              </p>

              <p className="text-sm">
                {request.purpose}
              </p>
            </div>

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

          {/* ACTION */}

          <section className="space-y-3">
            <Label>
              Review Decision
            </Label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  setAction(
                    "approve"
                  )
                }
                className={[
                  "rounded-md border p-4 text-left transition-colors",
                  action ===
                  "approve"
                    ? "border-green-600 bg-green-50"
                    : "hover:bg-muted",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" />

                  Approve
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Approve this request
                  for certificate
                  issuance.
                </p>
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={() =>
                  setAction(
                    "reject"
                  )
                }
                className={[
                  "rounded-md border p-4 text-left transition-colors",
                  action ===
                  "reject"
                    ? "border-red-600 bg-red-50"
                    : "hover:bg-muted",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 font-medium">
                  <XCircle className="h-4 w-4" />

                  Reject
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Reject this request
                  with a reason.
                </p>
              </button>
            </div>
          </section>

          {/* APPROVE FIELDS */}

          {action ===
            "approve" && (
            <section className="space-y-4 rounded-md border p-4">
              <div>
                <h3 className="font-semibold">
                  Approval & Payment
                </h3>

                <p className="text-xs text-muted-foreground">
                  Confirm the
                  certificate fee and
                  payment status.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="review-payment-status">
                    Payment Status
                  </Label>

                  <select
                    id="review-payment-status"
                    value={
                      paymentStatus
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentStatus(
                        event
                          .target
                          .value as CertificatePaymentStatus
                      )
                    }
                    disabled={isBusy}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="unpaid">
                      Unpaid
                    </option>

                    <option value="paid">
                      Paid
                    </option>

                    <option value="waived">
                      Waived
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-amount">
                    Amount
                  </Label>

                  <Input
                    id="review-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(
                      event
                    ) =>
                      setAmount(
                        event.target
                          .value
                      )
                    }
                    disabled={isBusy}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="review-payment-reference">
                    Payment Reference
                  </Label>

                  <Input
                    id="review-payment-reference"
                    value={
                      paymentReference
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentReference(
                        event.target
                          .value
                      )
                    }
                    placeholder="Optional receipt or payment reference"
                    disabled={isBusy}
                  />
                </div>
              </div>
            </section>
          )}

          {/* REJECT FIELDS */}

          {action ===
            "reject" && (
            <section className="space-y-2 rounded-md border p-4">
              <Label htmlFor="rejection-reason">
                Rejection Reason
              </Label>

              <textarea
                id="rejection-reason"
                rows={4}
                value={
                  rejectionReason
                }
                onChange={(
                  event
                ) =>
                  setRejectionReason(
                    event.target
                      .value
                  )
                }
                placeholder="Explain why this request is being rejected..."
                disabled={isBusy}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </section>
          )}

          {/* NOTES */}

          <div className="space-y-2">
            <Label htmlFor="review-notes">
              Notes
            </Label>

            <textarea
              id="review-notes"
              rows={3}
              value={notes}
              onChange={(
                event
              ) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional internal notes"
              disabled={isBusy}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* ERROR */}

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          {/* BUTTONS */}

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

            {action ===
            "approve" ? (
              <Button
                type="submit"
                disabled={isBusy}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />

                {approveMutation.isPending
                  ? "Approving..."
                  : "Approve Request"}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="destructive"
                disabled={isBusy}
              >
                <XCircle className="mr-2 h-4 w-4" />

                {rejectMutation.isPending
                  ? "Rejecting..."
                  : "Reject Request"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}