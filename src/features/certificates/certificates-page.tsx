import {
  useEffect,
  useState,
} from "react"

import {
  BadgeCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Plus,
  Search,
  ShieldCheck,
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

import { CertificateRequestDialog } from "@/features/certificates/components/certificate-request-dialog"
import { IssueCertificateDialog } from "@/features/certificates/components/issue-certificate-dialog"
import { ReviewRequestDialog } from "@/features/certificates/components/review-request-dialog"

import {
  useCancelCertificateRequest,
  useCertificateRequestSummary,
  useCertificateTypes,
  usePaginatedCertificateRequests,
} from "@/features/certificates/hooks/use-certificates"

import { generateCertificatePdf } from "@/features/certificates/services/certificate-pdf.service"

import type {
  CertificatePaymentStatus,
  CertificateRequest,
  CertificateRequestStatus,
} from "@/features/certificates/types"

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE =
  20

// ========================================
// HELPERS
// ========================================

function getResidentName(
  request: CertificateRequest
) {
  const resident =
    request.residents

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

function formatDateTime(
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

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  ).format(date)
}

function formatAmount(
  amount: number
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style:
        "currency",

      currency:
        "PHP",
    }
  ).format(
    Number(
      amount ?? 0
    )
  )
}

function getStatusClass(
  status:
    CertificateRequestStatus
) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800"

    case "approved":
      return "bg-blue-100 text-blue-800"

    case "issued":
      return "bg-green-100 text-green-800"

    case "rejected":
      return "bg-red-100 text-red-800"

    case "cancelled":
      return "bg-muted text-muted-foreground"

    default:
      return "bg-muted text-muted-foreground"
  }
}

function getPaymentClass(
  status:
    CertificatePaymentStatus
) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800"

    case "waived":
      return "bg-blue-100 text-blue-800"

    case "unpaid":
      return "bg-amber-100 text-amber-800"

    default:
      return "bg-muted text-muted-foreground"
  }
}

// ========================================
// PAGE
// ========================================

