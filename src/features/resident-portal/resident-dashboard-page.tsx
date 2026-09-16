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
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-lg border bg-muted/50"
              />
            )
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-lg border bg-muted/50" />

          <div className="h-72 animate-pulse rounded-lg border bg-muted/50" />
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
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Unable to load Resident Portal
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Make sure this login
          account is linked to a
          resident record.
        </p>

        {error instanceof Error && (
          <p className="mt-2 text-xs text-destructive">
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
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back
          </p>

          <h1 className="text-2xl font-bold tracking-tight">
            {fullName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View your barangay
            information and
            certificate requests.
          </p>
        </div>

      <Button
           variant="outline"
           className="w-fit"
           render={
    <Link to="/resident/profile" />
       } >
          <User className="mr-2 h-4 w-4" />
           View My Profile
      </Button>

      </div>

      {/* =================================
          RESIDENT INFORMATION
      ================================= */}

      <section className="rounded-lg border bg-background p-5">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />

          <h2 className="font-semibold">
            Resident Information
          </h2>
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Resident Number
            </p>

            <p className="mt-1 font-semibold">
              {profile.resident_number}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Purok
            </p>

            <p className="mt-1 font-semibold">
              {profile.puroks?.name ??
                "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Household
            </p>

            <p className="mt-1 font-semibold">
              {profile.households
                ?.household_number ??
                "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Residency Status
            </p>

            <p className="mt-1 font-semibold capitalize">
              {
                profile.residency_status
              }
            </p>
          </div>
        </div>
      </section>

      {/* =================================
          STAT CARDS
      ================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL REQUESTS */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Certificate Requests
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  totalCertificateRequests
                }
              </p>
            </div>

            <div className="rounded-md bg-muted p-2">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Pending
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  pendingCertificateRequests
                }
              </p>
            </div>

            <div className="rounded-md bg-muted p-2">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ISSUED */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Issued
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  issuedCertificateRequests
                }
              </p>
            </div>

            <div className="rounded-md bg-muted p-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* PUROK */}

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                My Purok
              </p>

              <p className="mt-2 text-lg font-bold">
                {profile.puroks
                  ?.name ??
                  "Unassigned"}
              </p>
            </div>

            <div className="rounded-md bg-muted p-2">
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

        <section className="rounded-lg border bg-background">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">
                Recent Certificate Requests
              </h2>

              <p className="text-xs text-muted-foreground">
                Your latest certificate
                request activity.
              </p>
            </div>

            <Link
              to="/resident/certificates"
              className="text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y">
            {recentCertificateRequests
              .length === 0 && (
              <div className="p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No certificate
                  requests yet
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Your certificate
                  requests will appear
                  here.
                </p>
              </div>
            )}

            {recentCertificateRequests.map(
              (request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {request
                        .certificate_types
                        ?.name ??
                        "Certificate"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
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
                      "shrink-0 rounded-full px-2 py-1 text-xs font-medium capitalize",
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

        <section className="rounded-lg border bg-background">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">
                Recent Announcements
              </h2>

              <p className="text-xs text-muted-foreground">
                Latest barangay
                announcements for you.
              </p>
            </div>

            <Link
              to="/resident/announcements"
              className="text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y">
            {recentAnnouncements.length ===
              0 && (
              <div className="p-6 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  No announcements
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  New barangay
                  announcements will
                  appear here.
                </p>
              </div>
            )}

            {recentAnnouncements.map(
              (announcement) => (
                <div
                  key={
                    announcement.id
                  }
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">
                          {
                            announcement.title
                          }
                        </p>

                        {announcement.is_pinned && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">
                            Pinned
                          </span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {
                          announcement.content
                        }
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
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