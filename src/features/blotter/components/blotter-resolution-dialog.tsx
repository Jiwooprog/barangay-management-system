import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"

import {
  CheckCircle2,
  Forward,
  Handshake,
  Loader2,
  LockKeyhole,
  Scale,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  useUpdateBlotterCase,
} from "@/features/blotter/hooks/use-blotter"

import type {
  BlotterCase,
} from "@/features/blotter/types"

// ========================================
// ACTION TYPE
// ========================================

export type BlotterResolutionAction =
  | "start_mediation"
  | "settle"
  | "refer"
  | "dismiss"
  | "close"

// ========================================
// PROPS
// ========================================

interface BlotterResolutionDialogProps {
  open: boolean

  onOpenChange: (
    open: boolean
  ) => void

  caseData:
    | BlotterCase
    | null

  action:
    | BlotterResolutionAction
    | null
}

// ========================================
// ACTION HELPERS
// ========================================

function getActionTitle(
  action: BlotterResolutionAction
) {
  switch (action) {
    case "start_mediation":
      return "Start Mediation"

    case "settle":
      return "Settle Case"

    case "refer":
      return "Refer Case"

    case "dismiss":
      return "Dismiss Case"

    case "close":
      return "Close Case"
  }
}

function getActionDescription(
  action: BlotterResolutionAction
) {
  switch (action) {
    case "start_mediation":
      return "Move this case into barangay mediation."

    case "settle":
      return "Record the settlement or agreement reached by both parties."

    case "refer":
      return "Refer this case to another office, agency, or authority."

    case "dismiss":
      return "Dismiss this case and record the reason."

    case "close":
      return "Finalize and close this blotter case."
  }
}

function getActionIcon(
  action: BlotterResolutionAction
) {
  switch (action) {
    case "start_mediation":
      return (
        <Scale className="mr-2 h-4 w-4" />
      )

    case "settle":
      return (
        <Handshake className="mr-2 h-4 w-4" />
      )

    case "refer":
      return (
        <Forward className="mr-2 h-4 w-4" />
      )

    case "dismiss":
      return (
        <XCircle className="mr-2 h-4 w-4" />
      )

    case "close":
      return (
        <LockKeyhole className="mr-2 h-4 w-4" />
      )
  }
}

function isResolutionActionAllowed(
  action: BlotterResolutionAction,
  status: BlotterCase["status"]
) {
  switch (action) {
    case "start_mediation":
      return status === "open"

    case "settle":
      return status === "under_mediation"

    case "refer":
    case "dismiss":
      return (
        status === "open" ||
        status === "under_mediation"
      )

    case "close":
      return (
        status === "settled" ||
        status === "referred" ||
        status === "dismissed"
      )
  }
}

// ========================================
// COMPONENT
// ========================================

