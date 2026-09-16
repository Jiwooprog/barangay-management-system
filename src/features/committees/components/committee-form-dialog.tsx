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
  useCreateCommittee,
  useUpdateCommittee,
} from "@/features/committees/hooks/use-committees"

import type {
  Committee,
  CommitteeFormInput,
} from "@/features/committees/types"

import { useOfficials } from "@/features/officials/hooks/use-officials"

interface CommitteeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  committee?: Committee | null
}

function getOfficialName(
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

export function CommitteeFormDialog({
  open,
  onOpenChange,
  committee,
}: CommitteeFormDialogProps) {
  const {
    data: officials = [],
    isLoading: officialsLoading,
  } = useOfficials()

  const createMutation =
    useCreateCommittee()

  const updateMutation =
    useUpdateCommittee()

  const [name, setName] =
    useState("")

  const [
    description,
    setDescription,
  ] = useState("")

  const [
    chairpersonId,
    setChairpersonId,
  ] = useState("")

  const [error, setError] =
    useState("")

  const errorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const isEditing =
    Boolean(committee)

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending

  useEffect(() => {
    if (!open) {
      return
    }

    if (committee) {
      setName(committee.name)

      setDescription(
        committee.description ?? ""
      )

      setChairpersonId(
        committee.chairperson_official_id ??
          ""
      )
    } else {
      setName("")
      setDescription("")
      setChairpersonId("")
    }

    setError("")
  }, [open, committee])

  useEffect(() => {
    if (!error || !open) {
      return
    }

    const timer =
      window.setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })
      }, 50)

    return () => {
      window.clearTimeout(timer)
    }
  }, [error, open])

  const availableOfficials =
    useMemo(() => {
      return officials
        .filter(
          (official) =>
            official.is_active ||
            official.id ===
              chairpersonId
        )
        .sort(
          (a, b) =>
            a.display_order -
            b.display_order
        )
    }, [
      officials,
      chairpersonId,
    ])

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const cleanedName =
      name.trim()

    const cleanedDescription =
      description.trim()

    if (!cleanedName) {
      setError(
        "Committee name is required."
      )
      return
    }

    if (
      !officialsLoading &&
      chairpersonId &&
      !availableOfficials.some(
        (official) =>
          official.id ===
          chairpersonId
      )
    ) {
      setError(
        "The selected chairperson is no longer available. Please choose another official."
      )
      return
    }

    const input:
      CommitteeFormInput = {
      name: cleanedName,
      description:
        cleanedDescription,
      chairperson_official_id:
        chairpersonId || null,
    }

    try {
      setError("")

      if (committee) {
        await updateMutation.mutateAsync({
          id: committee.id,
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
        "Committee save error:",
        saveError
      )

      if (
        typeof saveError ===
          "object" &&
        saveError !== null &&
        "message" in saveError
      ) {
        setError(
          String(saveError.message)
        )
      } else {
        setError(
          "Unable to save committee."
        )
      }
    }
  }

  const handleOpenChange = (
    nextOpen: boolean
  ) => {
    if (
      isSaving &&
      !nextOpen
    ) {
      return
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Committee"
              : "Add Committee"}
          </DialogTitle>

          <DialogDescription>
            Manage the committee name,
            description, and chairperson.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="committee-name">
              Committee Name
            </Label>

            <Input
              id="committee-name"
              value={name}
              onChange={(event) => {
                setName(
                  event.target.value
                )
                setError("")
              }}
              placeholder="Peace and Order Committee"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chairperson">
              Chairperson
            </Label>

            <select
              id="chairperson"
              value={chairpersonId}
              onChange={(event) => {
                setChairpersonId(
                  event.target.value
                )
                setError("")
              }}
              disabled={
                isSaving ||
                officialsLoading
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">
                {officialsLoading
                  ? "Loading officials..."
                  : "No chairperson"}
              </option>

              {availableOfficials.map(
                (official) => {
                  const resident =
                    official.residents

                  const officialName =
                    resident
                      ? getOfficialName(
                          resident.first_name,
                          resident.middle_name,
                          resident.last_name,
                          resident.suffix
                        )
                      : "No resident linked"

                  return (
                    <option
                      key={official.id}
                      value={official.id}
                    >
                      {officialName} —{" "}
                      {official.position}
                    </option>
                  )
                }
              )}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="committee-description">
              Description
            </Label>

            <textarea
              id="committee-description"
              rows={4}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              disabled={isSaving}
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
                  : "Add Committee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
