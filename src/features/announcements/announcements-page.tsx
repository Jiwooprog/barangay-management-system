import {
  useEffect,
  useState,
} from "react"

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Megaphone,
  Pin,
  PinOff,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  Undo2,
  UserRoundCheck,
  UserRoundX,
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

import { AnnouncementFormDialog } from "@/features/announcements/components/announcement-form-dialog"

import {
  usePaginatedAnnouncements,
  usePublishAnnouncement,
  useSetAnnouncementPinned,
  useSetAnnouncementStatus,
  useUnpublishAnnouncement,
} from "@/features/announcements/hooks/use-announcements"

import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementStatus,
} from "@/features/announcements/types"

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE =
  20

// ========================================
// HELPERS
// ========================================

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

function getAudienceLabel(
  announcement:
    Announcement
) {
  switch (
    announcement.audience
  ) {
    case "all":
      return "Everyone"

    case "residents":
      return "Residents"

    case "staff":
      return "Barangay Staff"

    case "purok":
      return (
        announcement
          .puroks
          ?.name ??
        "Specific Purok"
      )

    default:
      return announcement
        .audience
  }
}

function truncateContent(
  content: string,
  maxLength =
    90
) {
  if (
    content.length <=
    maxLength
  ) {
    return content
  }

  return `${content.slice(
    0,
    maxLength
  )}...`
}

// ========================================
// PAGE
// ========================================

