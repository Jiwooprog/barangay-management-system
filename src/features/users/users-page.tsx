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
    <div className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-md bg-muted p-3">
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Management
          </h1>

          <p className="text-sm text-muted-foreground">
            Loading user accounts...
          </p>
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
                className="h-32 animate-pulse rounded-lg border bg-muted"
              />
            )
          )}
        </div>

        <div className="h-96 animate-pulse rounded-lg border bg-muted" />
      </div>
    )
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Management
          </h1>
        </div>

        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load users.

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

        <div>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />

            <h1 className="text-2xl font-bold tracking-tight">
              User Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage system accounts,
            roles, resident links,
            and account activity.
          </p>
        </div>

        {/* ====================================
            SUCCESS
        ==================================== */}

        {saveSuccess && (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
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

        <section className="rounded-lg border bg-background p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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
                className="pl-9"
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
              className="h-9 rounded-md border bg-background px-3 text-sm shadow-xs outline-none"
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

        <section className="overflow-hidden rounded-lg border bg-background shadow-sm">
          <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                System Users
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage authentication
                accounts visible to
                Super Admin.
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-medium">
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updating results...
                  </p>
                )}
            </div>
          </div>

          {users.length ===
          0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No users match the
              current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">
                      User
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Role
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Resident Link
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Email Status
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Last Sign In
                    </th>

                    <th className="px-4 py-3 text-left font-medium">
                      Created
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
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
                        className="border-b last:border-b-0"
                      >
                        {/* USER */}

                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {user.display_name ||
                              "Unnamed User"}
                          </div>

                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {user.email ||
                              "No email"}
                          </div>
                        </td>

                        {/* ROLE */}

                        <td className="px-4 py-3">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
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
                              <div className="font-medium">
                                {user.resident_name ||
                                  "Linked Resident"}
                              </div>

                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {user.resident_number ||
                                  "No resident number"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Not linked
                            </span>
                          )}
                        </td>

                        {/* EMAIL */}

                        <td className="px-4 py-3">
                          {user.email_confirmed_at ? (
                            <span className="inline-flex items-center gap-1.5 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />

                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-700">
                              <Clock3 className="h-4 w-4" />

                              Unconfirmed
                            </span>
                          )}
                        </td>

                        {/* LAST SIGN IN */}

                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />

                            {formatDateTime(
                              user.last_sign_in_at
                            )}
                          </div>
                        </td>

                        {/* CREATED */}

                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
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
                          >
                            <Pencil className="mr-2 h-4 w-4" />

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
                    totalCount
                  }
                </span>{" "}
                users
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
        </section>
      </div>

      {/* ====================================
          ACCESS EDITOR MODAL
      ==================================== */}

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border bg-white text-foreground shadow-2xl dark:bg-zinc-950">
            {/* ====================================
                HEADER
            ==================================== */}

            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-white px-6 py-5 dark:bg-zinc-950">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-muted p-2">
                    <UserCog className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold">
                      Edit User Access
                    </h2>

                    <p className="mt-0.5 text-sm text-muted-foreground">
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

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Account Information
                </p>

                <div className="mt-3">
                  <p className="font-semibold">
                    {selectedUser.display_name ||
                      "Unnamed User"}
                  </p>

                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {selectedUser.email ||
                      "No email"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
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
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950"
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

                <p className="text-xs text-muted-foreground">
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
                    className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-950"
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

                  <div className="rounded-md border bg-muted/30 p-3">
                    <div className="flex items-start gap-2">
                      <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                      <p className="text-xs text-muted-foreground">
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
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
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
                  <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/30">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700 dark:text-green-400" />

                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-200">
                          Resident selected
                        </p>

                        <p className="mt-1 text-xs text-green-800 dark:text-green-300">
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
                  className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm font-medium text-destructive"
                >
                  {saveError}
                </div>
              )}
            </div>

            {/* ====================================
                FOOTER
            ==================================== */}

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t bg-white px-6 py-4 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={
                  handleCloseEditor
                }
                disabled={
                  updateAccess.isPending
                }
                className="sm:min-w-24"
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
                className="sm:min-w-32"
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