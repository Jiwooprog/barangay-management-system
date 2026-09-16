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
  SlidersHorizontal,
  UserRoundCheck,
  UserRoundX,
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

import type { Resident } from "@/features/residents/types"

const PAGE_SIZE = 20

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

export function ResidentsPage() {
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

  const handleAdd =
    () => {
      setSelectedResident(
        null
      )

      setDialogOpen(
        true
      )
    }

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

  function resetPage() {
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Resident Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage barangay resident records and account status.
              </p>
            </div>
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

          Add Resident
        </Button>
      </div>

      {/* FILTER TOOLBAR */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
          Search & Filters
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
            />
          </div>

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
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          Unable to load residents.
        </div>
      )}

      {/* RESIDENT TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Residents
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {totalResidents}{" "}
              {totalResidents === 1
                ? "resident"
                : "residents"}{" "}
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
                  Photo
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Resident #
                </TableHead>

                <TableHead className="min-w-[180px] text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Age
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Gender
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Purok
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Household
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Housing
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Voter
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
                    colSpan={
                      11
                    }
                    className="h-32 text-center text-sm text-slate-500"
                  >
                    Loading residents...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                residents.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        11
                      }
                      className="h-40 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Users className="h-5 w-5" />
                        </div>

                        <p className="mt-3 font-medium text-slate-800">
                          No residents found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing the search or filter options.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              {!isLoading &&
                residents.map(
                  (
                    resident
                  ) => (
                    <TableRow
                      key={
                        resident.id
                      }
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      <TableCell>
                        <ResidentAvatar
                          resident={
                            resident
                          }
                        />
                      </TableCell>

                      <TableCell className="whitespace-nowrap font-medium text-slate-700">
                        {
                          resident.resident_number
                        }
                      </TableCell>

                      <TableCell className="font-medium text-slate-950">
                        {getFullName(
                          resident
                        )}
                      </TableCell>

                      <TableCell className="text-slate-600">
                        {calculateAge(
                          resident.birthday
                        )}
                      </TableCell>

                      <TableCell className="capitalize text-slate-600">
                        {
                          resident.gender
                        }
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-slate-600">
                        {resident
                          .puroks
                          ?.name ??
                          "—"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-slate-600">
                        {resident
                          .households
                          ?.household_number ??
                          "—"}
                      </TableCell>

                      <TableCell className="capitalize text-slate-600">
                        {resident
                          .households
                          ?.housing_status ??
                          "—"}
                      </TableCell>

                      <TableCell className="text-slate-600">
                        {resident.is_voter
                          ? "Yes"
                          : "No"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            resident.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(
                            " "
                          )}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              resident.is_active
                                ? "bg-emerald-500"
                                : "bg-slate-400",
                            ].join(
                              " "
                            )}
                          />

                          {resident.is_active
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
                                resident
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
                                resident
                              )
                            }
                            className={
                              resident.is_active
                                ? "rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                : "rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            }
                          >
                            {resident.is_active ? (
                              <UserRoundX className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <UserRoundCheck className="mr-1.5 h-3.5 w-3.5" />
                            )}

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

        {/* PAGINATION */}

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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
                totalResidents
              }
            </span>{" "}
            residents
          </p>

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
              className="rounded-lg border-slate-200 bg-white"
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
              className="rounded-lg border-slate-200 bg-white"
            >
              Next

              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

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
