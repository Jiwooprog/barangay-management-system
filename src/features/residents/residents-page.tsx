import {
  useEffect,
  useState,
} from "react"

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Search,
  Users,
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

import { ResidentAvatar } from "@/features/residents/components/resident-avatar"
import { ResidentFormDialog } from "@/features/residents/components/resident-form-dialog"

import {
  usePaginatedResidents,
  useResidentPurokOptions,
  useSetResidentStatus,
} from "@/features/residents/hooks/use-residents"

import type {
  Resident,
} from "@/features/residents/types"

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE =
  20

// ========================================
// HELPERS
// ========================================

function calculateAge(
  birthday: string
) {
  const birthDate =
    new Date(birthday)

  const today =
    new Date()

  let age =
    today.getFullYear() -
    birthDate.getFullYear()

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth()

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate()
    )
  ) {
    age--
  }

  return age
}

function getFullName(
  resident: Resident
) {
  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

// ========================================
// PAGE
// ========================================

export function ResidentsPage() {
  // ======================================
  // FILTER STATE
  // ======================================

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
    genderFilter,
    setGenderFilter,
  ] =
    useState("all")

  const [
    purokFilter,
    setPurokFilter,
  ] =
    useState("all")

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

  // ======================================
  // DIALOG
  // ======================================

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false)

  const [
    selectedResident,
    setSelectedResident,
  ] =
    useState<
      Resident | null
    >(
      null
    )

  // ======================================
  // SEARCH DEBOUNCE
  // ======================================

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

  // ======================================
  // DATA
  // ======================================

  const {
    data:
      residentResult,
    isLoading,
    isFetching,
    error,
  } =
    usePaginatedResidents({
      search:
        debouncedSearch,

      gender:
        genderFilter,

      purokId:
        purokFilter,

      status:
        statusFilter,

      page,

      pageSize:
        PAGE_SIZE,
    })

  const {
    data:
      purokOptions = [],
  } =
    useResidentPurokOptions()

  const statusMutation =
    useSetResidentStatus()

  const residents =
    residentResult?.data ??
    []

  const totalResidents =
    residentResult?.count ??
    0

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalResidents /
          PAGE_SIZE
      )
    )

  // ======================================
  // CORRECT PAGE IF DATA SHRINKS
  // ======================================

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

  // ======================================
  // PAGINATION COUNTS
  // ======================================

  const startRecord =
    totalResidents === 0
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
      totalResidents
    )

  // ======================================
  // ADD
  // ======================================

  const handleAdd =
    () => {
      setSelectedResident(
        null
      )

      setDialogOpen(
        true
      )
    }

  // ======================================
  // EDIT
  // ======================================

  const handleEdit = (
    resident: Resident
  ) => {
    setSelectedResident(
      resident
    )

    setDialogOpen(
      true
    )
  }

  // ======================================
  // ACTIVATE / DEACTIVATE
  // ======================================

  const handleStatusChange =
    async (
      resident: Resident
    ) => {
      try {
        await statusMutation
          .mutateAsync({
            id:
              resident.id,

            isActive:
              !resident.is_active,
          })
      } catch (error) {
        console.error(
          "Unable to update resident status:",
          error
        )
      }
    }

  // ======================================
  // RESET PAGE
  // ======================================

  function resetPage() {
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* ===============================
          PAGE HEADER
      ================================ */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />

            <h1 className="text-2xl font-bold tracking-tight">
              Resident Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage barangay resident records.
          </p>
        </div>

        <Button
          onClick={
            handleAdd
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Resident
        </Button>
      </div>

      {/* ===============================
          FILTERS
      ================================ */}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* SEARCH */}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search residents..."
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

        {/* GENDER */}

        <select
          value={
            genderFilter
          }
          onChange={(
            event
          ) => {
            setGenderFilter(
              event.target.value
            )

            resetPage()
          }}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">
            All genders
          </option>

          <option value="male">
            Male
          </option>

          <option value="female">
            Female
          </option>
        </select>

        {/* PUROK */}

        <select
          value={
            purokFilter
          }
          onChange={(
            event
          ) => {
            setPurokFilter(
              event.target.value
            )

            resetPage()
          }}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">
            All puroks
          </option>

          {purokOptions.map(
            (
              purok
            ) => (
              <option
                key={
                  purok.id
                }
                value={
                  purok.id
                }
              >
                {
                  purok.name
                }
              </option>
            )
          )}
        </select>

        {/* STATUS */}

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
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
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

      {/* ===============================
          ERROR
      ================================ */}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load residents.
        </div>
      )}

      {/* ===============================
          TABLE
      ================================ */}

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Photo
                </TableHead>

                <TableHead>
                  Resident #
                </TableHead>

                <TableHead>
                  Name
                </TableHead>

                <TableHead>
                  Age
                </TableHead>

                <TableHead>
                  Gender
                </TableHead>

                <TableHead>
                  Purok
                </TableHead>

                <TableHead>
                  Household
                </TableHead>

                <TableHead>
                  Housing
                </TableHead>

                <TableHead>
                  Voter
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
              {/* LOADING */}

              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={
                      11
                    }
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading residents...
                  </TableCell>
                </TableRow>
              )}

              {/* EMPTY */}

              {!isLoading &&
                residents.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        11
                      }
                      className="h-24 text-center text-muted-foreground"
                    >
                      No residents found.
                    </TableCell>
                  </TableRow>
                )}

              {/* RESIDENT ROWS */}

              {!isLoading &&
                residents.map(
                  (
                    resident
                  ) => (
                    <TableRow
                      key={
                        resident.id
                      }
                    >
                      {/* PHOTO */}

                      <TableCell>
                        <ResidentAvatar
                          resident={
                            resident
                          }
                        />
                      </TableCell>

                      {/* NUMBER */}

                      <TableCell className="font-medium">
                        {
                          resident.resident_number
                        }
                      </TableCell>

                      {/* NAME */}

                      <TableCell>
                        {getFullName(
                          resident
                        )}
                      </TableCell>

                      {/* AGE */}

                      <TableCell>
                        {calculateAge(
                          resident.birthday
                        )}
                      </TableCell>

                      {/* GENDER */}

                      <TableCell className="capitalize">
                        {
                          resident.gender
                        }
                      </TableCell>

                      {/* PUROK */}

                      <TableCell>
                        {resident
                          .puroks
                          ?.name ??
                          "—"}
                      </TableCell>

                      {/* HOUSEHOLD */}

                      <TableCell>
                        {resident
                          .households
                          ?.household_number ??
                          "—"}
                      </TableCell>

                      {/* HOUSING */}

                      <TableCell className="capitalize">
                        {resident
                          .households
                          ?.housing_status ??
                          "—"}
                      </TableCell>

                      {/* VOTER */}

                      <TableCell>
                        {resident.is_voter
                          ? "Yes"
                          : "No"}
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <span
                          className={
                            resident.is_active
                              ? "font-medium text-green-700"
                              : "font-medium text-muted-foreground"
                          }
                        >
                          {resident.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEdit(
                                resident
                              )
                            }
                          >
                            <Edit className="mr-1 h-3.5 w-3.5" />

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
                                resident
                              )
                            }
                          >
                            {resident.is_active
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

        {/* ===============================
            PAGINATION
        ================================ */}

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
                  totalResidents
                }
              </span>{" "}
              residents
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
                page <= 1 ||
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

      {/* ===============================
          ADD / EDIT DIALOG
      ================================ */}

      <ResidentFormDialog
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
            setSelectedResident(
              null
            )
          }
        }}
        resident={
          selectedResident
        }
      />
    </div>
  )
}