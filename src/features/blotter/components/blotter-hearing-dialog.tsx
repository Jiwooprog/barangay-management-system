import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"

import {
  CalendarPlus,
  Loader2,
  Trash2,
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
  useCreateBlotterHearing,
  useDeleteBlotterHearing,
  useUpdateBlotterHearing,
} from "@/features/blotter/hooks/use-blotter"

import type {
  BlotterHearing,
  BlotterHearingStatus,
} from "@/features/blotter/types"

// ========================================
// PROPS
// ========================================

interface BlotterHearingDialogProps {
  open: boolean

  onOpenChange: (
    open: boolean
  ) => void

  blotterCaseId: string

  hearing?:
    | BlotterHearing
    | null
}

// ========================================
// HELPERS
// ========================================

function toDateTimeLocal(
  value: string | null
) {
  if (!value) {
    return ""
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ""
  }

  const offset =
    date.getTimezoneOffset()

  const localDate =
    new Date(
      date.getTime() -
        offset * 60 * 1000
    )

  return localDate
    .toISOString()
    .slice(0, 16)
}

function getNowDateTimeLocal() {
  const now =
    new Date()

  const offset =
    now.getTimezoneOffset()

  const localDate =
    new Date(
      now.getTime() -
        offset * 60 * 1000
    )

  return localDate
    .toISOString()
    .slice(0, 16)
}

// ========================================
// COMPONENT
// ========================================

