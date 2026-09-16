import {
  useEffect,
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
  useCreatePurok,
  useUpdatePurok,
} from "@/features/puroks/hooks/use-puroks"

import type { Purok } from "@/features/puroks/types"

interface PurokFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purok?: Purok | null
}

export function PurokFormDialog({
  open,
  onOpenChange,
  purok,
}: PurokFormDialogProps) {
  const createMutation = useCreatePurok()
  const updateMutation = useUpdatePurok()

  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const errorRef =
    useRef<HTMLDivElement | null>(null)

  const isEditing = Boolean(purok)

  useEffect(() => {
    if (!open) {
      return
    }

    if (purok) {
      setName(purok.name)
      setCode(purok.code ?? "")
      setDescription(purok.description ?? "")
    } else {
      setName("")
      setCode("")
      setDescription("")
    }

    setError("")
  }, [purok, open])

  useEffect(() => {
    if (!error || !open) {
      return
    }

    const timer = window.setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }, 50)

    return () => {
      window.clearTimeout(timer)
    }
  }, [error, open])

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const cleanedName = name.trim()
    const cleanedCode = code.trim()
    const cleanedDescription = description.trim()

    if (!cleanedName) {
      setError("Purok name is required.")
      return
    }

    setError("")

    const input = {
      name: cleanedName,
      code: cleanedCode,
      description: cleanedDescription,
    }

    try {
      if (purok) {
        await updateMutation.mutateAsync({
          id: purok.id,
          input,
        })
      } else {
        await createMutation.mutateAsync(input)
      }

      onOpenChange(false)
    } catch (saveError) {
      console.error(saveError)

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save purok."
      )
    }
  }

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Purok"
              : "Add Purok"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the purok information."
              : "Create a new barangay purok or zone."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="purok-name">
              Name
            </Label>

            <Input
              id="purok-name"
              placeholder="Purok 8"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purok-code">
              Code
            </Label>

            <Input
              id="purok-code"
              placeholder="P08"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purok-description">
              Description
            </Label>

            <Input
              id="purok-description"
              placeholder="Optional description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={isSaving}
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
                  : "Add Purok"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
