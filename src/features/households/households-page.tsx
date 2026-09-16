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
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">
          Household Management
        </h1>

        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load households.
        </div>
      </div>
    )
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <House className="h-6 w-6" />

            <h1 className="text-2xl font-bold tracking-tight">
              Household Management
            </h1>
          </div>

          <p className="mt-1 text-muted-foreground">
            Manage barangay households
            and household members.
          </p>
        </div>

        <Button
          onClick={
            handleAdd
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Household
        </Button>
      </div>

      {/* FILTERS */}

      <div className="grid gap-3 md:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            className="pl-9"
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
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
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

      {/* TABLE */}

      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Household #
                </TableHead>

                <TableHead>
                  Purok
                </TableHead>

                <TableHead>
                  Address
                </TableHead>

                <TableHead>
                  Household Head
                </TableHead>

                <TableHead>
                  Housing
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      7
                    }
                    className="h-24 text-center text-muted-foreground"
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
                    className="h-24 text-center text-muted-foreground"
                  >
                    No households found.
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
                    >
                      <TableCell className="font-medium">
                        {
                          household.household_number
                        }
                      </TableCell>

                      <TableCell>
                        {household
                          .puroks
                          ?.name ??
                          "—"}
                      </TableCell>

                      <TableCell>
                        {getAddress(
                          household
                        )}
                      </TableCell>

                      <TableCell>
                        {getHouseholdHeadName(
                          household
                        )}
                      </TableCell>

                      <TableCell className="capitalize">
                        {household.housing_status ??
                          "—"}
                      </TableCell>

                      <TableCell>
                        {household.is_active ? (
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
                              handleEdit(
                                household
                              )
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />

                            Edit
                          </Button>

                          <Button
                            variant={
                              household.is_active
                                ? "outline"
                                : "default"
                            }
                            size="sm"
                            disabled={
                              statusMutation.isPending
                            }
                            onClick={() =>
                              void handleStatusChange(
                                household
                              )
                            }
                          >
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
                  totalHouseholds
                }
              </span>{" "}
              households
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