export function BlotterHearingDialog({
  open,
  onOpenChange,
  blotterCaseId,
  hearing = null,
}: BlotterHearingDialogProps) {
  const createMutation =
    useCreateBlotterHearing()

  const updateMutation =
    useUpdateBlotterHearing()

  const deleteMutation =
    useDeleteBlotterHearing()

  const isEditMode =
    Boolean(hearing)

  // ========================================
  // FORM
  // ========================================

  const [
    hearingDate,
    setHearingDate,
  ] = useState("")

  const [
    venue,
    setVenue,
  ] = useState("")

  const [
    status,
    setStatus,
  ] =
    useState<BlotterHearingStatus>(
      "scheduled"
    )

  const [
    complainantPresent,
    setComplainantPresent,
  ] = useState<
    boolean | null
  >(null)

  const [
    respondentPresent,
    setRespondentPresent,
  ] = useState<
    boolean | null
  >(null)

  const [
    notes,
    setNotes,
  ] = useState("")

  const [
    outcome,
    setOutcome,
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
  // RESET / EDIT DATA
  // ========================================

  useEffect(() => {
    if (!open) {
      return
    }

    setFormError("")

    if (!hearing) {
      setHearingDate("")
      setVenue("")
      setStatus(
        "scheduled"
      )

      setComplainantPresent(
        null
      )

      setRespondentPresent(
        null
      )

      setNotes("")
      setOutcome("")

      return
    }

    setHearingDate(
      toDateTimeLocal(
        hearing.hearing_date
      )
    )

    setVenue(
      hearing.venue ?? ""
    )

    setStatus(
      hearing.status
    )

    setComplainantPresent(
      hearing.complainant_present
    )

    setRespondentPresent(
      hearing.respondent_present
    )

    setNotes(
      hearing.notes ?? ""
    )

    setOutcome(
      hearing.outcome ?? ""
    )
  }, [
    open,
    hearing,
  ])

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending

  const isDeleting =
    deleteMutation.isPending

  // ========================================
  // SAVE
  // ========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!hearingDate) {
      setFormError(
        "Hearing date and time are required."
      )

      return
    }

    const parsedDate =
      new Date(
        hearingDate
      )

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      setFormError(
        "Invalid hearing date and time."
      )

      return
    }

    const requiresFutureSchedule =
      !isEditMode ||
      status === "scheduled" ||
      status === "rescheduled"

    if (
      requiresFutureSchedule &&
      parsedDate.getTime() <=
        Date.now()
    ) {
      setFormError(
        "Scheduled hearing date and time must be in the future."
      )

      return
    }

    if (
      requiresFutureSchedule &&
      !venue.trim()
    ) {
      setFormError(
        "Venue is required for a scheduled hearing."
      )

      return
    }

    if (
      isEditMode &&
      status === "completed" &&
      !outcome.trim()
    ) {
      setFormError(
        "Outcome is required when a hearing is marked completed."
      )

      return
    }

    try {
      setFormError("")

      if (
        isEditMode &&
        hearing
      ) {
        await updateMutation.mutateAsync({
          id:
            hearing.id,

          blotter_case_id:
            blotterCaseId,

          hearing_date:
            parsedDate.toISOString(),

          venue:
            venue.trim() ||
            null,

          status,

          complainant_present:
            complainantPresent,

          respondent_present:
            respondentPresent,

          notes:
            notes.trim() ||
            null,

          outcome:
            outcome.trim() ||
            null,
        })
      } else {
        await createMutation.mutateAsync({
          blotter_case_id:
            blotterCaseId,

          hearing_date:
            parsedDate.toISOString(),

          venue:
            venue.trim() ||
            null,

          notes:
            notes.trim() ||
            null,
        })
      }

      onOpenChange(false)
    } catch (saveError) {
      console.error(
        "Save hearing error:",
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
          "Unable to save hearing."
        )
      }
    }
  }

  // ========================================
  // ARCHIVE
  // ========================================

  const handleArchive =
    async () => {
      if (!hearing) {
        return
      }

      const confirmed =
        window.confirm(
          "Archive this hearing record?"
        )

      if (!confirmed) {
        return
      }

      try {
        setFormError("")

        await deleteMutation.mutateAsync({
          id:
            hearing.id,

          blotter_case_id:
            blotterCaseId,
        })

        onOpenChange(false)
      } catch (deleteError) {
        console.error(
          "Archive hearing error:",
          deleteError
        )

        if (
          deleteError instanceof Error
        ) {
          setFormError(
            deleteError.message
          )
        } else {
          setFormError(
            "Unable to archive hearing."
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
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Manage Hearing"
              : "Schedule Hearing"}
          </DialogTitle>

          <DialogDescription>
            {isEditMode
              ? "Update the hearing schedule, attendance, status, and outcome."
              : "Schedule a mediation or hearing for this blotter case."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >
          {/* ====================================
              SCHEDULE
          ==================================== */}

          <section className="space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">
                Hearing Schedule
              </h3>

              <p className="text-xs text-muted-foreground">
                Set the hearing date,
                time and venue.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* DATE */}

              <div className="space-y-2">
                <Label htmlFor="hearing-date">
                  Date & Time
                </Label>

                <Input
                  id="hearing-date"
                  type="datetime-local"
                  min={
                    !isEditMode
                      ? getNowDateTimeLocal()
                      : undefined
                  }
                  value={
                    hearingDate
                  }
                  onChange={(event) =>
                    setHearingDate(
                      event.target.value
                    )
                  }
                  disabled={
                    isSaving ||
                    isDeleting
                  }
                />
              </div>

              {/* VENUE */}

              <div className="space-y-2">
                <Label htmlFor="hearing-venue">
                  Venue
                </Label>

                <Input
                  id="hearing-venue"
                  value={
                    venue
                  }
                  onChange={(event) =>
                    setVenue(
                      event.target.value
                    )
                  }
                  placeholder="Barangay Hall"
                  disabled={
                    isSaving ||
                    isDeleting
                  }
                />
              </div>
            </div>
          </section>

          {/* ====================================
              STATUS
          ==================================== */}

          {isEditMode && (
            <section className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">
                  Hearing Status
                </h3>

                <p className="text-xs text-muted-foreground">
                  Update the current
                  hearing state.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hearing-status">
                  Status
                </Label>

                <select
                  id="hearing-status"
                  value={
                    status
                  }
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as BlotterHearingStatus
                    )
                  }
                  disabled={
                    isSaving ||
                    isDeleting
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="scheduled">
                    Scheduled
                  </option>

                  <option value="completed">
                    Completed
                  </option>

                  <option value="rescheduled">
                    Rescheduled
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                  <option value="no_show">
                    No Show
                  </option>
                </select>
              </div>
            </section>
          )}

          {/* ====================================
              ATTENDANCE
          ==================================== */}

          {isEditMode && (
            <section className="space-y-4 rounded-lg border p-4">
              <div>
                <h3 className="font-semibold">
                  Attendance
                </h3>

                <p className="text-xs text-muted-foreground">
                  Record who attended
                  the hearing.
                </p>
              </div>

              {/* COMPLAINANT */}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    Complainant
                  </Label>

                  <select
                    value={
                      complainantPresent ===
                      null
                        ? ""
                        : complainantPresent
                          ? "yes"
                          : "no"
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value

                      if (!value) {
                        setComplainantPresent(
                          null
                        )
                      } else {
                        setComplainantPresent(
                          value ===
                            "yes"
                        )
                      }
                    }}
                    disabled={
                      isSaving ||
                      isDeleting
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Not recorded
                    </option>

                    <option value="yes">
                      Present
                    </option>

                    <option value="no">
                      Absent
                    </option>
                  </select>
                </div>

                {/* RESPONDENT */}

                <div className="space-y-2">
                  <Label>
                    Respondent
                  </Label>

                  <select
                    value={
                      respondentPresent ===
                      null
                        ? ""
                        : respondentPresent
                          ? "yes"
                          : "no"
                    }
                    onChange={(event) => {
                      const value =
                        event.target.value

                      if (!value) {
                        setRespondentPresent(
                          null
                        )
                      } else {
                        setRespondentPresent(
                          value ===
                            "yes"
                        )
                      }
                    }}
                    disabled={
                      isSaving ||
                      isDeleting
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      Not recorded
                    </option>

                    <option value="yes">
                      Present
                    </option>

                    <option value="no">
                      Absent
                    </option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {/* ====================================
              NOTES
          ==================================== */}

          <div className="space-y-2">
            <Label htmlFor="hearing-notes">
              Notes
            </Label>

            <textarea
              id="hearing-notes"
              rows={3}
              value={
                notes
              }
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional hearing notes..."
              disabled={
                isSaving ||
                isDeleting
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* ====================================
              OUTCOME
          ==================================== */}

          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="hearing-outcome">
                Outcome
              </Label>

              <textarea
                id="hearing-outcome"
                rows={4}
                value={
                  outcome
                }
                onChange={(event) =>
                  setOutcome(
                    event.target.value
                  )
                }
                placeholder="Record agreements, mediation results, or hearing outcome..."
                disabled={
                  isSaving ||
                  isDeleting
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}

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

          <DialogFooter className="gap-2 sm:justify-between">
            <div>
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    isSaving ||
                    isDeleting
                  }
                  onClick={() =>
                    void handleArchive()
                  }
                  className="text-destructive"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}

                  Archive
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={
                  isSaving ||
                  isDeleting
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
                  isSaving ||
                  isDeleting
                }
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CalendarPlus className="mr-2 h-4 w-4" />
                )}

                {isSaving
                  ? "Saving..."
                  : isEditMode
                    ? "Save Changes"
                    : "Schedule Hearing"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}