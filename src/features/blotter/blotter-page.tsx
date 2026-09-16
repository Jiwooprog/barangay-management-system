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
  SlidersHorizontal,
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Scale className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Blotter & Peace and Order
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage barangay complaints, incidents, mediation, and case records.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={
            handleNewCase
          }
          className="h-10 rounded-xl bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800"
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Cases
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  totalSummary
                }
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileWarning className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* OPEN */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Open
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  openCount
                }
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* MEDIATION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Under Mediation
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  mediationCount
                }
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Scale className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* SETTLED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Settled
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  settledCount
                }
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Scale className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =================================
          FILTERS
      ================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
          Search & Filters
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
          {/* SEARCH */}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
            className="h-10 rounded-xl border-slate-200 bg-white pl-9"
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
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
      </section>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-medium text-slate-950">
            Unable to load blotter cases
          </p>

          {error instanceof
            Error && (
            <p className="mt-1 text-xs">
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Blotter Cases
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {totalCases}{" "}
              {totalCases === 1
                ? "case"
                : "cases"}{" "}
              found
            </p>
          </div>

          {isFetching &&
            !isLoading && (
              <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Updating...
              </span>
            )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Case #
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Complaint
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Complainant
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Respondent
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Incident Date
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Priority
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </TableHead>

                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                    className="h-32 text-center text-sm text-slate-500"
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
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <FileWarning className="h-5 w-5" />
                      </div>

                      <p className="mt-3 font-medium text-slate-800">
                        No blotter cases found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Add a new blotter case or adjust your search filters.
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
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      {/* CASE */}

                      <TableCell>
                        <p className="font-medium text-slate-950">
                          {
                            item.case_number
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
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
                            <p className="mt-1 truncate text-xs text-slate-500">
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
                          <p className="text-xs text-slate-500">
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
                          <p className="text-xs text-slate-500">
                            {
                              item
                                .respondent_resident
                                .resident_number
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* DATE */}

                      <TableCell className="whitespace-nowrap text-slate-600">
                        {formatDate(
                          item.incident_date
                        )}
                      </TableCell>

                      {/* PRIORITY */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
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
                            "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
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
                            className="rounded-lg border-slate-200 bg-white"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />

                            View
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
                            className="rounded-lg border-slate-200 bg-white"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />

                            Edit
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

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-800">
                {
                  startRecord
                }
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-800">
                {
                  endRecord
                }
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-800">
                {
                  totalCases
                }
              </span>{" "}
              cases
            </p>

            {isFetching &&
              !isLoading && (
                <p className="mt-1 text-xs text-slate-500">
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
              className="rounded-lg border-slate-200 bg-white"
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

            <span className="min-w-[92px] text-center text-sm text-slate-500">
              Page{" "}
              <span className="font-medium text-slate-800">
                {
                  page
                }
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-800">
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
              className="rounded-lg border-slate-200 bg-white"
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
      </section>

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