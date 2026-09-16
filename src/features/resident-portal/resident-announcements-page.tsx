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
    return "bg-blue-100 text-blue-800"
  }

  if (
    announcement.audience ===
    "all"
  ) {
    return "bg-green-100 text-green-800"
  }

  return "bg-violet-100 text-violet-800"
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
      {/* HEADER */}

      <div>
        <p className="text-sm text-muted-foreground">
          Resident Portal
        </p>

        <h1 className="text-2xl font-bold tracking-tight">
          Announcements
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Stay updated with barangay
          notices, activities, and
          announcements relevant to
          you.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Available
                Announcements
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  announcements.length
                }
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Barangay Wide
              </p>

              <p className="mt-2 text-3xl font-bold">
                {
                  barangayWideCount
                }
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                My Purok
              </p>

              <p className="mt-2 text-3xl font-bold">
                {purokCount}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}

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
            placeholder="Search announcements..."
            className="pl-9"
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
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
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

      {/* ERROR */}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="font-medium text-destructive">
            Unable to load
            announcements
          </p>

          {error instanceof Error && (
            <p className="mt-1 text-xs text-destructive">
              {error.message}
            </p>
          )}
        </div>
      )}

      {/* LOADING */}

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
              className="h-56 animate-pulse rounded-lg border bg-muted/40"
            />
          ))}
        </div>
      )}

      {/* EMPTY */}

      {!isLoading &&
        filteredAnnouncements.length ===
          0 && (
          <div className="rounded-lg border bg-background px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>

            <h2 className="mt-4 font-semibold">
              No announcements found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              There are currently no
              published announcements
              matching your selected
              filter.
            </p>
          </div>
        )}

      {/* ANNOUNCEMENT CARDS */}

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
                  className="flex flex-col rounded-lg border bg-background"
                >
                  {/* CARD HEADER */}

                  <div className="border-b p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
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

                        <h2 className="text-lg font-semibold leading-tight">
                          {announcement.title ??
                            "Barangay Announcement"}
                        </h2>
                      </div>

                      <div className="shrink-0 rounded-lg bg-muted p-2">
                        <Megaphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="flex-1 p-5">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {announcement.content ??
                        "No announcement details provided."}
                    </p>
                  </div>

                  {/* DETAILS */}

                  <div className="space-y-3 border-t px-5 py-4">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />

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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-4 w-4" />

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

      {/* RESULT COUNT */}

      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {
            filteredAnnouncements.length
          }{" "}
          {filteredAnnouncements.length ===
          1
            ? "announcement"
            : "announcements"}
        </p>
      )}
    </div>
  )
}