import {
  supabase,
} from "@/lib/supabase"

import type {
  ManageableResident,
  UpdateUserAccessInput,
  UserOverview,
  UserRoleName,
} from "@/features/users/types"

// ========================================
// PAGINATED USERS TYPES
// ========================================

export interface UsersOverviewFilters {
  search: string

  role:
    | UserRoleName
    | "all"

  page: number
  pageSize: number
}

export interface UsersOverviewPaginatedResult {
  users: UserOverview[]

  totalCount: number

  summary: {
    totalUsers: number
    superAdmins: number
    barangayStaff: number
    residentUsers: number
  }

  linkedResidentIds: string[]
}

// ========================================
// USERS OVERVIEW
//
// Kept for compatibility with anything
// still using the original RPC.
// ========================================

export async function getUsersOverview(): Promise<
  UserOverview[]
> {
  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_users_overview"
    )

  if (error) {
    throw error
  }

  return (
    data ?? []
  ) as UserOverview[]
}

// ========================================
// PAGINATED USERS OVERVIEW
// ========================================

export async function getPaginatedUsersOverview(
  filters:
    UsersOverviewFilters
): Promise<UsersOverviewPaginatedResult> {
  const page =
    Math.max(
      filters.page,
      1
    )

  const pageSize =
    Math.max(
      filters.pageSize,
      1
    )

  const search =
    filters.search.trim()

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_users_overview_paginated",
      {
        p_search:
          search,

        p_role:
          filters.role,

        p_page:
          page,

        p_page_size:
          pageSize,
      }
    )

  if (error) {
    console.error(
      "Paginated users overview error:",
      error
    )

    throw error
  }

  const row =
    data?.[0]

  if (!row) {
    return {
      users: [],

      totalCount:
        0,

      summary: {
        totalUsers:
          0,

        superAdmins:
          0,

        barangayStaff:
          0,

        residentUsers:
          0,
      },

      linkedResidentIds:
        [],
    }
  }

  const users =
    Array.isArray(
      row.users
    )
      ? (
          row.users as UserOverview[]
        )
      : []

  const linkedResidentIds =
    Array.isArray(
      row.linked_resident_ids
    )
      ? (
          row.linked_resident_ids as string[]
        )
      : []

  return {
    users,

    totalCount:
      Number(
        row.total_count ??
          0
      ),

    summary: {
      totalUsers:
        Number(
          row.total_users ??
            0
        ),

      superAdmins:
        Number(
          row.super_admins ??
            0
        ),

      barangayStaff:
        Number(
          row.barangay_staff ??
            0
        ),

      residentUsers:
        Number(
          row.resident_users ??
            0
        ),
    },

    linkedResidentIds,
  }
}

// ========================================
// ACTIVE RESIDENTS
// ========================================

export async function getManageableResidents(): Promise<
  ManageableResident[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("residents")
      .select(`
        id,
        resident_number,
        first_name,
        middle_name,
        last_name,
        suffix
      `)
      .eq(
        "is_active",
        true
      )
      .is(
        "deleted_at",
        null
      )
      .order(
        "last_name",
        {
          ascending:
            true,
        }
      )
      .order(
        "first_name",
        {
          ascending:
            true,
        }
      )

  if (error) {
    throw error
  }

  return (
    data ?? []
  ) as ManageableResident[]
}

// ========================================
// UPDATE USER ACCESS
// ========================================

export async function updateUserAccess({
  userId,
  role,
  residentId,
}: UpdateUserAccessInput) {
  const {
    error,
  } =
    await supabase.rpc(
      "update_user_access",
      {
        target_user_id:
          userId,

        new_role:
          role,

        linked_resident_id:
          role ===
          "resident"
            ? residentId
            : null,
      }
    )

  if (error) {
    throw error
  }
}