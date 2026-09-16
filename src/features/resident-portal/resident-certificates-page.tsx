import {
  useMemo,
  useState,
} from "react"

import {
  Download,
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
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Resident Portal
          </p>

          <h1 className="text-2xl font-bold tracking-tight">
            My Certificates
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Request barangay certificates,
            monitor their status, and
            download issued documents.
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

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Total Requests
          </p>

          <p className="mt-2 text-3xl font-bold">
            {requests.length}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Pending
          </p>

          <p className="mt-2 text-3xl font-bold">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Approved
          </p>

          <p className="mt-2 text-3xl font-bold">
            {approvedCount}
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <p className="text-sm text-muted-foreground">
            Issued
          </p>

          <p className="mt-2 text-3xl font-bold">
            {issuedCount}
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search certificates..."
            className="pl-9"
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
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
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

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="font-medium text-destructive">
            Unable to load certificate
            requests
          </p>

          {error instanceof Error && (
            <p className="mt-1 text-xs text-destructive">
              {error.message}
            </p>
          )}
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Request #
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
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
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
                      className="h-32 text-center"
                    >
                      <FileText className="mx-auto h-8 w-8 text-muted-foreground" />

                      <p className="mt-3 font-medium">
                        No certificate
                        requests found
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Your certificate
                        requests will
                        appear here.
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
                    >
                      {/* REQUEST */}

                      <TableCell>
                        <p className="font-medium">
                          {
                            request.request_number
                          }
                        </p>

                        {request.certificate_number && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Cert:{" "}
                            {
                              request.certificate_number
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* TYPE */}

                      <TableCell>
                        {request
                          .certificate_types
                          ?.name ??
                          "Certificate"}
                      </TableCell>

                      {/* PURPOSE */}

                      <TableCell>
                        <p className="max-w-[220px]">
                          {
                            request.purpose
                          }
                        </p>

                        {request.business_name && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {
                              request.business_name
                            }
                          </p>
                        )}
                      </TableCell>

                      {/* PAYMENT */}

                      <TableCell>
                        <p className="capitalize">
                          {
                            request.payment_status
                          }
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatAmount(
                            request.amount
                          )}
                        </p>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
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
                            <p className="mt-2 max-w-[180px] text-xs text-red-700">
                              {
                                request.rejection_reason
                              }
                            </p>
                          )}
                      </TableCell>

                      {/* DATE */}

                      <TableCell className="whitespace-nowrap">
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
                            >
                              <Download className="mr-2 h-4 w-4" />

                              {generatingPdfId ===
                              request.id
                                ? "Generating..."
                                : "Download PDF"}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
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
      </div>

      {/* COUNT */}

      <p className="text-sm text-muted-foreground">
        {filteredRequests.length}{" "}
        {filteredRequests.length ===
        1
          ? "request"
          : "requests"}
      </p>

      {/* NEW REQUEST DIALOG */}

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