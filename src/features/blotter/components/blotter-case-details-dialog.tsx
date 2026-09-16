import {
  useState,
} from "react"

import {
  CalendarDays,
  CalendarPlus,
  Clock,
  FileClock,
  Forward,
  Handshake,
  LockKeyhole,
  MapPin,
  Pencil,
  Phone,
  Scale,
  UserRound,
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

import {
  BlotterHearingDialog,
} from "@/features/blotter/components/blotter-hearing-dialog"

import {
  BlotterResolutionDialog,
  type BlotterResolutionAction,
} from "@/features/blotter/components/blotter-resolution-dialog"

import {
  useBlotterCase,
  useBlotterCaseHistory,
  useBlotterHearings,
} from "@/features/blotter/hooks/use-blotter"

import type {
  BlotterCase,
  BlotterCaseStatus,
  BlotterHearing,
  BlotterPriority,
} from "@/features/blotter/types"

// ========================================
// PROPS
// ========================================

interface BlotterCaseDetailsDialogProps {
  open: boolean

  onOpenChange: (
    open: boolean
  ) => void

  caseData:
    | BlotterCase
    | null
}

// ========================================
// HELPERS
// ========================================

function formatDate(
  value:
    | string
    | null
) {
  if (!value) {
    return "—"
  }

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
    }
  ).format(date)
}

function formatDateTime(
  value:
    | string
    | null
) {
  if (!value) {
    return "—"
  }

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
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date)
}

function formatTime(
  value:
    | string
    | null
) {
  if (!value) {
    return "—"
  }

  const parts =
    value.split(":")

  if (
    parts.length < 2
  ) {
    return value
  }

  const hour =
    Number(parts[0])

  const minute =
    Number(parts[1])

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return value
  }

  const date =
    new Date()

  date.setHours(
    hour,
    minute,
    0,
    0
  )

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date)
}

function formatLabel(
  value: string
) {
  return value
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )
}

function getStatusClass(
  status: BlotterCaseStatus
) {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800"

    case "under_mediation":
      return "bg-amber-100 text-amber-800"

    case "settled":
      return "bg-green-100 text-green-800"

    case "referred":
      return "bg-blue-100 text-blue-800"

    case "dismissed":
      return "bg-muted text-muted-foreground"

    case "closed":
      return "bg-slate-100 text-slate-800"

    default:
      return "bg-muted text-muted-foreground"
  }
}

function getPriorityClass(
  priority: BlotterPriority
) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800"

    case "high":
      return "bg-orange-100 text-orange-800"

    case "normal":
      return "bg-blue-100 text-blue-800"

    case "low":
      return "bg-muted text-muted-foreground"

    default:
      return "bg-muted text-muted-foreground"
  }
}

function getHearingStatusClass(
  status: BlotterHearing["status"]
) {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"

    case "completed":
      return "bg-green-100 text-green-800"

    case "rescheduled":
      return "bg-amber-100 text-amber-800"

    case "cancelled":
      return "bg-red-100 text-red-800"

    case "no_show":
      return "bg-orange-100 text-orange-800"

    default:
      return "bg-muted text-muted-foreground"
  }
}

