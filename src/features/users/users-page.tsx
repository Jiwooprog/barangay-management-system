import {
  useEffect,
  useRef,
  useState,
} from "react"

import type {
  ComponentType,
} from "react"

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Link2,
  Pencil,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  X,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  useManageableResidents,
  usePaginatedUsersOverview,
  useUpdateUserAccess,
} from "@/features/users/hooks/use-users"

import type {
  AssignableUserRole,
  ManageableResident,
  UserOverview,
  UserRoleName,
} from "@/features/users/types"

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE =
  20

const ASSIGNABLE_ROLES:
  AssignableUserRole[] = [
    "super_admin",
    "barangay_staff",
    "resident",
  ]

// ========================================
// HELPERS
// ========================================

function formatRole(
  role: string
) {
  switch (role) {
    case "super_admin":
      return "Super Admin"

    case "barangay_staff":
      return "Barangay Staff"

    case "resident":
      return "Resident"

    default:
      return "No Role"
  }
}

function getRoleClass(
  role: string
) {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-800"

    case "barangay_staff":
      return "bg-blue-100 text-blue-800"

    case "resident":
      return "bg-green-100 text-green-800"

    default:
      return "bg-muted text-muted-foreground"
  }
}

function formatDateTime(
  value:
    | string
    | null
) {
  if (!value) {
    return "Never"
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  ).format(date)
}

