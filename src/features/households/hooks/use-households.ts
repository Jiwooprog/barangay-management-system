import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createHousehold,
  getHouseholds,
  getPaginatedHouseholds,
  setHouseholdStatus,
  updateHousehold,
} from "@/features/households/services/households.service"

import type {
  HouseholdListFilters,
} from "@/features/households/services/households.service"

import type {
  CreateHouseholdInput,
  UpdateHouseholdInput,
} from "@/features/households/types"

// ========================================
// QUERY KEYS
// ========================================

export const householdKeys = {
  all: [
    "households",
  ] as const,

  fullList: [
    "households",
    "all",
  ] as const,

  list: (
    filters:
      HouseholdListFilters
  ) =>
    [
      "households",
      "list",
      filters,
    ] as const,
}

// ========================================
// ORIGINAL FULL LIST
// ========================================

export function useHouseholds() {
  return useQuery({
    queryKey:
      householdKeys.fullList,

    queryFn:
      getHouseholds,
  })
}

// ========================================
// PAGINATED LIST
// ========================================

export function usePaginatedHouseholds(
  filters:
    HouseholdListFilters
) {
  return useQuery({
    queryKey:
      householdKeys.list(
        filters
      ),

    queryFn: () =>
      getPaginatedHouseholds(
        filters
      ),
  })
}

// ========================================
// CREATE
// ========================================

export function useCreateHousehold() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        CreateHouseholdInput
    ) =>
      createHousehold(
        input
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              householdKeys.all,
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              "dashboard-stats",
            ],
          }),
      ])
    },
  })
}

// ========================================
// UPDATE
// ========================================

export function useUpdateHousehold() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input:
        UpdateHouseholdInput
    }) =>
      updateHousehold(
        id,
        input
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              householdKeys.all,
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              "dashboard-stats",
            ],
          }),
      ])
    },
  })
}

// ========================================
// STATUS
// ========================================

export function useSetHouseholdStatus() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string
      isActive: boolean
    }) =>
      setHouseholdStatus(
        id,
        isActive
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              householdKeys.all,
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              "dashboard-stats",
            ],
          }),
      ])
    },
  })
}