import {
  useEffect,
  useState,
} from "react"

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileWarning,
  Pencil,
  Plus,
  Search,
  ShieldAlert,
  Scale,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  useBlotterCaseSummary,
  usePaginatedBlotterCases,
} from "@/features/blotter/hooks/use-blotter"

import {
  BlotterCaseDialog,
} from "@/features/blotter/components/blotter-case-dialog"

import {
  BlotterCaseDetailsDialog,
} from "@/features/blotter/components/blotter-case-details-dialog"

import type {
  BlotterCase,
  BlotterCaseStatus,
  BlotterPriority,
} from "@/features/blotter/types"

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE =
  20

// ========================================
// HELPERS
// ========================================

function formatDate(
  value: string | null
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
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",
    }
  ).format(date)
}

function formatStatus(
  value: string
) {
  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    )
}

function getResidentName(
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

function getComplainantName(
  item: BlotterCase
) {
  return (
    getResidentName(
      item.complainant_resident
    ) ||
    item.complainant_name ||
    "Unknown"
  )
}

function getRespondentName(
  item: BlotterCase
) {
  return (
    getResidentName(
      item.respondent_resident
    ) ||
    item.respondent_name ||
    "Unknown"
  )
}

function getStatusClass(
  status:
    BlotterCaseStatus
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
  priority:
    BlotterPriority
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

// ========================================
// PAGE
// ========================================

export function BlotterPage() {
  // ========================================
  // FILTER STATES
  // ========================================

  const [
    search,
    setSearch,
  ] =
    useState("")

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] =
    useState("")

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<
      | BlotterCaseStatus
      | "all"
    >(
      "all"
    )

  const [
    priorityFilter,
    setPriorityFilter,
  ] =
    useState<
      | BlotterPriority
      | "all"
    >(
      "all"
    )

  const [
    page,
    setPage,
  ] =
    useState(1)

  // ========================================
  // CREATE / EDIT DIALOG
  // ========================================

  const [
    caseDialogOpen,
    setCaseDialogOpen,
  ] =
    useState(false)

  const [
    selectedCase,
    setSelectedCase,
  ] =
    useState<
      BlotterCase | null
    >(
      null
    )

  // ========================================
  // DETAILS DIALOG
  // ========================================

  const [
    detailsDialogOpen,
    setDetailsDialogOpen,
  ] =
    useState(false)

  const [
    detailsCase,
    setDetailsCase,
  ] =
    useState<
      BlotterCase | null
    >(
      null
    )

  // ========================================
  // SEARCH DEBOUNCE
  // ========================================

  useEffect(
    () => {
      const timer =
        window.setTimeout(
          () => {
            setDebouncedSearch(
              search.trim()
            )
          },
          350
        )

      return () => {
        window.clearTimeout(
          timer
        )
      }
    },
    [
      search,
    ]
  )

  // ========================================
  // PAGINATED CASES
  // ========================================

  const {
    data:
      caseResult,
    isLoading,
    isFetching,
    error,
  } =
    usePaginatedBlotterCases({
      search:
        debouncedSearch,

      status:
        statusFilter,

      priority:
        priorityFilter,

      page,

      pageSize:
        PAGE_SIZE,
    })

  const cases =
    caseResult?.data ??
    []

  const totalCases =
    caseResult?.count ??
    0

  // ========================================
  // GLOBAL SUMMARY
  // ========================================

  const {
    data:
      summary,
  } =
    useBlotterCaseSummary()

  const totalSummary =
    summary?.total ??
    0

  const openCount =
    summary?.open ??
    0

  const mediationCount =
    summary?.underMediation ??
    0

  const settledCount =
    summary?.settled ??
    0

  // ========================================
  // PAGINATION
  // ========================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCases /
          PAGE_SIZE
      )
    )

  const startRecord =
    totalCases === 0
      ? 0
      : (
          page -
          1
        ) *
          PAGE_SIZE +
        1

  const endRecord =
    Math.min(
      page *
        PAGE_SIZE,
      totalCases
    )

  useEffect(
    () => {
      if (
        page >
        totalPages
      ) {
        setPage(
          totalPages
        )
      }
    },
    [
      page,
      totalPages,
    ]
  )

  function resetPage() {
    setPage(1)
  }

  // ========================================
  // ACTIONS
  // ========================================

  const handleNewCase =
    () => {
      setSelectedCase(
        null
      )

      setCaseDialogOpen(
        true
      )
    }

  const handleViewCase = (
    item:
      BlotterCase
  ) => {
    setDetailsCase(
      item
    )

    setDetailsDialogOpen(
      true
    )
  }

  const handleEditCase = (
    item:
      BlotterCase
  ) => {
    setSelectedCase(
      item
    )

    setCaseDialogOpen(
      true
    )
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Blotter & Peace and Order
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage barangay complaints, incidents,
            mediation, and case records.
          </p>
        </div>

        <Button
          type="button"
          onClick={
            handleNewCase
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          New Case
        </Button>
      </div>

      {/* =================================
          SUMMARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Cases
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  totalSummary
                }
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <FileWarning className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* OPEN */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Open
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  openCount
                }
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* MEDIATION */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Under Mediation
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  mediationCount
                }
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <Scale className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* SETTLED */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Settled
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  settledCount
                }
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <Scale className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =================================
          FILTERS
      ================================= */}

      <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
        {/* SEARCH */}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={
              search
            }
            onChange={(
              event
            ) => {
              setSearch(
                event.target.value
              )

              resetPage()
            }}
            placeholder="Search case number, complainant, respondent..."
            className="pl-9"
          />
        </div>

        {/* STATUS */}

        <select
          value={
            statusFilter
          }
          onChange={(
            event
          ) => {
            setStatusFilter(
              event.target
                .value as
                | BlotterCaseStatus
                | "all"
            )

            resetPage()
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">
            All statuses
          </option>

          <option value="open">
            Open
          </option>

          <option value="under_mediation">
            Under Mediation
          </option>

          <option value="settled">
            Settled
          </option>

          <option value="referred">
            Referred
          </option>

          <option value="dismissed">
            Dismissed
          </option>

          <option value="closed">
            Closed
          </option>
        </select>

        {/* PRIORITY */}

        <select
          value={
            priorityFilter
          }
          onChange={(
            event
          ) => {
            setPriorityFilter(
              event.target
                .value as
                | BlotterPriority
                | "all"
            )

            resetPage()
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">
            All priorities
          </option>

          <option value="urgent">
            Urgent
          </option>

          <option value="high">
            High
          </option>

          <option value="normal">
            Normal
          </option>

          <option value="low">
            Low
          </option>
        </select>
      </div>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="font-medium text-destructive">
            Unable to load blotter cases
          </p>

          {error instanceof
            Error && (
            <p className="mt-1 text-xs text-destructive">
              {
                error.message
              }
            </p>
          )}
        </div>
      )}

      {/* =================================
          TABLE
      ================================= */}

      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Case #
                </TableHead>

                <TableHead>
                  Complaint
                </TableHead>

                <TableHead>
                  Complainant
                </TableHead>

                <TableHead>
                  Respondent
                </TableHead>

                <TableHead>
                  Incident Date
                </TableHead>

                <TableHead>
                  Priority
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* =========================
                  LOADING
              ========================== */}

              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={
                      8
                    }
                    className="h-28 text-center text-muted-foreground"
                  >
                    Loading blotter cases...
                  </TableCell>
                </TableRow>
              )}

              {/* =========================
                  EMPTY
              ========================== */}

              {!isLoading &&
                cases.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        8
                      }
                      className="h-32 text-center"
                    >
                      <FileWarning className="mx-auto h-8 w-8 text-muted-foreground" />

                      <p className="mt-3 font-medium">
                        No blotter cases found
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Add a new blotter case or adjust
                        your search filters.
                      </p>
                    </TableCell>
                  </TableRow>
                )}

              {/* =========================
                  ROWS
              ========================== */}

              {!isLoading &&
                cases.map(
                  (
                    item
                  ) => (
                    <TableRow
                      key={
                        item.id
                      }
                    >
                      {/* CASE */}

                      <TableCell>
                        <p className="font-medium">
                          {
                            item.case_number
                          }
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Created{" "}
                          {formatDate(
                            item.created_at
                          )}
                        </p>
                      </TableCell>

                      {/* COMPLAINT */}

                      <TableCell>
                        <div className="max-w-[220px]">
                          <p className="font-medium">
                            {
                              item.complaint_type
                            }
                          </p>

                          {item.incident_location && (
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {
                                item.incident_location
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* COMPLAINANT */}

                      <TableCell>
                        <p className="max-w-[180px] truncate">
                          {getComplainantName(
                            item
                          )}
                        </p>

                        {item
                          .complainant_resident
                          ?.resident_number && (
                          <p className="text-xs text-muted-foreground">
                            {
                              item
                                .complainant_resident
                                .resident_number
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* RESPONDENT */}

                      <TableCell>
                        <p className="max-w-[180px] truncate">
                          {getRespondentName(
                            item
                          )}
                        </p>

                        {item
                          .respondent_resident
                          ?.resident_number && (
                          <p className="text-xs text-muted-foreground">
                            {
                              item
                                .respondent_resident
                                .resident_number
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* DATE */}

                      <TableCell className="whitespace-nowrap">
                        {formatDate(
                          item.incident_date
                        )}
                      </TableCell>

                      {/* PRIORITY */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                            getPriorityClass(
                              item.priority
                            ),
                          ].join(
                            " "
                          )}
                        >
                          {
                            item.priority
                          }
                        </span>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
                            getStatusClass(
                              item.status
                            ),
                          ].join(
                            " "
                          )}
                        >
                          {formatStatus(
                            item.status
                          )}
                        </span>
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleViewCase(
                                item
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />

                            <span className="sr-only">
                              View
                            </span>
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEditCase(
                                item
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />

                            <span className="sr-only">
                              Edit
                            </span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </div>

        {/* =================================
            PAGINATION
        ================================= */}

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {
                  startRecord
                }
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {
                  endRecord
                }
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {
                  totalCases
                }
              </span>{" "}
              cases
            </p>

            {isFetching &&
              !isLoading && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Updating results...
                </p>
              )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page <=
                  1 ||
                isFetching
              }
              onClick={() =>
                setPage(
                  (
                    current
                  ) =>
                    Math.max(
                      1,
                      current -
                        1
                    )
                )
              }
            >
              <ChevronLeft className="mr-1 h-4 w-4" />

              Previous
            </Button>

            <span className="px-2 text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium text-foreground">
                {
                  page
                }
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {
                  totalPages
                }
              </span>
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page >=
                  totalPages ||
                isFetching
              }
              onClick={() =>
                setPage(
                  (
                    current
                  ) =>
                    Math.min(
                      totalPages,
                      current +
                        1
                    )
                )
              }
            >
              Next

              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================
          CREATE / EDIT CASE
      ======================================== */}

      <BlotterCaseDialog
        open={
          caseDialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setCaseDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setSelectedCase(
              null
            )
          }
        }}
        caseData={
          selectedCase
        }
      />

      {/* ========================================
          VIEW CASE DETAILS
      ======================================== */}

      <BlotterCaseDetailsDialog
        open={
          detailsDialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setDetailsDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setDetailsCase(
              null
            )
          }
        }}
        caseData={
          detailsCase
        }
      />
    </div>
  )
}