export function AnnouncementsPage() {
  // ========================================
  // FILTERS
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
      | AnnouncementStatus
      | "all"
    >(
      "all"
    )

  const [
    audienceFilter,
    setAudienceFilter,
  ] =
    useState<
      | AnnouncementAudience
      | "any"
    >(
      "any"
    )

  const [
    page,
    setPage,
  ] =
    useState(1)

  // ========================================
  // DIALOG
  // ========================================

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false)

  const [
    selectedAnnouncement,
    setSelectedAnnouncement,
  ] =
    useState<
      Announcement | null
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
  // PAGINATED QUERY
  // ========================================

  const {
    data:
      announcementResult,
    isLoading,
    isFetching,
    error,
  } =
    usePaginatedAnnouncements({
      search:
        debouncedSearch,

      status:
        statusFilter,

      audience:
        audienceFilter,

      page,

      pageSize:
        PAGE_SIZE,
    })

  const announcements =
    announcementResult
      ?.data ??
    []

  const totalAnnouncements =
    announcementResult
      ?.count ??
    0

  // ========================================
  // PAGINATION
  // ========================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalAnnouncements /
          PAGE_SIZE
      )
    )

  const startRecord =
    totalAnnouncements ===
    0
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
      totalAnnouncements
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
  // MUTATIONS
  // ========================================

  const publishMutation =
    usePublishAnnouncement()

  const unpublishMutation =
    useUnpublishAnnouncement()

  const pinMutation =
    useSetAnnouncementPinned()

  const statusMutation =
    useSetAnnouncementStatus()

  // ========================================
  // ACTIONS
  // ========================================

  const handleAdd =
    () => {
      setSelectedAnnouncement(
        null
      )

      setDialogOpen(
        true
      )
    }

  const handleEdit = (
    announcement:
      Announcement
  ) => {
    setSelectedAnnouncement(
      announcement
    )

    setDialogOpen(
      true
    )
  }

  const handlePublish =
    async (
      announcement:
        Announcement
    ) => {
      try {
        if (
          announcement.status ===
          "published"
        ) {
          await unpublishMutation
            .mutateAsync(
              announcement.id
            )

          return
        }

        await publishMutation
          .mutateAsync(
            announcement.id
          )
      } catch (
        actionError
      ) {
        console.error(
          "Unable to change announcement publication status:",
          actionError
        )
      }
    }

  const handlePin =
    async (
      announcement:
        Announcement
    ) => {
      try {
        await pinMutation
          .mutateAsync({
            id:
              announcement.id,

            isPinned:
              !announcement
                .is_pinned,
          })
      } catch (
        actionError
      ) {
        console.error(
          "Unable to change announcement pin:",
          actionError
        )
      }
    }

  const handleActiveStatus =
    async (
      announcement:
        Announcement
    ) => {
      try {
        await statusMutation
          .mutateAsync({
            id:
              announcement.id,

            isActive:
              !announcement
                .is_active,
          })
      } catch (
        actionError
      ) {
        console.error(
          "Unable to change announcement status:",
          actionError
        )
      }
    }

  const isBusy =
    publishMutation
      .isPending ||
    unpublishMutation
      .isPending ||
    pinMutation
      .isPending ||
    statusMutation
      .isPending

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Megaphone className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Announcements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create, publish, and manage barangay announcements.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={
            handleAdd
          }
          className="h-10 rounded-xl bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Announcement
        </Button>
      </div>

      {/* FILTERS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
          Search & Filters
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder="Search announcements..."
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
            className="h-10 rounded-xl border-slate-200 bg-white pl-9"
          />
        </div>

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
                | AnnouncementStatus
                | "all"
            )

            resetPage()
          }}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="all">
            All statuses
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="published">
            Published
          </option>
        </select>

        <select
          value={
            audienceFilter
          }
          onChange={(
            event
          ) => {
            setAudienceFilter(
              event.target
                .value as
                | AnnouncementAudience
                | "any"
            )

            resetPage()
          }}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="any">
            All audiences
          </option>

          <option value="all">
            Everyone
          </option>

          <option value="residents">
            Residents
          </option>

          <option value="staff">
            Barangay Staff
          </option>

          <option value="purok">
            Specific Purok
          </option>
        </select>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          Unable to load announcements.
        </div>
      )}

      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Announcements
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {totalAnnouncements}{" "}
              {totalAnnouncements === 1
                ? "announcement"
                : "announcements"}{" "}
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
                  Announcement
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Audience
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Publish Date
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expiry
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Publication
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
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={
                      7
                    }
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    Loading announcements...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                announcements.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        7
                      }
                      className="h-40 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Megaphone className="h-5 w-5" />
                        </div>

                        <p className="mt-3 font-medium text-slate-800">
                          No announcements found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing the search or filter options.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              {!isLoading &&
                announcements.map(
                  (
                    announcement
                  ) => (
                    <TableRow
                      key={
                        announcement.id
                      }
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      {/* ANNOUNCEMENT */}

                      <TableCell>
                        <div className="max-w-md">
                          <div className="flex items-center gap-2">
                            {announcement.is_pinned && (
                              <Pin className="h-3.5 w-3.5 shrink-0" />
                            )}

                            <p className="font-medium text-slate-950">
                              {
                                announcement.title
                              }
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {truncateContent(
                              announcement.content
                            )}
                          </p>
                        </div>
                      </TableCell>

                      {/* AUDIENCE */}

                      <TableCell>
                        <span className="capitalize text-slate-700">
                          {getAudienceLabel(
                            announcement
                          )}
                        </span>
                      </TableCell>

                      {/* PUBLISH */}

                      <TableCell className="whitespace-nowrap text-slate-600">
                        {formatDateTime(
                          announcement.publish_at
                        )}
                      </TableCell>

                      {/* EXPIRY */}

                      <TableCell className="whitespace-nowrap text-slate-600">
                        {formatDateTime(
                          announcement.expires_at
                        )}
                      </TableCell>

                      {/* PUBLICATION */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            announcement.status ===
                            "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700",
                          ].join(" ")}
                        >
                          {announcement.status ===
                          "published"
                            ? "Published"
                            : "Draft"}
                        </span>
                      </TableCell>

                      {/* ACTIVE STATUS */}

                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            announcement.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              announcement.is_active
                                ? "bg-emerald-500"
                                : "bg-slate-400",
                            ].join(" ")}
                          />

                          {announcement.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell>
                        <div className="flex min-w-max justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEdit(
                                announcement
                              )
                            }
                            disabled={
                              isBusy
                            }
                            className="rounded-lg border-slate-200 bg-white"
                          >
                            <Edit className="mr-1.5 h-3.5 w-3.5" />

                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void handlePublish(
                                announcement
                              )
                            }
                            disabled={
                              isBusy
                            }
                            className={
                              announcement.status ===
                              "published"
                                ? "rounded-lg border-amber-200 bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                : "rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            }
                          >
                            {announcement.status ===
                            "published" ? (
                              <>
                                <Undo2 className="mr-1.5 h-3.5 w-3.5" />

                                Unpublish
                              </>
                            ) : (
                              <>
                                <Send className="mr-1.5 h-3.5 w-3.5" />

                                Publish
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void handlePin(
                                announcement
                              )
                            }
                            disabled={
                              isBusy
                            }
                            className={
                              announcement.is_pinned
                                ? "rounded-lg border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                : "rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }
                          >
                            {announcement.is_pinned ? (
                              <>
                                <PinOff className="mr-1.5 h-3.5 w-3.5" />

                                Unpin
                              </>
                            ) : (
                              <>
                                <Pin className="mr-1.5 h-3.5 w-3.5" />

                                Pin
                              </>
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void handleActiveStatus(
                                announcement
                              )
                            }
                            disabled={
                              isBusy
                            }
                            className={
                              announcement.is_active
                                ? "rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                : "rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            }
                          >
                            {announcement.is_active ? (
                              <UserRoundX className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <UserRoundCheck className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            {announcement.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}

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
                  totalAnnouncements
                }
              </span>{" "}
              {totalAnnouncements ===
              1
                ? "announcement"
                : "announcements"}
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

      {/* DIALOG */}

      <AnnouncementFormDialog
        open={
          dialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setSelectedAnnouncement(
              null
            )
          }
        }}
        announcement={
          selectedAnnouncement
        }
      />
    </div>
  )
}