export function CertificatesPage() {
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
      | CertificateRequestStatus
      | "all"
    >(
      "all"
    )

  const [
    paymentFilter,
    setPaymentFilter,
  ] =
    useState<
      | CertificatePaymentStatus
      | "all"
    >(
      "all"
    )

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState("all")

  const [
    page,
    setPage,
  ] =
    useState(1)

  // ========================================
  // DIALOG STATES
  // ========================================

  const [
    requestDialogOpen,
    setRequestDialogOpen,
  ] =
    useState(false)

  const [
    reviewDialogOpen,
    setReviewDialogOpen,
  ] =
    useState(false)

  const [
    issueDialogOpen,
    setIssueDialogOpen,
  ] =
    useState(false)

  const [
    selectedRequest,
    setSelectedRequest,
  ] =
    useState<
      CertificateRequest | null
    >(
      null
    )

  // ========================================
  // PDF STATE
  // ========================================

  const [
    generatingPdfId,
    setGeneratingPdfId,
  ] =
    useState<
      string | null
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
  // CERTIFICATE TYPES
  // ========================================

  const {
    data:
      certificateTypes = [],
  } =
    useCertificateTypes()

  // ========================================
  // PAGINATED REQUESTS
  // ========================================

  const {
    data:
      requestResult,
    isLoading,
    isFetching,
    error,
  } =
    usePaginatedCertificateRequests({
      search:
        debouncedSearch,

      status:
        statusFilter,

      paymentStatus:
        paymentFilter,

      certificateTypeId:
        typeFilter,

      page,

      pageSize:
        PAGE_SIZE,
    })

  // ========================================
  // GLOBAL SUMMARY
  // ========================================

  const {
    data:
      summary,
  } =
    useCertificateRequestSummary()

  const requests =
    requestResult?.data ??
    []

  const totalRequests =
    requestResult?.count ??
    0

  const pendingCount =
    summary?.pending ??
    0

  const approvedCount =
    summary?.approved ??
    0

  const issuedCount =
    summary?.issued ??
    0

  // ========================================
  // PAGINATION
  // ========================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRequests /
          PAGE_SIZE
      )
    )

  const startRecord =
    totalRequests === 0
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
      totalRequests
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
  // CANCEL MUTATION
  // ========================================

  const cancelMutation =
    useCancelCertificateRequest()

  // ========================================
  // REVIEW
  // ========================================

  const handleReview = (
    request:
      CertificateRequest
  ) => {
    setSelectedRequest(
      request
    )

    setReviewDialogOpen(
      true
    )
  }

  // ========================================
  // ISSUE
  // ========================================

  const handleIssue = (
    request:
      CertificateRequest
  ) => {
    setSelectedRequest(
      request
    )

    setIssueDialogOpen(
      true
    )
  }

  // ========================================
  // CANCEL
  // ========================================

  const handleCancel =
    async (
      request:
        CertificateRequest
    ) => {
      const confirmed =
        window.confirm(
          `Cancel certificate request ${request.request_number}?`
        )

      if (!confirmed) {
        return
      }

      try {
        await cancelMutation
          .mutateAsync(
            request.id
          )
      } catch (
        cancelError
      ) {
        console.error(
          "Unable to cancel certificate request:",
          cancelError
        )

        if (
          typeof cancelError ===
            "object" &&
          cancelError !==
            null &&
          "message" in
            cancelError
        ) {
          window.alert(
            String(
              cancelError.message
            )
          )
        } else {
          window.alert(
            "Unable to cancel certificate request."
          )
        }
      }
    }

  // ========================================
  // DOWNLOAD PDF
  // ========================================

  const handleDownloadPdf =
    async (
      request:
        CertificateRequest
    ) => {
      if (
        request.status !==
        "issued"
      ) {
        window.alert(
          "Only issued certificates can be downloaded."
        )

        return
      }

      try {
        setGeneratingPdfId(
          request.id
        )

        await generateCertificatePdf(
          request
        )
      } catch (
        pdfError
      ) {
        console.error(
          "Unable to generate certificate PDF:",
          pdfError
        )

        if (
          typeof pdfError ===
            "object" &&
          pdfError !==
            null &&
          "message" in
            pdfError
        ) {
          window.alert(
            String(
              pdfError.message
            )
          )
        } else {
          window.alert(
            "Unable to generate certificate PDF."
          )
        }
      } finally {
        setGeneratingPdfId(
          null
        )
      }
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
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />

            <h1 className="text-2xl font-bold tracking-tight">
              Certificates
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage certificate requests, approvals, and issuance.
          </p>
        </div>

        <Button
          type="button"
          onClick={() =>
            setRequestDialogOpen(
              true
            )
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          New Request
        </Button>
      </div>

      {/* =================================
          SUMMARY
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-3">
        {/* PENDING */}

        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold">
            {
              pendingCount
            }
          </p>
        </div>

        {/* APPROVED */}

        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            Approved
          </p>

          <p className="mt-1 text-2xl font-bold">
            {
              approvedCount
            }
          </p>
        </div>

        {/* ISSUED */}

        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm text-muted-foreground">
            Issued
          </p>

          <p className="mt-1 text-2xl font-bold">
            {
              issuedCount
            }
          </p>
        </div>
      </div>

      {/* =================================
          FILTERS
      ================================= */}

      <div className="grid gap-3 lg:grid-cols-4">
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
            placeholder="Search requests..."
            className="pl-9"
          />
        </div>

        {/* STATUS FILTER */}

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
                | CertificateRequestStatus
                | "all"
            )

            resetPage()
          }}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">
            All statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="rejected">
            Rejected
          </option>

          <option value="issued">
            Issued
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

        {/* PAYMENT FILTER */}

        <select
          value={
            paymentFilter
          }
          onChange={(
            event
          ) => {
            setPaymentFilter(
              event.target
                .value as
                | CertificatePaymentStatus
                | "all"
            )

            resetPage()
          }}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">
            All payments
          </option>

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

        {/* CERTIFICATE TYPE FILTER */}

        <select
          value={
            typeFilter
          }
          onChange={(
            event
          ) => {
            setTypeFilter(
              event.target.value
            )

            resetPage()
          }}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">
            All certificate types
          </option>

          {certificateTypes.map(
            (
              type
            ) => (
              <option
                key={
                  type.id
                }
                value={
                  type.id
                }
              >
                {
                  type.name
                }
              </option>
            )
          )}
        </select>
      </div>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load certificate requests.
        </div>
      )}

      {/* =================================
          TABLE
      ================================= */}

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Request #
                </TableHead>

                <TableHead>
                  Resident
                </TableHead>

                <TableHead>
                  Certificate
                </TableHead>

                <TableHead>
                  Purpose
                </TableHead>

                <TableHead>
                  Payment
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Requested
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
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading certificate requests...
                  </TableCell>
                </TableRow>
              )}

              {/* =========================
                  EMPTY
              ========================== */}

              {!isLoading &&
                requests.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        8
                      }
                      className="h-24 text-center text-muted-foreground"
                    >
                      No certificate requests found.
                    </TableCell>
                  </TableRow>
                )}

              {/* =========================
                  REQUEST ROWS
              ========================== */}

              {!isLoading &&
                requests.map(
                  (
                    request
                  ) => (
                    <TableRow
                      key={
                        request.id
                      }
                    >
                      {/* ===================
                          REQUEST NUMBER
                      ==================== */}

                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {
                              request.request_number
                            }
                          </p>

                          {request.certificate_number && (
                            <p className="text-xs text-muted-foreground">
                              Cert:{" "}
                              {
                                request.certificate_number
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* ===================
                          RESIDENT
                      ==================== */}

                      <TableCell>
                        <div>
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
                      </TableCell>

                      {/* ===================
                          CERTIFICATE TYPE
                      ==================== */}

                      <TableCell>
                        {request
                          .certificate_types
                          ?.name ??
                          "Unknown"}
                      </TableCell>

                      {/* ===================
                          PURPOSE
                      ==================== */}

                      <TableCell>
                        <p
                          className="max-w-[220px] truncate"
                          title={
                            request.purpose
                          }
                        >
                          {
                            request.purpose
                          }
                        </p>

                        {request.business_name && (
                          <p className="mt-1 max-w-[220px] truncate text-xs text-muted-foreground">
                            {
                              request.business_name
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* ===================
                          PAYMENT
                      ==================== */}

                      <TableCell>
                        <div className="space-y-1">
                          <span
                            className={[
                              "inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize",
                              getPaymentClass(
                                request.payment_status
                              ),
                            ].join(
                              " "
                            )}
                          >
                            {
                              request.payment_status
                            }
                          </span>

                          <p className="text-xs text-muted-foreground">
                            {formatAmount(
                              request.amount
                            )}
                          </p>
                        </div>
                      </TableCell>

                      {/* ===================
                          STATUS
                      ==================== */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize",
                            getStatusClass(
                              request.status
                            ),
                          ].join(
                            " "
                          )}
                        >
                          {
                            request.status
                          }
                        </span>

                        {request.status ===
                          "rejected" &&
                          request.rejection_reason && (
                            <p
                              className="mt-1 max-w-[180px] truncate text-xs text-red-700"
                              title={
                                request.rejection_reason
                              }
                            >
                              {
                                request.rejection_reason
                              }
                            </p>
                          )}
                      </TableCell>

                      {/* ===================
                          REQUESTED
                      ==================== */}

                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(
                          request.requested_at
                        )}
                      </TableCell>

                      {/* ===================
                          ACTIONS
                      ==================== */}

                      <TableCell>
                        <div className="flex min-w-max justify-end gap-2">
                          {/* PENDING */}

                          {request.status ===
                            "pending" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleReview(
                                  request
                                )
                              }
                            >
                              <ShieldCheck className="mr-1 h-3.5 w-3.5" />

                              Review
                            </Button>
                          )}

                          {/* APPROVED */}

                          {request.status ===
                            "approved" && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() =>
                                handleIssue(
                                  request
                                )
                              }
                            >
                              <BadgeCheck className="mr-1 h-3.5 w-3.5" />

                              Issue
                            </Button>
                          )}

                          {/* CANCEL */}

                          {(
                            request.status ===
                              "pending" ||
                            request.status ===
                              "approved"
                          ) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                cancelMutation.isPending
                              }
                              onClick={() =>
                                void handleCancel(
                                  request
                                )
                              }
                            >
                              <Ban className="mr-1 h-3.5 w-3.5" />

                              Cancel
                            </Button>
                          )}

                          {/* DOWNLOAD */}

                          {request.status ===
                            "issued" && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                generatingPdfId ===
                                request.id
                              }
                              onClick={() =>
                                void handleDownloadPdf(
                                  request
                                )
                              }
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />

                              {generatingPdfId ===
                              request.id
                                ? "Generating..."
                                : "Download PDF"}
                            </Button>
                          )}
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
                  totalRequests
                }
              </span>{" "}
              requests
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
                page <= 1 ||
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

      {/* =================================
          CREATE REQUEST DIALOG
      ================================= */}

      <CertificateRequestDialog
        open={
          requestDialogOpen
        }
        onOpenChange={
          setRequestDialogOpen
        }
      />

      {/* =================================
          REVIEW DIALOG
      ================================= */}

      <ReviewRequestDialog
        open={
          reviewDialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setReviewDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setSelectedRequest(
              null
            )
          }
        }}
        request={
          selectedRequest
        }
      />

      {/* =================================
          ISSUE DIALOG
      ================================= */}

      <IssueCertificateDialog
        open={
          issueDialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setIssueDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setSelectedRequest(
              null
            )
          }
        }}
        request={
          selectedRequest
        }
      />
    </div>
  )
}