function getResidentName(
  resident:
    ManageableResident
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
// STAT CARD
// ========================================

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: number
  description: string

  icon:
    ComponentType<{
      className?: string
    }>
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ========================================
// PAGE
// ========================================

export function UsersPage() {
  // ========================================
  // FILTERS
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
    roleFilter,
    setRoleFilter,
  ] =
    useState<
      | UserRoleName
      | "all"
    >(
      "all"
    )

  const [
    page,
    setPage,
  ] =
    useState(1)

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
  // PAGINATED USERS
  // ========================================

  const {
    data,
    isLoading,
    isFetching,
    error,
  } =
    usePaginatedUsersOverview({
      search:
        debouncedSearch,

      role:
        roleFilter,

      page,

      pageSize:
        PAGE_SIZE,
    })

  // ========================================
  // RESIDENT OPTIONS
  // ========================================

  const {
    data:
      residentsData,
    isLoading:
      residentsLoading,
  } =
    useManageableResidents()

  const updateAccess =
    useUpdateUserAccess()

  // ========================================
  // EDIT STATE
  // ========================================

  const [
    selectedUser,
    setSelectedUser,
  ] =
    useState<
      UserOverview | null
    >(
      null
    )

  const [
    selectedRole,
    setSelectedRole,
  ] =
    useState<
      AssignableUserRole
    >(
      "barangay_staff"
    )

  const [
    selectedResidentId,
    setSelectedResidentId,
  ] =
    useState("")

  const [
    saveError,
    setSaveError,
  ] =
    useState("")

  const [
    saveSuccess,
    setSaveSuccess,
  ] =
    useState("")

  const saveErrorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  useEffect(
    () => {
      if (
        !saveError ||
        !selectedUser
      ) {
        return
      }

      const timer =
        window.setTimeout(
          () => {
            saveErrorRef.current
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
      saveError,
      selectedUser,
    ]
  )

  // ========================================
  // DATA
  // ========================================

  const users =
    data?.users ??
    []

  const residents =
    residentsData ??
    []

  const totalCount =
    data?.totalCount ??
    0

  // ========================================
  // GLOBAL STATISTICS
  // ========================================

  const totalUsers =
    data?.summary
      .totalUsers ??
    0

  const superAdmins =
    data?.summary
      .superAdmins ??
    0

  const staffUsers =
    data?.summary
      .barangayStaff ??
    0

  const residentUsers =
    data?.summary
      .residentUsers ??
    0

  // ========================================
  // GLOBAL LINKED RESIDENT IDS
  // ========================================

  const linkedResidentIds =
    new Set(
      data?.linkedResidentIds ??
        []
    )

  // Allow the selected user's existing
  // resident link to remain selectable.

  if (
    selectedUser
      ?.resident_id
  ) {
    linkedResidentIds.delete(
      selectedUser.resident_id
    )
  }

  // ========================================
  // PAGINATION
  // ========================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCount /
          PAGE_SIZE
      )
    )

  const startRecord =
    totalCount ===
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
      totalCount
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
  // EDIT ACTIONS
  // ========================================

  const handleEditUser =
    (
      user:
        UserOverview
    ) => {
      setSelectedUser(
        user
      )

      setSaveError("")
      setSaveSuccess("")

      if (
        user.role_name ===
          "super_admin" ||
        user.role_name ===
          "barangay_staff" ||
        user.role_name ===
          "resident"
      ) {
        setSelectedRole(
          user.role_name
        )
      } else {
        setSelectedRole(
          "barangay_staff"
        )
      }

      setSelectedResidentId(
        user.resident_id ??
          ""
      )
    }

  const handleCloseEditor =
    () => {
      if (
        updateAccess.isPending
      ) {
        return
      }

      setSelectedUser(
        null
      )

      setSaveError("")
    }

  const handleSaveAccess =
    async () => {
      if (
        !selectedUser
      ) {
        return
      }

      if (
        !ASSIGNABLE_ROLES.includes(
          selectedRole
        )
      ) {
        setSaveError(
          "Please select a valid system role."
        )

        return
      }

      if (
        selectedUser.role_name ===
          "super_admin" &&
        selectedRole !==
          "super_admin" &&
        superAdmins <= 1
      ) {
        setSaveError(
          "At least one Super Admin account must remain in the system."
        )

        return
      }

      if (
        selectedRole ===
          "resident" &&
        !selectedResidentId
      ) {
        setSaveError(
          "Select a resident record for this resident account."
        )

        return
      }

      if (
        selectedRole ===
          "resident" &&
        linkedResidentIds.has(
          selectedResidentId
        )
      ) {
        setSaveError(
          "This resident record is already linked to another user account."
        )

        return
      }

      if (
        selectedRole ===
          "resident"
      ) {
        const selectedResidentAvailable =
          residents.some(
            (resident) =>
              resident.id ===
              selectedResidentId
          )

        const isExistingResidentLink =
          selectedUser.resident_id ===
          selectedResidentId

        if (
          !selectedResidentAvailable &&
          !isExistingResidentLink
        ) {
          setSaveError(
            "The selected resident record is no longer available. Please choose an active resident."
          )

          return
        }
      }

      try {
        setSaveError("")
        setSaveSuccess("")

        await updateAccess
          .mutateAsync({
            userId:
              selectedUser.user_id,

            role:
              selectedRole,

            residentId:
              selectedRole ===
              "resident"
                ? selectedResidentId
                : null,
          })

        setSaveSuccess(
          `Access updated for ${
            selectedUser.display_name ||
            selectedUser.email ||
            "the user"
          }.`
        )

        setSelectedUser(
          null
        )
      } catch (
        mutationError
      ) {
        setSaveError(
          mutationError instanceof
            Error
            ? mutationError.message
            : "Unable to update user access."
        )
      }
    }

  // ========================================
  // INITIAL LOADING
  // ========================================

  if (
    isLoading &&
    !data
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <UserCog className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              User Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Loading user accounts...
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length:
              4,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={
                  index
                }
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            )
          )}
        </div>

        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </div>
    )
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <UserCog className="h-5 w-5" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            User Management
          </h2>
        </div>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-medium">
            Unable to load users.
          </p>

          {error instanceof
            Error && (
            <p className="mt-1 text-xs">
              {
                error.message
              }
            </p>
          )}
        </div>
      </div>
    )
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      <div className="space-y-8">
        {/* ====================================
            HEADER
        ==================================== */}

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <UserCog className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              User Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage system accounts, roles, resident links, and account activity.
            </p>
          </div>
        </div>

        {/* ====================================
            SUCCESS
        ==================================== */}

        {saveSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {
              saveSuccess
            }
          </div>
        )}

        {/* ====================================
            SUMMARY
        ==================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={
              totalUsers
            }
            description="All Auth accounts"
            icon={Users}
          />

          <StatCard
            title="Super Admins"
            value={
              superAdmins
            }
            description="Full system administrators"
            icon={
              ShieldCheck
            }
          />

          <StatCard
            title="Barangay Staff"
            value={
              staffUsers
            }
            description="Operational staff accounts"
            icon={
              UserCog
            }
          />

          <StatCard
            title="Residents"
            value={
              residentUsers
            }
            description="Resident portal accounts"
            icon={Link2}
          />
        </div>

        {/* ====================================
            FILTERS
        ==================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
            Search & Filters
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={
                  search
                }
                onChange={(
                  event
                ) => {
                  setSearch(
                    event.target
                      .value
                  )

                  resetPage()
                }}
                placeholder="Search by name, email, resident number, or role..."
                className="h-10 rounded-xl border-slate-200 bg-white pl-9"
              />
            </div>

            <select
              value={
                roleFilter
              }
              onChange={(
                event
              ) => {
                setRoleFilter(
                  event.target
                    .value as
                    | UserRoleName
                    | "all"
                )

                resetPage()
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">
                All Roles
              </option>

              <option value="super_admin">
                Super Admin
              </option>

              <option value="barangay_staff">
                Barangay Staff
              </option>

              <option value="resident">
                Resident
              </option>

              <option value="No Role">
                No Role
              </option>
            </select>
          </div>
        </section>

        {/* ====================================
            USERS TABLE
        ==================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">
                System Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage authentication
                accounts visible to
                Super Admin.
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-medium text-slate-700">
                {
                  totalCount
                }{" "}
                user
                {totalCount ===
                1
                  ? ""
                  : "s"}
              </span>

              {isFetching &&
                !isLoading && (
                  <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Updating...
                  </span>
                )}
            </div>
          </div>

          {users.length ===
          0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Users className="h-5 w-5" />
              </div>

              <p className="mt-3 font-medium text-slate-800">
                No users found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or role filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      User
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Role
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Resident Link
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email Status
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last Sign In
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(
                    (
                      user
                    ) => (
                      <tr
                        key={
                          user.user_id
                        }
                        className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80"
                      >
                        {/* USER */}

                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-950">
                            {user.display_name ||
                              "Unnamed User"}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-500">
                            {user.email ||
                              "No email"}
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                              getRoleClass(
                                user.role_name
                              ),
                            ].join(
                              " "
                            )}
                          >
                            {formatRole(
                              user.role_name
                            )}
                          </span>
                        </td>

                        {/* RESIDENT */}

                        <td className="px-4 py-3">
                          {user.resident_id ? (
                            <div>
                              <div className="font-medium text-slate-950">
                                {user.resident_name ||
                                  "Linked Resident"}
                              </div>

                              <div className="mt-0.5 text-xs text-slate-500">
                                {user.resident_number ||
                                  "No resident number"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500">
                              Not linked
                            </span>
                          )}
                        </td>

                        {/* EMAIL */}

                        <td className="px-4 py-3">
                          {user.email_confirmed_at ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />

                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              <Clock3 className="h-3.5 w-3.5" />

                              Unconfirmed
                            </span>
                          )}
                        </td>

                        {/* LAST SIGN IN */}

                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />

                            {formatDateTime(
                              user.last_sign_in_at
                            )}
                          </div>
                        </td>

                        {/* CREATED */}

                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />

                            {formatDateTime(
                              user.created_at
                            )}
                          </div>
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEditUser(
                                user
                              )
                            }
                            className="rounded-lg border-slate-200 bg-white"
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />

                            Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ====================================
              PAGINATION
          ==================================== */}

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
                    totalCount
                  }
                </span>{" "}
                users
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
      </div>

      {/* ====================================
          ACCESS EDITOR MODAL
      ==================================== */}

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl">
            {/* ====================================
                HEADER
            ==================================== */}

            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <UserCog className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Edit User Access
                    </h2>

                    <p className="mt-0.5 text-sm text-slate-500">
                      Manage role and resident
                      account link.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={
                  handleCloseEditor
                }
                disabled={
                  updateAccess.isPending
                }
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* ====================================
                BODY
            ==================================== */}

            <div className="space-y-6 px-6 py-6">
              {/* ACCOUNT INFORMATION */}

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Account Information
                </p>

                <div className="mt-3">
                  <p className="font-semibold text-slate-950">
                    {selectedUser.display_name ||
                      "Unnamed User"}
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {selectedUser.email ||
                      "No email"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      getRoleClass(
                        selectedUser.role_name
                      ),
                    ].join(
                      " "
                    )}
                  >
                    Current:{" "}
                    {formatRole(
                      selectedUser.role_name
                    )}
                  </span>

                  {selectedUser.resident_id && (
                    <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                      Resident Linked
                    </span>
                  )}
                </div>
              </div>

              {/* SYSTEM ROLE */}

              <div className="space-y-2">
                <label
                  htmlFor="user-role"
                  className="text-sm font-medium"
                >
                  System Role
                </label>

                <select
                  id="user-role"
                  value={
                    selectedRole
                  }
                  onChange={(
                    event
                  ) => {
                    const role =
                      event.target
                        .value as AssignableUserRole

                    setSelectedRole(
                      role
                    )

                    setSaveError("")

                    if (
                      role !==
                      "resident"
                    ) {
                      setSelectedResidentId(
                        ""
                      )
                    } else if (
                      selectedUser.role_name ===
                        "resident" &&
                      selectedUser.resident_id
                    ) {
                      setSelectedResidentId(
                        selectedUser.resident_id
                      )
                    }
                  }}
                  disabled={
                    updateAccess.isPending
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="super_admin">
                    Super Admin
                  </option>

                  <option value="barangay_staff">
                    Barangay Staff
                  </option>

                  <option value="resident">
                    Resident
                  </option>
                </select>

                <p className="text-xs text-slate-500">
                  The selected role determines
                  which areas of the Barangay
                  Management System this account
                  can access.
                </p>
              </div>

              {/* RESIDENT LINK */}

              {selectedRole ===
                "resident" && (
                <div className="space-y-2">
                  <label
                    htmlFor="resident-link"
                    className="text-sm font-medium"
                  >
                    Linked Resident

                    <span className="ml-1 text-destructive">
                      *
                    </span>
                  </label>

                  <select
                    id="resident-link"
                    value={
                      selectedResidentId
                    }
                    onChange={(
                      event
                    ) => {
                      setSelectedResidentId(
                        event.target.value
                      )

                      setSaveError("")
                    }}
                    disabled={
                      residentsLoading ||
                      updateAccess.isPending
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {residentsLoading
                        ? "Loading residents..."
                        : "Select a resident"}
                    </option>

                    {residents.map(
                      (
                        resident
                      ) => {
                        const alreadyLinked =
                          linkedResidentIds.has(
                            resident.id
                          )

                        return (
                          <option
                            key={
                              resident.id
                            }
                            value={
                              resident.id
                            }
                            disabled={
                              alreadyLinked
                            }
                          >
                            {
                              resident.resident_number
                            }{" "}
                            —{" "}
                            {getResidentName(
                              resident
                            )}
                            {alreadyLinked
                              ? " (Already linked)"
                              : ""}
                          </option>
                        )
                      }
                    )}
                  </select>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex items-start gap-2">
                      <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                      <p className="text-xs text-slate-500">
                        A resident account must be
                        connected to an active
                        resident record. Each
                        resident can only be linked
                        to one user account.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* NON-RESIDENT NOTICE */}

              {selectedRole !==
                "resident" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />

                    <div>
                      <p className="text-sm font-medium">
                        Administrative account
                      </p>

                      <p className="mt-1 text-xs">
                        Changing this account to{" "}

                        <span className="font-semibold">
                          {formatRole(
                            selectedRole
                          )}
                        </span>{" "}

                        will remove any existing
                        resident account link.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CURRENT RESIDENT INFORMATION */}

              {selectedRole ===
                "resident" &&
                selectedResidentId && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />

                      <div>
                        <p className="text-sm font-medium text-emerald-900">
                          Resident selected
                        </p>

                        <p className="mt-1 text-xs text-emerald-800">
                          This account will use the
                          linked resident record for
                          the Resident Portal.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* ERROR */}

              {saveError && (
                <div
                  ref={saveErrorRef}
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  {saveError}
                </div>
              )}
            </div>

            {/* ====================================
                FOOTER
            ==================================== */}

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={
                  handleCloseEditor
                }
                disabled={
                  updateAccess.isPending
                }
                className="rounded-xl border-slate-200 bg-white sm:min-w-24"
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={
                  handleSaveAccess
                }
                disabled={
                  updateAccess.isPending ||
                  residentsLoading ||
                  (
                    selectedRole ===
                      "resident" &&
                    !selectedResidentId
                  )
                }
                className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 sm:min-w-32"
              >
                {updateAccess.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}