import {
  useMemo,
  useState,
} from "react"

import {
  Bell,
  CalendarDays,
  MapPin,
  Megaphone,
  Search,
  Users,
} from "lucide-react"

import { Input } from "@/components/ui/input"

import {
  useMyAnnouncements,
} from "@/features/resident-portal/hooks/use-resident-portal"

// ========================================
// LOCAL DISPLAY TYPE
// ========================================

interface ResidentAnnouncement {
  id: string

  title?: string | null
  content?: string | null

  audience?: string | null

  purok_id?: string | null

  published_at?: string | null
  starts_at?: string | null
  ends_at?: string | null
  created_at?: string | null

  puroks?: {
    id?: string
    name?: string | null
    code?: string | null
  } | null
}

// ========================================
// HELPERS
// ========================================

function formatDateTime(
  value: string | null | undefined
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
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date)
}

function getAudienceLabel(
  announcement: ResidentAnnouncement
) {
  const audience =
    announcement.audience
      ?.toLowerCase()

  if (
    announcement.puroks?.name
  ) {
    return announcement.puroks.name
  }

  if (
    audience === "all"
  ) {
    return "Everyone"
  }

  if (
    audience === "residents"
  ) {
    return "Residents"
  }

  if (
    audience === "purok"
  ) {
    return "Purok Residents"
  }

  if (audience) {
    return audience
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      )
  }

  return "Residents"
}

function getAudienceClass(
  announcement: ResidentAnnouncement
) {
  if (
    announcement.purok_id ||
    announcement.puroks
  ) {
    return "bg-blue-50 text-blue-700"
  }

  if (
    announcement.audience ===
    "all"
  ) {
    return "bg-emerald-50 text-emerald-700"
  }

  return "bg-violet-50 text-violet-700"
}

// ========================================
// PAGE
// ========================================

export function ResidentAnnouncementsPage() {
  const {
    data: rawAnnouncements = [],
    isLoading,
    error,
  } =
    useMyAnnouncements()

  const announcements =
    rawAnnouncements as unknown as ResidentAnnouncement[]

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    filter,
    setFilter,
  ] = useState<
    "all" | "barangay" | "purok"
  >("all")

  // ========================================
  // FILTER
  // ========================================

  const filteredAnnouncements =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase()

      return announcements.filter(
        (announcement) => {
          const title =
            announcement.title
              ?.toLowerCase() ??
            ""

          const content =
            announcement.content
              ?.toLowerCase() ??
            ""

          const purokName =
            announcement.puroks
              ?.name
              ?.toLowerCase() ??
            ""

          const matchesSearch =
            !searchValue ||
            title.includes(
              searchValue
            ) ||
            content.includes(
              searchValue
            ) ||
            purokName.includes(
              searchValue
            )

          const isPurok =
            Boolean(
              announcement.purok_id ||
                announcement.puroks
            )

          const matchesFilter =
            filter === "all" ||
            (
              filter === "purok" &&
              isPurok
            ) ||
            (
              filter ===
                "barangay" &&
              !isPurok
            )

          return (
            matchesSearch &&
            matchesFilter
          )
        }
      )
    }, [
      announcements,
      search,
      filter,
    ])

  // ========================================
  // COUNTS
  // ========================================

  const barangayWideCount =
    announcements.filter(
      (announcement) =>
        !announcement.purok_id &&
        !announcement.puroks
    ).length

  const purokCount =
    announcements.filter(
      (announcement) =>
        Boolean(
          announcement.purok_id ||
            announcement.puroks
        )
    ).length

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Megaphone className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Resident Portal
          </p>

          <h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">
            Announcements
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated with barangay notices, activities, and announcements relevant to you.
          </p>
        </div>
      </div>

      {/* ========================================
          SUMMARY
      ======================================== */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Available Announcements
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  announcements.length
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Published notices for you
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Barangay Wide
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {
                  barangayWideCount
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Notices for all residents
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">
                My Purok
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {purokCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Purok-specific notices
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          SEARCH + FILTER
      ======================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-950">
            Search & Filters
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Search notices or filter between barangay-wide and purok announcements.
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
              placeholder="Search announcements..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target
                  .value as
                  | "all"
                  | "barangay"
                  | "purok"
              )
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">
              All announcements
            </option>

            <option value="barangay">
              Barangay wide
            </option>

            <option value="purok">
              My purok
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
            Unable to load announcements
          </p>

          {error instanceof Error && (
            <p className="mt-1 text-xs text-red-700">
              {error.message}
            </p>
          )}
        </div>
      )}

      {/* ========================================
          LOADING
      ======================================== */}

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            1,
            2,
            3,
            4,
          ].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {/* ========================================
          EMPTY
      ======================================== */}

      {!isLoading &&
        filteredAnnouncements.length ===
          0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Bell className="h-6 w-6" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No announcements found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              There are currently no published announcements matching your selected filter.
            </p>
          </div>
        )}

      {/* ========================================
          ANNOUNCEMENT CARDS
      ======================================== */}

      {!isLoading &&
        filteredAnnouncements.length >
          0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredAnnouncements.map(
              (
                announcement
              ) => (
                <article
                  key={
                    announcement.id
                  }
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* CARD HEADER */}

                  <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              getAudienceClass(
                                announcement
                              ),
                            ].join(
                              " "
                            )}
                          >
                            {getAudienceLabel(
                              announcement
                            )}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold leading-tight text-slate-950">
                          {announcement.title ??
                            "Barangay Announcement"}
                        </h3>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                        <Megaphone className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {announcement.content ??
                        "No announcement details provided."}
                    </p>
                  </div>

                  {/* DETAILS */}

                  <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                      <div>
                        <p>
                          Published:{" "}
                          {formatDateTime(
                            announcement.published_at ??
                              announcement.created_at
                          )}
                        </p>

                        {announcement.starts_at && (
                          <p className="mt-1">
                            Starts:{" "}
                            {formatDateTime(
                              announcement.starts_at
                            )}
                          </p>
                        )}

                        {announcement.ends_at && (
                          <p className="mt-1">
                            Until:{" "}
                            {formatDateTime(
                              announcement.ends_at
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {announcement.puroks
                      ?.name && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />

                        <span>
                          {
                            announcement
                              .puroks
                              .name
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        )}

      {/* ========================================
          RESULT COUNT
      ======================================== */}

      {!isLoading && (
        <div className="flex justify-end">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            {
              filteredAnnouncements.length
            }{" "}
            {filteredAnnouncements.length ===
            1
              ? "announcement"
              : "announcements"}
          </span>
        </div>
      )}
    </div>
  )
}
