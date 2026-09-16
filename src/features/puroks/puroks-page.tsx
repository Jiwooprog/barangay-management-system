import { useMemo, useState } from "react"
import {
  Edit,
  MapPinned,
  Plus,
  Search,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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

import { PurokFormDialog } from "@/features/puroks/components/purok-form-dialog"
import {
  usePuroks,
  useSetPurokStatus,
} from "@/features/puroks/hooks/use-puroks"

import type { Purok } from "@/features/puroks/types"

export function PuroksPage() {
  const {
    data: puroks = [],
    isLoading,
    error,
  } = usePuroks()

  const statusMutation =
    useSetPurokStatus()

  const [search, setSearch] =
    useState("")

  const [dialogOpen, setDialogOpen] =
    useState(false)

  const [selectedPurok, setSelectedPurok] =
    useState<Purok | null>(null)

  const filteredPuroks = useMemo(() => {
    const term = search
      .trim()
      .toLowerCase()

    if (!term) {
      return puroks
    }

    return puroks.filter((purok) => {
      return (
        purok.name
          .toLowerCase()
          .includes(term) ||
        purok.code
          ?.toLowerCase()
          .includes(term) ||
        purok.description
          ?.toLowerCase()
          .includes(term)
      )
    })
  }, [puroks, search])

  const handleAdd = () => {
    setSelectedPurok(null)
    setDialogOpen(true)
  }

  const handleEdit = (purok: Purok) => {
    setSelectedPurok(purok)
    setDialogOpen(true)
  }

  const handleStatusChange = async (
    purok: Purok
  ) => {
    try {
      await statusMutation.mutateAsync({
        id: purok.id,
        isActive: !purok.is_active,
      })
    } catch (error) {
      console.error(
        "Unable to update purok status:",
        error
      )
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          Purok Management
        </h1>

        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load puroks.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPinned className="h-6 w-6" />

            <h1 className="text-2xl font-bold tracking-tight">
              Purok Management
            </h1>
          </div>

          <p className="mt-1 text-muted-foreground">
            Manage barangay puroks and zones.
          </p>
        </div>

        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Purok
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          className="pl-9"
          placeholder="Search puroks..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>
                Description
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading puroks...
                </TableCell>
              </TableRow>
            ) : filteredPuroks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No puroks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPuroks.map(
                (purok) => (
                  <TableRow key={purok.id}>
                    <TableCell className="font-medium">
                      {purok.code ?? "—"}
                    </TableCell>

                    <TableCell>
                      {purok.name}
                    </TableCell>

                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {purok.description ??
                        "—"}
                    </TableCell>

                    <TableCell>
                      {purok.is_active ? (
                        <Badge>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleEdit(purok)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          variant={
                            purok.is_active
                              ? "outline"
                              : "default"
                          }
                          size="sm"
                          disabled={
                            statusMutation.isPending
                          }
                          onClick={() =>
                            void handleStatusChange(
                              purok
                            )
                          }
                        >
                          {purok.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredPuroks.length} purok
        {filteredPuroks.length === 1
          ? ""
          : "s"}
      </div>

      <PurokFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        purok={selectedPurok}
      />
    </div>
  )
}