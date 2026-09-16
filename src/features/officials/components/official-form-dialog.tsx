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

import { useResidents } from "@/features/residents/hooks/use-residents"

import {
  useCreateOfficial,
  useUpdateOfficial,
} from "@/features/officials/hooks/use-officials"

import type {
  Official,
  OfficialFormInput,
  OfficialType,
} from "@/features/officials/types"

interface OfficialFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  official?: Official | null
  defaultType?: OfficialType
}

const barangayPositions = [
  "Punong Barangay",
  "Barangay Kagawad",
  "Barangay Secretary",
  "Barangay Treasurer",
  "Barangay Tanod",
]

const skPositions = [
  "SK Chairperson",
  "SK Kagawad",
  "SK Secretary",
  "SK Treasurer",
]

function getResidentName(
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

export function OfficialFormDialog({
  open,
  onOpenChange,
  official,
  defaultType = "barangay",
}: OfficialFormDialogProps) {
  const {
    data: residents = [],
    isLoading: residentsLoading,
  } = useResidents()

  const createMutation =
    useCreateOfficial()

  const updateMutation =
    useUpdateOfficial()

  const [
    residentId,
    setResidentId,
  ] = useState("")

  const [
    officialType,
    setOfficialType,
  ] =
    useState<OfficialType>(
      defaultType
    )

  const [
    position,
    setPosition,
  ] = useState("")

  const [
    termStart,
    setTermStart,
  ] = useState("")

  const [
    termEnd,
    setTermEnd,
  ] = useState("")

  const [
    isCurrent,
    setIsCurrent,
  ] = useState(true)

  const [
    displayOrder,
    setDisplayOrder,
  ] = useState("0")

  const [
    notes,
    setNotes,
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
    Boolean(official)

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

    if (official) {
      setResidentId(
        official.resident_id ?? ""
      )

      setOfficialType(
        official.official_type
      )

      setPosition(
        official.position
      )

      setTermStart(
        official.term_start ?? ""
      )

      setTermEnd(
        official.term_end ?? ""
      )

      setIsCurrent(
        official.is_current
      )

      setDisplayOrder(
        String(
          official.display_order
        )
      )

      setNotes(
        official.notes ?? ""
      )
    } else {
      setResidentId("")
      setOfficialType(
        defaultType
      )
      setPosition("")
      setTermStart("")
      setTermEnd("")
      setIsCurrent(true)
      setDisplayOrder("0")
      setNotes("")
    }

    setError("")
  }, [
    open,
    official,
    defaultType,
  ])

  const availableResidents =
    useMemo(() => {
      return residents
        .filter(
          (resident) =>
            resident.is_active ||
            resident.id === residentId
        )
        .sort((a, b) => {
          const last =
            a.last_name.localeCompare(
              b.last_name
            )

          if (last !== 0) {
            return last
          }

          return a.first_name.localeCompare(
            b.first_name
          )
        })
    }, [
      residents,
      residentId,
    ])

  const positions =
    officialType === "sk"
      ? skPositions
      : barangayPositions

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!residentId) {
      setError(
        "Please select a resident."
      )
      return
    }

    if (!position.trim()) {
      setError(
        "Position is required."
      )
      return
    }

    if (
      termStart &&
      Number.isNaN(
        new Date(
          `${termStart}T00:00:00`
        ).getTime()
      )
    ) {
      setError(
        "Please enter a valid term start date."
      )
      return
    }

    if (
      termEnd &&
      Number.isNaN(
        new Date(
          `${termEnd}T00:00:00`
        ).getTime()
      )
    ) {
      setError(
        "Please enter a valid term end date."
      )
      return
    }

    if (
      termStart &&
      termEnd &&
      termEnd < termStart
    ) {
      setError(
        "Term end date cannot be earlier than the term start date."
      )
      return
    }

    const displayOrderValue =
      displayOrder.trim()

    const parsedDisplayOrder =
      Number(
        displayOrderValue
      )

    if (
      !displayOrderValue ||
      !Number.isFinite(
        parsedDisplayOrder
      ) ||
      !Number.isInteger(
        parsedDisplayOrder
      ) ||
      parsedDisplayOrder < 0
    ) {
      setError(
        "Display order must be a whole number that is 0 or greater."
      )
      return
    }

    setError("")

    const input:
      OfficialFormInput = {
      resident_id:
        residentId,

      official_type:
        officialType,

      position:
        position.trim(),

      term_start:
        termStart,

      term_end:
        termEnd,

      is_current:
        isCurrent,

      display_order:
        parsedDisplayOrder,

      notes:
        notes.trim(),
    }

    try {
      if (official) {
        await updateMutation.mutateAsync(
          {
            id: official.id,
            input,
          }
        )
      } else {
        await createMutation.mutateAsync(
          input
        )
      }

      onOpenChange(false)
    } catch (saveError) {
      console.error(
        "Official save error:",
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
          "Unable to save official."
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Official"
              : "Add Official"}
          </DialogTitle>

          <DialogDescription>
            Assign a resident as a
            Barangay or SK official.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="official-type">
              Official Type
            </Label>

            <select
              id="official-type"
              value={
                officialType
              }
              onChange={(
                event
              ) => {
                setOfficialType(
                  event.target
                    .value as OfficialType
                )

                setPosition("")
              }}
              disabled={
                isSaving
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="barangay">
                Barangay Official
              </option>

              <option value="sk">
                SK Official
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="official-resident">
              Resident
            </Label>

            <select
              id="official-resident"
              value={
                residentId
              }
              onChange={(
                event
              ) =>
                setResidentId(
                  event.target
                    .value
                )
              }
              disabled={
                isSaving ||
                residentsLoading
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">
                {residentsLoading
                  ? "Loading residents..."
                  : "Select resident"}
              </option>

              {availableResidents.map(
                (
                  resident
                ) => (
                  <option
                    key={
                      resident.id
                    }
                    value={
                      resident.id
                    }
                  >
                    {getResidentName(
                      resident.first_name,
                      resident.middle_name,
                      resident.last_name,
                      resident.suffix
                    )}{" "}
                    (
                    {
                      resident.resident_number
                    }
                    )
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="official-position">
              Position
            </Label>

            <Input
              id="official-position"
              list="official-position-options"
              placeholder={
                officialType ===
                "sk"
                  ? "Example: SK Chairperson"
                  : "Example: Punong Barangay"
              }
              value={
                position
              }
              onChange={(
                event
              ) =>
                setPosition(
                  event.target
                    .value
                )
              }
              disabled={
                isSaving
              }
            />

            <datalist id="official-position-options">
              {positions.map(
                (item) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  />
                )
              )}
            </datalist>

            <p className="text-xs text-muted-foreground">
              Select a suggested
              position or enter a
              custom position.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="term-start">
                Term Start
              </Label>

              <Input
                id="term-start"
                type="date"
                value={
                  termStart
                }
                onChange={(
                  event
                ) =>
                  setTermStart(
                    event.target
                      .value
                  )
                }
                disabled={
                  isSaving
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="term-end">
                Term End
              </Label>

              <Input
                id="term-end"
                type="date"
                value={
                  termEnd
                }
                onChange={(
                  event
                ) =>
                  setTermEnd(
                    event.target
                      .value
                  )
                }
                disabled={
                  isSaving
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-order">
              Display Order
            </Label>

            <Input
              id="display-order"
              type="number"
              min="0"
              step="1"
              value={
                displayOrder
              }
              onChange={(
                event
              ) =>
                setDisplayOrder(
                  event.target
                    .value
                )
              }
              disabled={
                isSaving
              }
            />

            <p className="text-xs text-muted-foreground">
              Lower numbers appear
              first.
            </p>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                isCurrent
              }
              onChange={(
                event
              ) =>
                setIsCurrent(
                  event.target
                    .checked
                )
              }
              disabled={
                isSaving
              }
            />

            <span className="text-sm">
              Current official
            </span>
          </label>

          <div className="space-y-2">
            <Label htmlFor="official-notes">
              Notes
            </Label>

            <textarea
              id="official-notes"
              rows={3}
              value={
                notes
              }
              onChange={(
                event
              ) =>
                setNotes(
                  event.target
                    .value
                )
              }
              disabled={
                isSaving
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(
                  false
                )
              }
              disabled={
                isSaving
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSaving
              }
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Official"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}