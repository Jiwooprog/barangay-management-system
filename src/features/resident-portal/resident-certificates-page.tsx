import {
  useMemo,
  useState,
} from "react"

import {
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Plus,
  Search,
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
  useMyCertificateRequests,
} from "@/features/resident-portal/hooks/use-resident-portal"

import {
  generateCertificatePdf,
} from "@/features/certificates/services/certificate-pdf.service"

import {
  ResidentCertificateRequestDialog,
} from "@/features/resident-portal/components/resident-certificate-request-dialog"

import type {
  CertificateRequest,
  CertificateRequestStatus,
} from "@/features/certificates/types"

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
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date)
}

function formatAmount(
  value: number
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
    }
  ).format(
    Number(value ?? 0)
  )
}

function getStatusClass(
  status: CertificateRequestStatus
) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700"

    case "approved":
      return "bg-blue-50 text-blue-700"

    case "issued":
      return "bg-emerald-50 text-emerald-700"

    case "rejected":
      return "bg-red-50 text-red-700"

    case "cancelled":
      return "bg-slate-100 text-slate-600"

    default:
      return "bg-slate-100 text-slate-600"
  }
}

function getPaymentClass(
  status: string
) {
  const normalized =
    status.toLowerCase()

  if (normalized === "paid") {
    return "bg-emerald-50 text-emerald-700"
  }

  if (
    normalized === "unpaid" ||
    normalized === "pending"
  ) {
    return "bg-amber-50 text-amber-700"
  }

  return "bg-slate-100 text-slate-600"
}

// ========================================
// PAGE
// ========================================

