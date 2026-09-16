import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  getManageableResidents,
  getPaginatedUsersOverview,
  getUsersOverview,
  updateUserAccess,
} from "@/features/users/services/users.service"

import type {
  UsersOverviewFilters,
} from "@/features/users/services/users.service"

// ========================================
// QUERY KEYS
// ========================================

export const usersKeys = {
  all:
    ["users"] as const,

  overview:
    [
      "users",
      "overview",
    ] as const,

  paginatedOverview: (
    filters:
      UsersOverviewFilters
  ) =>
    [
      "users",
      "overview",
      "paginated",
      filters,
    ] as const,

  residents:
    [
      "users",
      "residents",
    ] as const,
}

// ========================================
// ORIGINAL USERS OVERVIEW
//
// Kept for compatibility with anything
// still using the original full-list RPC.
// ========================================

export function useUsersOverview() {
  return useQuery({
    queryKey:
      usersKeys.overview,

    queryFn:
      getUsersOverview,
  })
}

// ========================================
// PAGINATED USERS OVERVIEW
// ========================================

export function usePaginatedUsersOverview(
  filters:
    UsersOverviewFilters
) {
  return useQuery({
    queryKey:
      usersKeys.paginatedOverview(
        filters
      ),

    queryFn: () =>
      getPaginatedUsersOverview(
        filters
      ),
  })
}

// ========================================
// RESIDENT OPTIONS
// ========================================

export function useManageableResidents() {
  return useQuery({
    queryKey:
      usersKeys.residents,

    queryFn:
      getManageableResidents,
  })
}

// ========================================
// UPDATE ACCESS
// ========================================

export function useUpdateUserAccess() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn:
      updateUserAccess,

    onSuccess:
      async () => {
        await queryClient
          .invalidateQueries({
            queryKey:
              usersKeys.all,
          })
      },
  })
}