function getResidentFullName(
  resident:
    | BlotterCase["complainant_resident"]
    | BlotterCase["respondent_resident"]
) {
  if (!resident) {
    return null
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

function getResidentAddress(
  resident:
    | BlotterCase["complainant_resident"]
    | BlotterCase["respondent_resident"]
) {
  if (!resident) {
    return null
  }

  return [
    resident.house_number,
    resident.street,
  ]
    .filter(Boolean)
    .join(", ")
}

// ========================================
// COMPONENT
// ========================================

export function BlotterCaseDetailsDialog({
  open,
  onOpenChange,
  caseData,
}: BlotterCaseDetailsDialogProps) {
  const caseId =
    caseData?.id ??
    null

  // ========================================
  // HEARING DIALOG STATE
  // ========================================

  const [
    hearingDialogOpen,
    setHearingDialogOpen,
  ] = useState(false)

  const [
    selectedHearing,
    setSelectedHearing,
  ] =
    useState<BlotterHearing | null>(
      null
    )

  // ========================================
  // RESOLUTION DIALOG STATE
  // ========================================

  const [
    resolutionDialogOpen,
    setResolutionDialogOpen,
  ] = useState(false)

  const [
    resolutionAction,
    setResolutionAction,
  ] =
    useState<BlotterResolutionAction | null>(
      null
    )

  // ========================================
  // CASE
  // ========================================

  const {
    data: freshCase,
    isLoading,
    error,
  } =
    useBlotterCase(
      caseId
    )

  // ========================================
  // HISTORY
  // ========================================

  const {
    data: history = [],
    isLoading:
      historyLoading,
    error:
      historyError,
  } =
    useBlotterCaseHistory(
      caseId
    )

  // ========================================
  // HEARINGS
  // ========================================

  const {
    data: hearings = [],
    isLoading:
      hearingsLoading,
    error:
      hearingsError,
  } =
    useBlotterHearings(
      caseId
    )

  const item =
    freshCase ??
    caseData

  if (!item) {
    return null
  }

  // ========================================
  // COMPLAINANT
  // ========================================

  const complainantName =
    getResidentFullName(
      item.complainant_resident
    ) ||
    item.complainant_name ||
    "Unknown"

  const complainantContact =
    item.complainant_resident
      ?.contact_number ||
    item.complainant_contact_number ||
    "—"

  const complainantAddress =
    getResidentAddress(
      item.complainant_resident
    ) ||
    item.complainant_address ||
    "—"

  // ========================================
  // RESPONDENT
  // ========================================

  const respondentName =
    getResidentFullName(
      item.respondent_resident
    ) ||
    item.respondent_name ||
    "Unknown"

  const respondentContact =
    item.respondent_resident
      ?.contact_number ||
    item.respondent_contact_number ||
    "—"

  const respondentAddress =
    getResidentAddress(
      item.respondent_resident
    ) ||
    item.respondent_address ||
    "—"

  // ========================================
  // HEARING ACTIONS
  // ========================================

  const handleNewHearing =
    () => {
      setSelectedHearing(
        null
      )

      setHearingDialogOpen(
        true
      )
    }

  const handleManageHearing =
    (
      hearing:
        BlotterHearing
    ) => {
      setSelectedHearing(
        hearing
      )

      setHearingDialogOpen(
        true
      )
    }

  // ========================================
  // RESOLUTION ACTION
  // ========================================

  const handleResolutionAction =
    (
      action:
        BlotterResolutionAction
    ) => {
      setResolutionAction(
        action
      )

      setResolutionDialogOpen(
        true
      )
    }

  return (
    <>
      {/* ========================================
          CASE DETAILS
      ======================================== */}

      <Dialog
        open={open}
        onOpenChange={
          onOpenChange
        }
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          {/* ====================================
              HEADER
          ==================================== */}

          <DialogHeader>
            <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <DialogTitle>
                  {
                    item.case_number
                  }
                </DialogTitle>

                <DialogDescription>
                  Complete blotter case
                  information, hearings,
                  mediation, resolution,
                  and activity history.
                </DialogDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    getStatusClass(
                      item.status
                    ),
                  ].join(" ")}
                >
                  {formatLabel(
                    item.status
                  )}
                </span>

                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                    getPriorityClass(
                      item.priority
                    ),
                  ].join(" ")}
                >
                  {formatLabel(
                    item.priority
                  )}
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* ERROR */}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              Unable to refresh
              blotter case details.

              {error instanceof Error && (
                <p className="mt-1 text-xs">
                  {error.message}
                </p>
              )}
            </div>
          )}

          {/* LOADING */}

          {isLoading && (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-lg border bg-muted/40" />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-40 animate-pulse rounded-lg border bg-muted/40" />

                <div className="h-40 animate-pulse rounded-lg border bg-muted/40" />
              </div>
            </div>
          )}

          {/* ====================================
              CASE ACTIONS
          ==================================== */}

          <section className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="font-semibold">
                Case Actions
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Move this blotter
                case through mediation,
                resolution, referral,
                dismissal, and closure.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 p-4">
              {/* OPEN */}

              {item.status ===
                "open" && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      handleResolutionAction(
                        "start_mediation"
                      )
                    }
                  >
                    <Scale className="mr-2 h-4 w-4" />

                    Start Mediation
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleResolutionAction(
                        "refer"
                      )
                    }
                  >
                    <Forward className="mr-2 h-4 w-4" />

                    Refer
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleResolutionAction(
                        "dismiss"
                      )
                    }
                  >
                    <XCircle className="mr-2 h-4 w-4" />

                    Dismiss
                  </Button>
                </>
              )}

              {/* UNDER MEDIATION */}

              {item.status ===
                "under_mediation" && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      handleResolutionAction(
                        "settle"
                      )
                    }
                  >
                    <Handshake className="mr-2 h-4 w-4" />

                    Settle Case
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleResolutionAction(
                        "refer"
                      )
                    }
                  >
                    <Forward className="mr-2 h-4 w-4" />

                    Refer
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleResolutionAction(
                        "dismiss"
                      )
                    }
                  >
                    <XCircle className="mr-2 h-4 w-4" />

                    Dismiss
                  </Button>
                </>
              )}

              {/* RESOLVED */}

              {(
                item.status ===
                  "settled" ||
                item.status ===
                  "referred" ||
                item.status ===
                  "dismissed"
              ) && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    handleResolutionAction(
                      "close"
                    )
                  }
                >
                  <LockKeyhole className="mr-2 h-4 w-4" />

                  Close Case
                </Button>
              )}

              {/* CLOSED */}

              {item.status ===
                "closed" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LockKeyhole className="h-4 w-4" />

                  This case is closed.
                  No further resolution
                  actions are available.
                </div>
              )}
            </div>
          </section>

          {/* ====================================
              INCIDENT INFORMATION
          ==================================== */}

          <section className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="font-semibold">
                Incident Information
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Complaint and incident
                details recorded for this
                case.
              </p>
            </div>

            <div className="space-y-5 p-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Complaint Type
                </p>

                <p className="mt-1 font-medium">
                  {
                    item.complaint_type
                  }
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />

                    Incident Date
                  </div>

                  <p className="mt-1 font-medium">
                    {formatDate(
                      item.incident_date
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-4 w-4" />

                    Incident Time
                  </div>

                  <p className="mt-1 font-medium">
                    {formatTime(
                      item.incident_time
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4" />

                    Location
                  </div>

                  <p className="mt-1 font-medium">
                    {item.incident_location ??
                      "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Incident Details
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                  {
                    item.incident_details
                  }
                </p>
              </div>
            </div>
          </section>

          {/* ====================================
              PARTIES
          ==================================== */}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* COMPLAINANT */}

            <section className="rounded-lg border">
              <div className="flex items-center gap-2 border-b p-4">
                <UserRound className="h-5 w-5" />

                <div>
                  <h3 className="font-semibold">
                    Complainant
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Person who filed the
                    complaint.
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Name
                  </p>

                  <p className="mt-1 font-medium">
                    {
                      complainantName
                    }
                  </p>

                  {item
                    .complainant_resident
                    ?.resident_number && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        item
                          .complainant_resident
                          .resident_number
                      }
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Record Type
                  </p>

                  <p className="mt-1 text-sm">
                    {item.complainant_resident_id
                      ? "Registered Resident"
                      : "External Person"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-4 w-4" />

                    Contact Number
                  </div>

                  <p className="mt-1 text-sm">
                    {
                      complainantContact
                    }
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4" />

                    Address
                  </div>

                  <p className="mt-1 text-sm">
                    {
                      complainantAddress
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* RESPONDENT */}

            <section className="rounded-lg border">
              <div className="flex items-center gap-2 border-b p-4">
                <UserRound className="h-5 w-5" />

                <div>
                  <h3 className="font-semibold">
                    Respondent
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Person named in the
                    complaint.
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Name
                  </p>

                  <p className="mt-1 font-medium">
                    {
                      respondentName
                    }
                  </p>

                  {item
                    .respondent_resident
                    ?.resident_number && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        item
                          .respondent_resident
                          .resident_number
                      }
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Record Type
                  </p>

                  <p className="mt-1 text-sm">
                    {item.respondent_resident_id
                      ? "Registered Resident"
                      : "External Person"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-4 w-4" />

                    Contact Number
                  </div>

                  <p className="mt-1 text-sm">
                    {
                      respondentContact
                    }
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4" />

                    Address
                  </div>

                  <p className="mt-1 text-sm">
                    {
                      respondentAddress
                    }
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ====================================
              CASE MANAGEMENT
          ==================================== */}

          <section className="rounded-lg border">
            <div className="border-b p-4">
              <h3 className="font-semibold">
                Case Management
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Actions, settlement,
                referral and case notes.
              </p>
            </div>

            <div className="grid gap-5 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  Action Taken
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {item.action_taken ??
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Referred To
                </p>

                <p className="mt-1 text-sm">
                  {item.referred_to ??
                    "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Settlement Details
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {item.settlement_details ??
                    "—"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Internal Notes
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {item.notes ??
                    "—"}
                </p>
              </div>
            </div>
          </section>

          {/* ====================================
              HEARINGS & MEDIATION
          ==================================== */}

          <section className="rounded-lg border">
            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">
                  Hearings & Mediation
                </h3>

                <p className="text-xs text-muted-foreground">
                  Scheduled hearings,
                  attendance, mediation
                  and outcomes for this
                  case.
                </p>
              </div>

              {item.status !==
                "closed" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={
                    handleNewHearing
                  }
                >
                  <CalendarPlus className="mr-2 h-4 w-4" />

                  Schedule Hearing
                </Button>
              )}
            </div>

            <div className="p-4">
              {hearingsError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  Unable to load
                  hearings.
                </div>
              )}

              {hearingsLoading && (
                <div className="space-y-3">
                  <div className="h-24 animate-pulse rounded-md bg-muted/40" />

                  <div className="h-24 animate-pulse rounded-md bg-muted/40" />
                </div>
              )}

              {!hearingsLoading &&
                !hearingsError &&
                hearings.length ===
                  0 && (
                  <div className="py-10 text-center">
                    <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground" />

                    <p className="mt-3 font-medium">
                      No hearings
                      scheduled
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      No mediation or
                      hearing records
                      are available for
                      this case.
                    </p>
                  </div>
                )}

              {!hearingsLoading &&
                hearings.length >
                  0 && (
                  <div className="space-y-3">
                    {hearings.map(
                      (
                        hearing
                      ) => (
                        <article
                          key={
                            hearing.id
                          }
                          className="rounded-lg border p-4"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-muted-foreground" />

                                  <p className="font-medium">
                                    {formatDateTime(
                                      hearing.hearing_date
                                    )}
                                  </p>
                                </div>

                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />

                                  <span>
                                    {hearing.venue ??
                                      "Venue not specified"}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span
                                  className={[
                                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                                    getHearingStatusClass(
                                      hearing.status
                                    ),
                                  ].join(
                                    " "
                                  )}
                                >
                                  {formatLabel(
                                    hearing.status
                                  )}
                                </span>
                              </div>

                              {(
                                hearing.complainant_present !==
                                  null ||
                                hearing.respondent_present !==
                                  null
                              ) && (
                                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                                  <p>
                                    Complainant:{" "}
                                    {hearing.complainant_present ===
                                    null
                                      ? "Not recorded"
                                      : hearing.complainant_present
                                        ? "Present"
                                        : "Absent"}
                                  </p>

                                  <p>
                                    Respondent:{" "}
                                    {hearing.respondent_present ===
                                    null
                                      ? "Not recorded"
                                      : hearing.respondent_present
                                        ? "Present"
                                        : "Absent"}
                                  </p>
                                </div>
                              )}

                              {hearing.outcome && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Outcome
                                  </p>

                                  <p className="mt-1 whitespace-pre-wrap text-sm">
                                    {
                                      hearing.outcome
                                    }
                                  </p>
                                </div>
                              )}

                              {hearing.notes && (
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Notes
                                  </p>

                                  <p className="mt-1 whitespace-pre-wrap text-sm">
                                    {
                                      hearing.notes
                                    }
                                  </p>
                                </div>
                              )}
                            </div>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleManageHearing(
                                  hearing
                                )
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />

                              Manage
                            </Button>
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
            </div>
          </section>

          {/* ====================================
              CASE HISTORY
          ==================================== */}

          <section className="rounded-lg border">
            <div className="flex items-center gap-2 border-b p-4">
              <FileClock className="h-5 w-5" />

              <div>
                <h3 className="font-semibold">
                  Case History
                </h3>

                <p className="text-xs text-muted-foreground">
                  Recorded actions and
                  status changes.
                </p>
              </div>
            </div>

            <div className="p-4">
              {historyError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  Unable to load case
                  history.
                </div>
              )}

              {historyLoading && (
                <div className="space-y-3">
                  <div className="h-16 animate-pulse rounded-md bg-muted/40" />

                  <div className="h-16 animate-pulse rounded-md bg-muted/40" />
                </div>
              )}

              {!historyLoading &&
                !historyError &&
                history.length ===
                  0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No case history
                    records found.
                  </div>
                )}

              {!historyLoading &&
                history.length >
                  0 && (
                  <div className="space-y-3">
                    {history.map(
                      (entry) => (
                        <div
                          key={
                            entry.id
                          }
                          className="rounded-md border p-3"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <p className="font-medium">
                              {formatLabel(
                                entry.action
                              )}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {formatDateTime(
                                entry.created_at
                              )}
                            </p>
                          </div>

                          {entry.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {
                                entry.description
                              }
                            </p>
                          )}

                          {entry.old_status &&
                            entry.new_status && (
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full bg-muted px-2 py-1">
                                  {formatLabel(
                                    entry.old_status
                                  )}
                                </span>

                                <span className="text-muted-foreground">
                                  →
                                </span>

                                <span className="rounded-full bg-muted px-2 py-1">
                                  {formatLabel(
                                    entry.new_status
                                  )}
                                </span>
                              </div>
                            )}
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          </section>

          {/* ====================================
              SYSTEM INFORMATION
          ==================================== */}

          <section className="rounded-lg border bg-muted/20 p-4">
            <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
              <p>
                Created:{" "}
                {formatDateTime(
                  item.created_at
                )}
              </p>

              <p>
                Last Updated:{" "}
                {formatDateTime(
                  item.updated_at
                )}
              </p>

              {item.closed_at && (
                <p>
                  Closed:{" "}
                  {formatDateTime(
                    item.closed_at
                  )}
                </p>
              )}
            </div>
          </section>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(
                  false
                )
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================
          HEARING DIALOG
      ======================================== */}

      <BlotterHearingDialog
        open={
          hearingDialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setHearingDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setSelectedHearing(
              null
            )
          }
        }}
        blotterCaseId={
          item.id
        }
        hearing={
          selectedHearing
        }
      />

      {/* ========================================
          RESOLUTION DIALOG
      ======================================== */}

      <BlotterResolutionDialog
        open={
          resolutionDialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setResolutionDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setResolutionAction(
              null
            )
          }
        }}
        caseData={
          item
        }
        action={
          resolutionAction
        }
      />
    </>
  )
}