export function BlotterResolutionDialog({
  open,
  onOpenChange,
  caseData,
  action,
}: BlotterResolutionDialogProps) {
  const updateMutation =
    useUpdateBlotterCase()

  const [
    actionTaken,
    setActionTaken,
  ] = useState("")

  const [
    settlementDetails,
    setSettlementDetails,
  ] = useState("")

  const [
    referredTo,
    setReferredTo,
  ] = useState("")

  const [
    formError,
    setFormError,
  ] = useState("")

  const errorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  useEffect(
    () => {
      if (
        !formError ||
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
      formError,
      open,
    ]
  )

  // ========================================
  // RESET FORM
  // ========================================

  useEffect(() => {
    if (!open) {
      return
    }

    setFormError("")
    setActionTaken("")
    setSettlementDetails("")
    setReferredTo("")
  }, [
    open,
    action,
  ])

  if (
    !caseData ||
    !action
  ) {
    return null
  }

  const isSaving =
    updateMutation.isPending

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    // ========================================
    // VALIDATION
    // ========================================

    if (
      !isResolutionActionAllowed(
        action,
        caseData.status
      )
    ) {
      setFormError(
        "This action is no longer available for the case's current status."
      )

      return
    }

    if (
      action === "settle" &&
      !settlementDetails.trim()
    ) {
      setFormError(
        "Settlement details are required."
      )

      return
    }

    if (
      action === "refer" &&
      !referredTo.trim()
    ) {
      setFormError(
        "Please specify where the case will be referred."
      )

      return
    }

    if (
      (
        action === "dismiss" ||
        action === "close"
      ) &&
      !actionTaken.trim()
    ) {
      setFormError(
        action === "dismiss"
          ? "Reason for dismissal is required."
          : "Final action or closing remarks are required."
      )

      return
    }

    try {
      setFormError("")

      // ========================================
      // START MEDIATION
      // ========================================

      if (
        action ===
        "start_mediation"
      ) {
        await updateMutation.mutateAsync({
          id:
            caseData.id,

          status:
            "under_mediation",

          action_taken:
            actionTaken.trim() ||
            "Case moved to barangay mediation.",
        })
      }

      // ========================================
      // SETTLE CASE
      // ========================================

      if (
        action === "settle"
      ) {
        await updateMutation.mutateAsync({
          id:
            caseData.id,

          status:
            "settled",

          settlement_details:
            settlementDetails.trim(),

          action_taken:
            actionTaken.trim() ||
            "Parties reached a settlement.",
        })
      }

      // ========================================
      // REFER CASE
      // ========================================

      if (
        action === "refer"
      ) {
        await updateMutation.mutateAsync({
          id:
            caseData.id,

          status:
            "referred",

          referred_to:
            referredTo.trim(),

          action_taken:
            actionTaken.trim() ||
            `Case referred to ${referredTo.trim()}.`,
        })
      }

      // ========================================
      // DISMISS CASE
      // ========================================

      if (
        action === "dismiss"
      ) {
        await updateMutation.mutateAsync({
          id:
            caseData.id,

          status:
            "dismissed",

          action_taken:
            actionTaken.trim(),
        })
      }

      // ========================================
      // CLOSE CASE
      // ========================================

      if (
        action === "close"
      ) {
        await updateMutation.mutateAsync({
          id:
            caseData.id,

          status:
            "closed",

          action_taken:
            actionTaken.trim(),
        })
      }

      onOpenChange(false)
    } catch (saveError) {
      console.error(
        "Resolve blotter case error:",
        saveError
      )

      if (
        saveError instanceof Error
      ) {
        setFormError(
          saveError.message
        )
      } else {
        setFormError(
          "Unable to update blotter case."
        )
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {getActionTitle(
              action
            )}
          </DialogTitle>

          <DialogDescription>
            {caseData.case_number}
            {" — "}
            {getActionDescription(
              action
            )}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >
          {/* ====================================
              CURRENT CASE
          ==================================== */}

          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              Current Status
            </p>

            <p className="mt-1 font-medium capitalize">
              {caseData.status.replace(
                /_/g,
                " "
              )}
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              Complaint Type
            </p>

            <p className="mt-1 text-sm">
              {
                caseData.complaint_type
              }
            </p>
          </div>

          {/* ====================================
              SETTLEMENT DETAILS
          ==================================== */}

          {action ===
            "settle" && (
            <div className="space-y-2">
              <Label htmlFor="settlement-details">
                Settlement Details
              </Label>

              <textarea
                id="settlement-details"
                rows={5}
                value={
                  settlementDetails
                }
                onChange={(event) =>
                  setSettlementDetails(
                    event.target.value
                  )
                }
                placeholder="Describe the agreement reached by both parties..."
                disabled={
                  isSaving
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}

          {/* ====================================
              REFERRED TO
          ==================================== */}

          {action ===
            "refer" && (
            <div className="space-y-2">
              <Label htmlFor="referred-to">
                Referred To
              </Label>

              <Input
                id="referred-to"
                value={
                  referredTo
                }
                onChange={(event) =>
                  setReferredTo(
                    event.target.value
                  )
                }
                placeholder="Example: PNP, Municipal Office, Lupon..."
                disabled={
                  isSaving
                }
              />
            </div>
          )}

          {/* ====================================
              ACTION TAKEN
          ==================================== */}

          <div className="space-y-2">
            <Label htmlFor="resolution-action">
              {action ===
              "dismiss"
                ? "Reason for Dismissal"
                : action ===
                    "close"
                  ? "Final Action / Remarks"
                  : "Action Taken"}
            </Label>

            <textarea
              id="resolution-action"
              rows={4}
              value={
                actionTaken
              }
              onChange={(event) =>
                setActionTaken(
                  event.target.value
                )
              }
              placeholder={
                action ===
                "start_mediation"
                  ? "Optional mediation remarks..."
                  : action ===
                      "settle"
                    ? "Optional action taken..."
                    : action ===
                        "refer"
                      ? "Optional referral remarks..."
                      : action ===
                          "dismiss"
                        ? "Explain why the case is being dismissed..."
                        : "Enter the final action or closing remarks..."
              }
              disabled={
                isSaving
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* ====================================
              NOTICE
          ==================================== */}

          <div className="rounded-md border p-3 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

              <p>
                This action will update
                the main blotter case
                status and automatically
                create a Case History
                entry.
              </p>
            </div>
          </div>

          {/* ERROR */}

          {formError && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {formError}
            </div>
          )}

          {/* FOOTER */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                isSaving
              }
              onClick={() =>
                onOpenChange(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSaving
              }
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                getActionIcon(
                  action
                )
              )}

              {isSaving
                ? "Saving..."
                : getActionTitle(
                    action
                  )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}