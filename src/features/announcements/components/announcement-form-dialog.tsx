import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  useCreateAnnouncement,
  useUpdateAnnouncement,
} from "@/features/announcements/hooks/use-announcements"

import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementFormInput,
  AnnouncementStatus,
} from "@/features/announcements/types"

import { usePuroks } from "@/features/puroks/hooks/use-puroks"

interface AnnouncementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement?: Announcement | null
}

function toDateTimeLocal(
  value: string | null
) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ""
  }

  const offset =
    date.getTimezoneOffset()

  const localDate =
    new Date(
      date.getTime() -
        offset * 60 * 1000
    )

  return localDate
    .toISOString()
    .slice(0, 16)
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
}: AnnouncementFormDialogProps) {
  const {
    data: puroks = [],
    isLoading: puroksLoading,
  } = usePuroks()

  const createMutation =
    useCreateAnnouncement()

  const updateMutation =
    useUpdateAnnouncement()

  const [
    title,
    setTitle,
  ] = useState("")

  const [
    content,
    setContent,
  ] = useState("")

  const [
    audience,
    setAudience,
  ] =
    useState<AnnouncementAudience>(
      "all"
    )

  const [
    purokId,
    setPurokId,
  ] = useState("")

  const [
    status,
    setStatus,
  ] =
    useState<AnnouncementStatus>(
      "draft"
    )

  const [
    isPinned,
    setIsPinned,
  ] = useState(false)

  const [
    publishAt,
    setPublishAt,
  ] = useState("")

  const [
    expiresAt,
    setExpiresAt,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  const errorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const isEditing =
    Boolean(announcement)

  useEffect(
    () => {
      if (
        !error ||
        !open
      ) {
        return
      }

      const timer =
        window.setTimeout(
          () => {
            errorRef.current
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
          },
          50
        )

      return () => {
        window.clearTimeout(
          timer
        )
      }
    },
    [
      error,
      open,
    ]
  )

  useEffect(() => {
    if (!open) {
      return
    }

    if (announcement) {
      setTitle(
        announcement.title
      )

      setContent(
        announcement.content
      )

      setAudience(
        announcement.audience
      )

      setPurokId(
        announcement.purok_id ??
          ""
      )

      setStatus(
        announcement.status
      )

      setIsPinned(
        announcement.is_pinned
      )

      setPublishAt(
        toDateTimeLocal(
          announcement.publish_at
        )
      )

      setExpiresAt(
        toDateTimeLocal(
          announcement.expires_at
        )
      )
    } else {
      setTitle("")
      setContent("")
      setAudience("all")
      setPurokId("")
      setStatus("draft")
      setIsPinned(false)
      setPublishAt("")
      setExpiresAt("")
    }

    setError("")
  }, [
    open,
    announcement,
  ])

  const availablePuroks =
    useMemo(() => {
      return puroks.filter(
        (purok) =>
          purok.is_active ||
          purok.id === purokId
      )
    }, [
      puroks,
      purokId,
    ])

  const handleAudienceChange = (
    value: AnnouncementAudience
  ) => {
    setAudience(value)

    if (value !== "purok") {
      setPurokId("")
    }
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!title.trim()) {
      setError(
        "Announcement title is required."
      )
      return
    }

    if (!content.trim()) {
      setError(
        "Announcement content is required."
      )
      return
    }

    if (
      audience === "purok" &&
      !purokId
    ) {
      setError(
        "Please select a purok for this announcement."
      )
      return
    }

    const parsedPublishAt =
      publishAt
        ? new Date(
            publishAt
          )
        : null

    if (
      parsedPublishAt &&
      Number.isNaN(
        parsedPublishAt.getTime()
      )
    ) {
      setError(
        "Please enter a valid publish date and time."
      )
      return
    }

    const parsedExpiresAt =
      expiresAt
        ? new Date(
            expiresAt
          )
        : null

    if (
      parsedExpiresAt &&
      Number.isNaN(
        parsedExpiresAt.getTime()
      )
    ) {
      setError(
        "Please enter a valid expiry date and time."
      )
      return
    }

    if (
      parsedPublishAt &&
      parsedExpiresAt &&
      parsedExpiresAt <=
        parsedPublishAt
    ) {
      setError(
        "Expiry date must be later than the publish date."
      )
      return
    }

    const input:
      AnnouncementFormInput = {
      title: title.trim(),

      content:
        content.trim(),

      audience,

      purok_id:
        audience === "purok"
          ? purokId
          : null,

      status,

      is_pinned:
        isPinned,

      publish_at:
        parsedPublishAt
          ? parsedPublishAt.toISOString()
          : "",

      expires_at:
        parsedExpiresAt
          ? parsedExpiresAt.toISOString()
          : "",
    }

    try {
      setError("")

      if (announcement) {
        await updateMutation.mutateAsync({
          id: announcement.id,
          input,
        })
      } else {
        await createMutation.mutateAsync(
          input
        )
      }

      onOpenChange(false)
    } catch (saveError) {
      console.error(
        "Announcement save error:",
        saveError
      )

      if (
        typeof saveError ===
          "object" &&
        saveError !== null &&
        "message" in saveError
      ) {
        setError(
          String(
            saveError.message
          )
        )
      } else {
        setError(
          "Unable to save announcement."
        )
      }
    }
  }

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Announcement"
              : "Add Announcement"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the announcement information."
              : "Create a new barangay announcement."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* TITLE */}

          <div className="space-y-2">
            <Label htmlFor="announcement-title">
              Title
            </Label>

            <Input
              id="announcement-title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Barangay Clean-Up Drive"
              disabled={isSaving}
            />
          </div>

          {/* CONTENT */}

          <div className="space-y-2">
            <Label htmlFor="announcement-content">
              Content
            </Label>

            <textarea
              id="announcement-content"
              rows={7}
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              placeholder="Enter the announcement details..."
              disabled={isSaving}
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            />

            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          </div>

          {/* AUDIENCE */}

          <div className="space-y-2">
            <Label htmlFor="announcement-audience">
              Audience
            </Label>

            <select
              id="announcement-audience"
              value={audience}
              onChange={(event) =>
                handleAudienceChange(
                  event.target
                    .value as AnnouncementAudience
                )
              }
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
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

          {/* PUROK */}

          {audience === "purok" && (
            <div className="space-y-2">
              <Label htmlFor="announcement-purok">
                Purok
              </Label>

              <select
                id="announcement-purok"
                value={purokId}
                onChange={(event) =>
                  setPurokId(
                    event.target.value
                  )
                }
                disabled={
                  isSaving ||
                  puroksLoading
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {puroksLoading
                    ? "Loading puroks..."
                    : "Select purok"}
                </option>

                {availablePuroks.map(
                  (purok) => (
                    <option
                      key={purok.id}
                      value={purok.id}
                    >
                      {purok.name}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* STATUS */}

          <div className="space-y-2">
            <Label htmlFor="announcement-status">
              Status
            </Label>

            <select
              id="announcement-status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as AnnouncementStatus
                )
              }
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>
            </select>

            <p className="text-xs text-muted-foreground">
              Draft announcements are
              visible to staff but not
              residents.
            </p>
          </div>

          {/* DATES */}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-publish-at">
                Publish Date
              </Label>

              <Input
                id="announcement-publish-at"
                type="datetime-local"
                value={publishAt}
                onChange={(event) =>
                  setPublishAt(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

              <p className="text-xs text-muted-foreground">
                Leave empty to make a
                published announcement
                available immediately.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-expires-at">
                Expiry Date
              </Label>

              <Input
                id="announcement-expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) =>
                  setExpiresAt(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />

              <p className="text-xs text-muted-foreground">
                Optional. Leave empty if
                the announcement should
                not expire.
              </p>
            </div>
          </div>

          {/* PIN */}

          <div className="rounded-md border p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(event) =>
                  setIsPinned(
                    event.target.checked
                  )
                }
                disabled={isSaving}
                className="mt-1"
              />

              <div>
                <p className="text-sm font-medium">
                  Pin announcement
                </p>

                <p className="text-xs text-muted-foreground">
                  Pinned announcements
                  appear before regular
                  announcements.
                </p>
              </div>
            </label>
          </div>

          {/* ERROR */}

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          {/* BUTTONS */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}