export function ResidentCertificatesPage() {
  const {
    data: requests = [],
    isLoading,
    error,
  } =
    useMyCertificateRequests()

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    CertificateRequestStatus | "all"
  >("all")

  const [
    generatingPdfId,
    setGeneratingPdfId,
  ] = useState<string | null>(
    null
  )

  const [
    requestDialogOpen,
    setRequestDialogOpen,
  ] = useState(false)

  // ========================================
  // FILTERS
  // ========================================

  const filteredRequests =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase()

      return requests.filter(
        (request) => {
          const requestNumber =
            request.request_number
              .toLowerCase()

          const certificateName =
            request.certificate_types
              ?.name
              ?.toLowerCase() ??
            ""

          const certificateNumber =
            request.certificate_number
              ?.toLowerCase() ??
            ""

          const purpose =
            request.purpose
              .toLowerCase()

          const matchesSearch =
            !searchValue ||
            requestNumber.includes(
              searchValue
            ) ||
            certificateName.includes(
              searchValue
            ) ||
            certificateNumber.includes(
              searchValue
            ) ||
            purpose.includes(
              searchValue
            )

          const matchesStatus =
            statusFilter === "all" ||
            request.status ===
              statusFilter

          return (
            matchesSearch &&
            matchesStatus
          )
        }
      )
    }, [
      requests,
      search,
      statusFilter,
    ])

  // ========================================
  // PDF
  // ========================================

  const handleDownloadPdf =
    async (
      request: CertificateRequest
    ) => {
      if (
        request.status !==
        "issued"
      ) {
        return
      }

      try {
        setGeneratingPdfId(
          request.id
        )

        await generateCertificatePdf(
          request
        )
      } catch (pdfError) {
        console.error(
          "Resident certificate PDF error:",
          pdfError
        )

        window.alert(
          "Unable to generate certificate PDF."
        )
      } finally {
        setGeneratingPdfId(
          null
        )
      }
    }

  // ========================================
  // COUNTS
  // ========================================

  const pendingCount =
    requests.filter(
      (request) =>
        request.status ===
        "pending"
    ).length

  const approvedCount =
    requests.filter(
      (request) =>
        request.status ===
        "approved"
    ).length

  const issuedCount =
    requests.filter(
      (request) =>
        request.status ===
        "issued"
    ).length

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <FileText className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Resident Portal
            </p>

            <h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">
              My Certificates
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Request barangay certificates, monitor their status, and download issued documents.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() =>
            setRequestDialogOpen(
              true
            )
          }
          className="h-10 w-fit rounded-xl bg-emerald-700 px-4 text-white hover:bg-emerald-800"
        >
          <Plus className="mr-2 h-4 w-4" />

          New Request
        </Button>
      </div>

      {/* ========================================
          SUMMARY
      ======================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Requests
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {requests.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                All certificate requests
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {pendingCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Awaiting review
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Approved
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {approvedCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Approved for processing
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Issued
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {issuedCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Ready for download
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          FILTERS
      ======================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-950">
            Search & Filters
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Find a request by number, certificate, or purpose.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search certificates..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as
                  | CertificateRequestStatus
                  | "all"
              )
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

            <option value="issued">
              Issued
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </div>
      </section>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-800">
            Unable to load certificate requests
          </p>

          {error instanceof Error && (
            <p className="mt-1 text-xs text-red-700">
              {error.message}
            </p>
          )}
        </div>
      )}

      {/* ========================================
          TABLE
      ======================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Certificate Requests
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Track all certificate requests submitted through your account.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {filteredRequests.length}{" "}
            {filteredRequests.length ===
            1
              ? "request"
              : "requests"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Request #
                </TableHead>

                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Certificate
                </TableHead>

                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Purpose
                </TableHead>

                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment
                </TableHead>

                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </TableHead>

                <TableHead className="h-11 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Requested
                </TableHead>

                <TableHead className="h-11 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-sm text-slate-500"
                  >
                    Loading certificates...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                filteredRequests.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-44 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <FileText className="h-5 w-5" />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-800">
                        No certificate requests found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Your certificate requests will appear here.
                      </p>
                    </TableCell>
                  </TableRow>
                )}

              {!isLoading &&
                filteredRequests.map(
                  (request) => (
                    <TableRow
                      key={
                        request.id
                      }
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      {/* REQUEST */}

                      <TableCell>
                        <p className="font-semibold text-slate-900">
                          {
                            request.request_number
                          }
                        </p>

                        {request.certificate_number && (
                          <p className="mt-1 text-xs text-slate-500">
                            Cert:{" "}
                            {
                              request.certificate_number
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* TYPE */}

                      <TableCell className="font-medium text-slate-800">
                        {request
                          .certificate_types
                          ?.name ??
                          "Certificate"}
                      </TableCell>

                      {/* PURPOSE */}

                      <TableCell>
                        <p className="max-w-[240px] text-sm text-slate-700">
                          {
                            request.purpose
                          }
                        </p>

                        {request.business_name && (
                          <p className="mt-1 text-xs text-slate-500">
                            {
                              request.business_name
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* PAYMENT */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            getPaymentClass(
                              request.payment_status
                            ),
                          ].join(" ")}
                        >
                          {
                            request.payment_status
                          }
                        </span>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatAmount(
                            request.amount
                          )}
                        </p>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                            getStatusClass(
                              request.status
                            ),
                          ].join(" ")}
                        >
                          {
                            request.status
                          }
                        </span>

                        {request.status ===
                          "rejected" &&
                          request.rejection_reason && (
                            <p className="mt-2 max-w-[200px] text-xs leading-5 text-red-700">
                              {
                                request.rejection_reason
                              }
                            </p>
                          )}
                      </TableCell>

                      {/* DATE */}

                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {formatDate(
                          request.requested_at
                        )}
                      </TableCell>

                      {/* ACTION */}

                      <TableCell>
                        <div className="flex justify-end">
                          {request.status ===
                            "issued" ? (
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
                              className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              <Download className="mr-2 h-4 w-4" />

                              {generatingPdfId ===
                              request.id
                                ? "Generating..."
                                : "Download PDF"}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              —
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ========================================
          NEW REQUEST DIALOG
      ======================================== */}

      <ResidentCertificateRequestDialog
        open={
          requestDialogOpen
        }
        onOpenChange={
          setRequestDialogOpen
        }
      />
    </div>
  )
}
