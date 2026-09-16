import {
  useMemo,
  useState,
} from "react"

import {
  Edit,
  MapPinned,
  Plus,
  Search,
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

import { PurokFormDialog } from "@/features/puroks/components/purok-form-dialog"

import {
  usePuroks,
  useSetPurokStatus,
} from "@/features/puroks/hooks/use-puroks"

import type {
  Purok,
} from "@/features/puroks/types"

export function PuroksPage() {
  const {
    data: puroks = [],
    isLoading,
    error,
  } =
    usePuroks()

  const statusMutation =
    useSetPurokStatus()

  const [
    search,
    setSearch,
  ] =
    useState("")

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false)

  const [
    selectedPurok,
    setSelectedPurok,
  ] =
    useState<
      Purok | null
    >(
      null
    )

  const filteredPuroks =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase()

      if (!term) {
        return puroks
      }

      return puroks.filter(
        (
          purok
        ) => {
          return (
            purok.name
              .toLowerCase()
              .includes(
                term
              ) ||
            purok.code
              ?.toLowerCase()
              .includes(
                term
              ) ||
            purok.description
              ?.toLowerCase()
              .includes(
                term
              )
          )
        }
      )
    }, [
      puroks,
      search,
    ])

  const handleAdd =
    () => {
      setSelectedPurok(
        null
      )

      setDialogOpen(
        true
      )
    }

  const handleEdit = (
    purok: Purok
  ) => {
    setSelectedPurok(
      purok
    )

    setDialogOpen(
      true
    )
  }

  const handleStatusChange =
    async (
      purok: Purok
    ) => {
      try {
        await statusMutation
          .mutateAsync({
            id:
              purok.id,

            isActive:
              !purok.is_active,
          })
      } catch (error) {
        console.error(
          "Unable to update purok status:",
          error
        )
      }
    }

  return (
    <div className="space-y-6">
      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <MapPinned className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Purok Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage barangay puroks and zones.
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

          Add Purok
        </Button>
      </div>

      {/* ====================================
          SEARCH
      ==================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-slate-700">
          Search Puroks
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            placeholder="Search by code, name, or description..."
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>
      </section>

      {/* ====================================
          ERROR
      ==================================== */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          Unable to load puroks.
        </div>
      )}

      {/* ====================================
          TABLE
      ==================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Puroks
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filteredPuroks.length}{" "}
              {filteredPuroks.length === 1
                ? "purok"
                : "puroks"}{" "}
              found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Code
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </TableHead>

                <TableHead className="min-w-[260px] text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      5
                    }
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    Loading puroks...
                  </TableCell>
                </TableRow>
              ) : filteredPuroks.length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      5
                    }
                    className="h-40 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <MapPinned className="h-5 w-5" />
                      </div>

                      <p className="mt-3 font-medium text-slate-800">
                        No puroks found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search term.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPuroks.map(
                  (
                    purok
                  ) => (
                    <TableRow
                      key={
                        purok.id
                      }
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      <TableCell className="whitespace-nowrap font-medium text-slate-700">
                        {purok.code ??
                          "—"}
                      </TableCell>

                      <TableCell className="font-medium text-slate-950">
                        {
                          purok.name
                        }
                      </TableCell>

                      <TableCell className="max-w-xs truncate text-slate-600">
                        {purok.description ??
                          "—"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            purok.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(
                            " "
                          )}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              purok.is_active
                                ? "bg-emerald-500"
                                : "bg-slate-400",
                            ].join(
                              " "
                            )}
                          />

                          {purok.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEdit(
                                purok
                              )
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
                            disabled={
                              statusMutation.isPending
                            }
                            onClick={() =>
                              void handleStatusChange(
                                purok
                              )
                            }
                            className={
                              purok.is_active
                                ? "rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                : "rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            }
                          >
                            {purok.is_active ? (
                              <UserRoundX className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <UserRoundCheck className="mr-1.5 h-3.5 w-3.5" />
                            )}

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

        <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-800">
              {
                filteredPuroks.length
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-800">
              {
                puroks.length
              }
            </span>{" "}
            puroks
          </p>
        </div>
      </section>

      {/* ====================================
          FORM DIALOG
      ==================================== */}

      <PurokFormDialog
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
            setSelectedPurok(
              null
            )
          }
        }}
        purok={
          selectedPurok
        }
      />
    </div>
  )
}
