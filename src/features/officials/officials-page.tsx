import {
  useMemo,
  useState,
} from "react"

import {
  Edit,
  Plus,
  Search,
  ShieldCheck,
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

import { OfficialAvatar } from "@/features/officials/components/official-avatar"
import { OfficialFormDialog } from "@/features/officials/components/official-form-dialog"

import {
  useOfficials,
  useSetOfficialStatus,
} from "@/features/officials/hooks/use-officials"

import type {
  Official,
  OfficialType,
} from "@/features/officials/types"

function getOfficialName(
  official: Official
) {
  const resident =
    official.residents

  if (!resident) {
    return "No resident linked"
  }

  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  )
}

export function OfficialsPage() {
  const {
    data: officials = [],
    isLoading,
    error,
  } = useOfficials()

  const statusMutation =
    useSetOfficialStatus()

  const [
    activeType,
    setActiveType,
  ] =
    useState<OfficialType>(
      "barangay"
    )

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false)

  const [
    selectedOfficial,
    setSelectedOfficial,
  ] =
    useState<Official | null>(
      null
    )

  const filteredOfficials =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase()

      return officials.filter(
        (official) => {
          if (
            official.official_type !==
            activeType
          ) {
            return false
          }

          if (!searchValue) {
            return true
          }

          const name =
            getOfficialName(
              official
            ).toLowerCase()

          const position =
            official.position.toLowerCase()

          const residentNumber =
            official.residents
              ?.resident_number
              ?.toLowerCase() ??
            ""

          return (
            name.includes(
              searchValue
            ) ||
            position.includes(
              searchValue
            ) ||
            residentNumber.includes(
              searchValue
            )
          )
        }
      )
    }, [
      officials,
      activeType,
      search,
    ])

  const barangayCount =
    officials.filter(
      (official) =>
        official.official_type ===
        "barangay"
    ).length

  const skCount =
    officials.filter(
      (official) =>
        official.official_type ===
        "sk"
    ).length

  const handleAdd = () => {
    setSelectedOfficial(
      null
    )

    setDialogOpen(
      true
    )
  }

  const handleEdit = (
    official: Official
  ) => {
    setSelectedOfficial(
      official
    )

    setDialogOpen(
      true
    )
  }

  const handleStatusChange =
    async (
      official: Official
    ) => {
      try {
        await statusMutation.mutateAsync(
          {
            id: official.id,
            isActive:
              !official.is_active,
          }
        )
      } catch (error) {
        console.error(
          "Unable to update official status:",
          error
        )
      }
    }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Officials Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage Barangay and Sangguniang Kabataan officials.
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

          Add Official
        </Button>
      </div>

      {/* FILTERS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-slate-700">
          Search & Official Type
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Search by name, position, or resident number..."
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setActiveType(
                  "barangay"
                )
              }
              className={[
                "h-10 rounded-xl border-slate-200 px-4",
                activeType === "barangay"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              Barangay Officials

              <span
                className={[
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold",
                  activeType === "barangay"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {barangayCount}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setActiveType(
                  "sk"
                )
              }
              className={[
                "h-10 rounded-xl border-slate-200 px-4",
                activeType === "sk"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  : "bg-white text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              SK Officials

              <span
                className={[
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-semibold",
                  activeType === "sk"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {skCount}
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          Unable to load officials.
        </div>
      )}

      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              {activeType === "barangay"
                ? "Barangay Officials"
                : "SK Officials"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filteredOfficials.length}{" "}
              {filteredOfficials.length === 1
                ? "official"
                : "officials"}{" "}
              found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Photo
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Position
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Term
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Current
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order
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
                    colSpan={8}
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    Loading officials...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                filteredOfficials.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        8
                      }
                      className="h-40 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <ShieldCheck className="h-5 w-5" />
                        </div>

                        <p className="mt-3 font-medium text-slate-800">
                          No{" "}
                          {activeType ===
                          "barangay"
                            ? "Barangay"
                            : "SK"}{" "}
                          officials found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing your search term or add a new official.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              {!isLoading &&
                filteredOfficials.map(
                  (
                    official
                  ) => (
                    <TableRow
                      key={
                        official.id
                      }
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      <TableCell>
                        <OfficialAvatar
                          resident={
                            official.residents
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium text-slate-950">
                            {getOfficialName(
                              official
                            )}
                          </div>

                          {official
                            .residents
                            ?.resident_number && (
                            <div className="mt-0.5 text-xs text-slate-500">
                              {
                                official
                                  .residents
                                  .resident_number
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-slate-800">
                        {
                          official.position
                        }
                      </TableCell>

                      <TableCell>
                        <div className="whitespace-nowrap text-sm text-slate-700">
                          {formatDate(
                            official.term_start
                          )}
                        </div>

                        <div className="whitespace-nowrap text-xs text-slate-500">
                          to{" "}
                          {formatDate(
                            official.term_end
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                            official.is_current
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {official.is_current
                            ? "Current"
                            : "Former"}
                        </span>
                      </TableCell>

                      <TableCell className="text-slate-600">
                        {
                          official.display_order
                        }
                      </TableCell>

                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            official.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              official.is_active
                                ? "bg-emerald-500"
                                : "bg-slate-400",
                            ].join(" ")}
                          />

                          {official.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEdit(
                                official
                              )
                            }
                            className="rounded-lg border-slate-200 bg-white"
                          >
                            <Edit className="mr-1.5 h-3.5 w-3.5" />

                            Edit
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              statusMutation.isPending
                            }
                            onClick={() =>
                              void handleStatusChange(
                                official
                              )
                            }
                            className={
                              official.is_active
                                ? "rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                : "rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            }
                          >
                            {official.is_active ? (
                              <UserRoundX className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <UserRoundCheck className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            {official.is_active
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

        <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-800">
              {
                filteredOfficials.length
              }
            </span>{" "}
            {activeType === "barangay"
              ? "Barangay"
              : "SK"}{" "}
            {filteredOfficials.length === 1
              ? "official"
              : "officials"}
          </p>
        </div>
      </section>

      {/* DIALOG */}

      <OfficialFormDialog
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
            setSelectedOfficial(
              null
            )
          }
        }}
        official={
          selectedOfficial
        }
        defaultType={
          activeType
        }
      />
    </div>
  )
}