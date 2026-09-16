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
  Undo2,
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
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />

            <h1 className="text-2xl font-bold tracking-tight">
              Announcements
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Create, publish, and manage
            barangay announcements.
          </p>
        </div>

        <Button
          type="button"
          onClick={
            handleAdd
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Announcement
        </Button>
      </div>

      {/* FILTERS */}

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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
            className="pl-9"
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
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
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
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
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

      {/* ERROR */}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load announcements.
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Announcement
                </TableHead>

                <TableHead>
                  Audience
                </TableHead>

                <TableHead>
                  Publish Date
                </TableHead>

                <TableHead>
                  Expiry
                </TableHead>

                <TableHead>
                  Publication
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
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={
                      7
                    }
                    className="h-24 text-center text-muted-foreground"
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
                      className="h-24 text-center text-muted-foreground"
                    >
                      No announcements found.
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
                    >
                      {/* ANNOUNCEMENT */}

                      <TableCell>
                        <div className="max-w-md">
                          <div className="flex items-center gap-2">
                            {announcement.is_pinned && (
                              <Pin className="h-3.5 w-3.5 shrink-0" />
                            )}

                            <p className="font-medium">
                              {
                                announcement.title
                              }
                            </p>
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {truncateContent(
                              announcement.content
                            )}
                          </p>
                        </div>
                      </TableCell>

                      {/* AUDIENCE */}

                      <TableCell>
                        <span className="capitalize">
                          {getAudienceLabel(
                            announcement
                          )}
                        </span>
                      </TableCell>

                      {/* PUBLISH */}

                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(
                          announcement.publish_at
                        )}
                      </TableCell>

                      {/* EXPIRY */}

                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(
                          announcement.expires_at
                        )}
                      </TableCell>

                      {/* PUBLICATION */}

                      <TableCell>
                        <span
                          className={
                            announcement.status ===
                            "published"
                              ? "font-medium text-green-700"
                              : "font-medium text-amber-700"
                          }
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
                          className={
                            announcement.is_active
                              ? "font-medium text-green-700"
                              : "font-medium text-muted-foreground"
                          }
                        >
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
                          >
                            <Edit className="mr-1 h-3.5 w-3.5" />

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
                          >
                            {announcement.status ===
                            "published" ? (
                              <>
                                <Undo2 className="mr-1 h-3.5 w-3.5" />

                                Unpublish
                              </>
                            ) : (
                              <>
                                <Send className="mr-1 h-3.5 w-3.5" />

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
                          >
                            {announcement.is_pinned ? (
                              <>
                                <PinOff className="mr-1 h-3.5 w-3.5" />

                                Unpin
                              </>
                            ) : (
                              <>
                                <Pin className="mr-1 h-3.5 w-3.5" />

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
                          >
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