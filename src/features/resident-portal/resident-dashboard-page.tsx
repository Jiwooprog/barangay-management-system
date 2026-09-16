import {
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  MapPinned,
  User,
} from "lucide-react"

import {
  Link,
} from "react-router-dom"

import { Button } from "@/components/ui/button"

import {
  useResidentDashboardData,
} from "@/features/resident-portal/hooks/use-resident-portal"

import type {
  CertificateRequestStatus,
} from "@/features/certificates/types"

// ========================================
// HELPERS
// ========================================

function getFullName(
  firstName: string,
  middleName: string | null,
  lastName: string,
  suffix: string | null
) {
  return [
    firstName,
    middleName,
    lastName,
    suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

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

// ========================================
// PAGE
// ========================================

export function ResidentPortalDashboardPage() {
  const {
    data,
    isLoading,
    error,
  } =
    useResidentDashboardData()

  // ========================================
  // LOADING
  // ========================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            )
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    )
  }

  // ========================================
  // ERROR
  // ========================================

  if (
    error ||
    !data
  ) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6"
      >
        <h2 className="font-semibold text-red-800">
          Unable to load Resident Portal
        </h2>

        <p className="mt-2 text-sm text-red-700/80">
          Make sure this login account is linked to a resident record.
        </p>

        {error instanceof Error && (
          <p className="mt-2 text-xs text-red-700">
            {error.message}
          </p>
        )}
      </div>
    )
  }

  const {
    profile,
    totalCertificateRequests,
    pendingCertificateRequests,
    issuedCertificateRequests,
    recentCertificateRequests,
    recentAnnouncements,
  } = data

  const fullName =
    getFullName(
      profile.first_name,
      profile.middle_name,
      profile.last_name,
      profile.suffix
    )

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* =================================
          WELCOME
      ================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <User className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Welcome back
            </p>

            <h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">
              {fullName}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View your barangay information and certificate requests.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-10 w-fit rounded-xl border-slate-200 bg-white"
          render={
            <Link to="/resident/profile" />
          }
        >
          <User className="mr-2 h-4 w-4" />

          View My Profile
        </Button>
      </div>

      {/* =================================
          RESIDENT INFORMATION
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <User className="h-4 w-4" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-950">
              Resident Information
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Your registered barangay record at a glance.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Resident Number
            </p>

            <p className="mt-1.5 font-semibold text-slate-950">
              {profile.resident_number}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Purok
            </p>

            <p className="mt-1.5 font-semibold text-slate-950">
              {profile.puroks?.name ??
                "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Household
            </p>

            <p className="mt-1.5 font-semibold text-slate-950">
              {profile.households
                ?.household_number ??
                "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Residency Status
            </p>

            <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
              {
                profile.residency_status
              }
            </span>
          </div>
        </div>
      </section>

      {/* =================================
          STAT CARDS
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL REQUESTS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Certificate Requests
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  totalCertificateRequests
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                All submitted requests
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  pendingCertificateRequests
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Awaiting barangay review
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ISSUED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Issued
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  issuedCertificateRequests
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Completed certificates
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* PUROK */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600">
                My Purok
              </p>

              <p className="mt-2 truncate text-lg font-bold text-slate-950">
                {profile.puroks
                  ?.name ??
                  "Unassigned"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Registered area
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <MapPinned className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =================================
          TWO COLUMN SECTION
      ================================= */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ===============================
            RECENT CERTIFICATE REQUESTS
        =============================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="font-semibold text-slate-950">
                Recent Certificate Requests
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Your latest certificate request activity.
              </p>
            </div>

            <Link
              to="/resident/certificates"
              className="shrink-0 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentCertificateRequests
              .length === 0 && (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-800">
                  No certificate requests yet
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your certificate requests will appear here.
                </p>
              </div>
            )}

            {recentCertificateRequests.map(
              (request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-slate-50/80"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950">
                      {request
                        .certificate_types
                        ?.name ??
                        "Certificate"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        request.request_number
                      }
                      {" • "}
                      {formatDate(
                        request.requested_at
                      )}
                    </p>
                  </div>

                  <span
                    className={[
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      getStatusClass(
                        request.status
                      ),
                    ].join(" ")}
                  >
                    {request.status}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        {/* ===============================
            ANNOUNCEMENTS
        =============================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="font-semibold text-slate-950">
                Recent Announcements
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Latest barangay announcements for you.
              </p>
            </div>

            <Link
              to="/resident/announcements"
              className="shrink-0 text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAnnouncements.length ===
              0 && (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Bell className="h-5 w-5" />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-800">
                  No announcements
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  New barangay announcements will appear here.
                </p>
              </div>
            )}

            {recentAnnouncements.map(
              (announcement) => (
                <div
                  key={
                    announcement.id
                  }
                  className="p-4 transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Bell className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950">
                          {
                            announcement.title
                          }
                        </p>

                        {announcement.is_pinned && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                            Pinned
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                        {
                          announcement.content
                        }
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(
                          announcement.publish_at ??
                            announcement.created_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
