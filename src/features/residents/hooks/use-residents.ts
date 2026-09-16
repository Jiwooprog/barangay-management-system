import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createResident,
  getPaginatedResidents,
  getResidentPurokOptions,
  getResidents,
  setResidentStatus,
  updateResident,
} from "@/features/residents/services/residents.service"

import type {
  ResidentListFilters,
} from "@/features/residents/services/residents.service"

import type {
  ResidentFormInput,
} from "@/features/residents/types"

// ========================================
// QUERY KEYS
// ========================================

export const residentKeys = {
  all: [
    "residents",
  ] as const,

  list: (
    filters:
      ResidentListFilters
  ) =>
    [
      ...residentKeys.all,
      "list",
      filters,
    ] as const,

  purokOptions: [
    "residents",
    "purok-options",
  ] as const,
}

// ========================================
// ORIGINAL RESIDENT QUERY
// ========================================

export function useResidents() {
  return useQuery({
    queryKey: [
      "residents",
      "all",
    ],

    queryFn:
      getResidents,
  })
}

// ========================================
// PAGINATED RESIDENT QUERY
// ========================================

export function usePaginatedResidents(
  filters:
    ResidentListFilters
) {
  return useQuery({
    queryKey:
      residentKeys.list(
        filters
      ),

    queryFn: () =>
      getPaginatedResidents(
        filters
      ),
  })
}

// ========================================
// PUROK FILTER OPTIONS
// ========================================

export function useResidentPurokOptions() {
  return useQuery({
    queryKey:
      residentKeys.purokOptions,

    queryFn:
      getResidentPurokOptions,
  })
}

// ========================================
// CREATE
// ========================================

export function useCreateResident() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        ResidentFormInput
    ) =>
      createResident(
        input
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey: [
              "residents",
            ],
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              "households",
            ],
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

export function useUpdateResident() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input:
        ResidentFormInput
    }) =>
      updateResident(
        id,
        input
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey: [
              "residents",
            ],
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              "households",
            ],
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              "dashboard-stats",
            ],
          }),

        queryClient
          .invalidateQueries({
            queryKey: [
              "household-members",
            ],
          }),
      ])
    },
  })
}

// ========================================
// STATUS
// ========================================

export function useSetResidentStatus() {
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
      setResidentStatus(
        id,
        isActive
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey: [
              "residents",
            ],
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