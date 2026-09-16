import {
  useEffect,
  useState,
} from "react"

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  House,
  Plus,
  Search,
  SlidersHorizontal,
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

import { HouseholdFormDialog } from "@/features/households/components/household-form-dialog"

import {
  usePaginatedHouseholds,
  useSetHouseholdStatus,
} from "@/features/households/hooks/use-households"

import type {
  Household,
} from "@/features/households/types"

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE =
  20

// ========================================
// HELPERS
// ========================================

function getHouseholdHeadName(
  household:
    Household
) {
  const head =
    household.household_head

  if (!head) {
    return "—"
  }

  return [
    head.first_name,
    head.middle_name,
    head.last_name,
    head.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

function getAddress(
  household:
    Household
) {
  const address = [
    household.house_number,
    household.street,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    address ||
    "—"
  )
}

// ========================================
// PAGE
// ========================================

export function HouseholdsPage() {
  // ========================================
  // FILTER STATES
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
      | "all"
      | "active"
      | "inactive"
    >(
      "all"
    )

  const [
    page,
    setPage,
  ] =
    useState(1)

  // ========================================
  // DIALOG STATES
  // ========================================

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false)

  const [
    selectedHousehold,
    setSelectedHousehold,
  ] =
    useState<
      Household | null
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
  // PAGINATED DATA
  // ========================================

  const {
    data:
      householdResult,
    isLoading,
    isFetching,
    error,
  } =
    usePaginatedHouseholds({
      search:
        debouncedSearch,

      status:
        statusFilter,

      page,

      pageSize:
        PAGE_SIZE,
    })

  const households =
    householdResult?.data ??
    []

  const totalHouseholds =
    householdResult?.count ??
    0

  // ========================================
  // PAGINATION
  // ========================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalHouseholds /
          PAGE_SIZE
      )
    )

  const startRecord =
    totalHouseholds ===
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
      totalHouseholds
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
  // STATUS MUTATION
  // ========================================

  const statusMutation =
    useSetHouseholdStatus()

  // ========================================
  // ACTIONS
  // ========================================

  const handleAdd =
    () => {
      setSelectedHousehold(
        null
      )

      setDialogOpen(
        true
      )
    }

  const handleEdit = (
    household:
      Household
  ) => {
    setSelectedHousehold(
      household
    )

    setDialogOpen(
      true
    )
  }

  const handleStatusChange =
    async (
      household:
        Household
    ) => {
      try {
        await statusMutation
          .mutateAsync({
            id:
              household.id,

            isActive:
              !household.is_active,
          })
      } catch (
        statusError
      ) {
        console.error(
          "Unable to update household status:",
          statusError
        )
      }
    }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <House className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Household Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage barangay households and household members.
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

          Add Household
        </Button>
      </div>

      {/* FILTERS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
          Search & Filters
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
              placeholder="Search households..."
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
                  | "all"
                  | "active"
                  | "inactive"
              )

              resetPage()
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="all">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          Unable to load households.
        </div>
      )}

      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Households
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {totalHouseholds}{" "}
              {totalHouseholds === 1
                ? "household"
                : "households"}{" "}
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
                  Household #
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Purok
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Household Head
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Housing
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
                      7
                    }
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    Loading households...
                  </TableCell>
                </TableRow>
              ) : households.length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      7
                    }
                    className="h-40 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <House className="h-5 w-5" />
                      </div>

                      <p className="mt-3 font-medium text-slate-800">
                        No households found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing the search or status filter.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                households.map(
                  (
                    household
                  ) => (
                    <TableRow
                      key={
                        household.id
                      }
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      <TableCell className="whitespace-nowrap font-medium text-slate-700">
                        {
                          household.household_number
                        }
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-slate-600">
                        {household
                          .puroks
                          ?.name ??
                          "—"}
                      </TableCell>

                      <TableCell className="min-w-[180px] text-slate-600">
                        {getAddress(
                          household
                        )}
                      </TableCell>

                      <TableCell className="min-w-[180px] font-medium text-slate-800">
                        {getHouseholdHeadName(
                          household
                        )}
                      </TableCell>

                      <TableCell className="capitalize text-slate-600">
                        {household.housing_status ??
                          "—"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            household.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(
                            " "
                          )}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              household.is_active
                                ? "bg-emerald-500"
                                : "bg-slate-400",
                            ].join(
                              " "
                            )}
                          />

                          {household.is_active
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
                                household
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
                                household
                              )
                            }
                            className={
                              household.is_active
                                ? "rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                : "rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            }
                          >
                            {household.is_active ? (
                              <UserRoundX className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <UserRoundCheck className="mr-1.5 h-3.5 w-3.5" />
                            )}

                            {household.is_active
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
                  totalHouseholds
                }
              </span>{" "}
              households
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

      {/* FORM DIALOG */}

      <HouseholdFormDialog
        open={
          dialogOpen
        }
        onOpenChange={
          setDialogOpen
        }
        household={
          selectedHousehold
        }
      />
    </div>
  )
}