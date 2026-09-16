import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  changeBlotterCaseStatus,
  createBlotterCase,
  createBlotterHearing,
  deleteBlotterCase,
  deleteBlotterHearing,
  getBlotterCaseById,
  getBlotterCaseSummary,
  getBlotterCaseUpdates,
  getBlotterCases,
  getBlotterDashboardStats,
  getBlotterHearings,
  getPaginatedBlotterCases,
  updateBlotterCase,
  updateBlotterHearing,
} from "@/features/blotter/services/blotter.service"

import type {
  BlotterCaseListFilters,
} from "@/features/blotter/services/blotter.service"

import type {
  BlotterCaseStatus,
  CreateBlotterCaseInput,
  CreateBlotterHearingInput,
  UpdateBlotterCaseInput,
  UpdateBlotterHearingInput,
} from "@/features/blotter/types"

// ========================================
// QUERY KEYS
// ========================================

export const blotterKeys = {
  all: [
    "blotter",
  ] as const,

  cases: [
    "blotter",
    "cases",
  ] as const,

  caseList: (
    filters:
      BlotterCaseListFilters
  ) =>
    [
      "blotter",
      "cases",
      "list",
      filters,
    ] as const,

  summary: [
    "blotter",
    "summary",
  ] as const,

  dashboard: [
    "blotter",
    "dashboard",
  ] as const,

  case: (
    id: string
  ) =>
    [
      "blotter",
      "case",
      id,
    ] as const,

  history: (
    id: string
  ) =>
    [
      "blotter",
      "history",
      id,
    ] as const,

  hearings: (
    id: string
  ) =>
    [
      "blotter",
      "hearings",
      id,
    ] as const,
}

// ========================================
// GET ALL CASES
//
// Kept for compatibility with components
// that still need the complete case list.
// ========================================

export function useBlotterCases() {
  return useQuery({
    queryKey:
      blotterKeys.cases,

    queryFn:
      getBlotterCases,
  })
}

// ========================================
// GET PAGINATED CASES
// ========================================

export function usePaginatedBlotterCases(
  filters:
    BlotterCaseListFilters
) {
  return useQuery({
    queryKey:
      blotterKeys.caseList(
        filters
      ),

    queryFn: () =>
      getPaginatedBlotterCases(
        filters
      ),
  })
}

// ========================================
// BLOTTER CASE SUMMARY
// ========================================

export function useBlotterCaseSummary() {
  return useQuery({
    queryKey:
      blotterKeys.summary,

    queryFn:
      getBlotterCaseSummary,
  })
}

// ========================================
// GET ONE CASE
// ========================================

export function useBlotterCase(
  id: string | null
) {
  return useQuery({
    queryKey:
      blotterKeys.case(
        id ?? ""
      ),

    queryFn: () =>
      getBlotterCaseById(
        id as string
      ),

    enabled:
      Boolean(id),
  })
}

// ========================================
// GET CASE HISTORY
// ========================================

export function useBlotterCaseHistory(
  id: string | null
) {
  return useQuery({
    queryKey:
      blotterKeys.history(
        id ?? ""
      ),

    queryFn: () =>
      getBlotterCaseUpdates(
        id as string
      ),

    enabled:
      Boolean(id),
  })
}

// ========================================
// GET HEARINGS
// ========================================

export function useBlotterHearings(
  blotterCaseId:
    string | null
) {
  return useQuery({
    queryKey:
      blotterKeys.hearings(
        blotterCaseId ??
          ""
      ),

    queryFn: () =>
      getBlotterHearings(
        blotterCaseId as string
      ),

    enabled:
      Boolean(
        blotterCaseId
      ),
  })
}

// ========================================
// CREATE CASE
// ========================================

export function useCreateBlotterCase() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        CreateBlotterCaseInput
    ) =>
      createBlotterCase(
        input
      ),

    onSuccess: async (
      createdCase
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.cases,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.summary,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.dashboard,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.case(
                createdCase.id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.history(
                createdCase.id
              ),
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
// BLOTTER DASHBOARD
// ========================================

export function useBlotterDashboardStats() {
  return useQuery({
    queryKey:
      blotterKeys.dashboard,

    queryFn:
      getBlotterDashboardStats,
  })
}

// ========================================
// UPDATE CASE
// ========================================

export function useUpdateBlotterCase() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        UpdateBlotterCaseInput
    ) =>
      updateBlotterCase(
        input
      ),

    onSuccess: async (
      updatedCase
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.cases,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.summary,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.dashboard,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.case(
                updatedCase.id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.history(
                updatedCase.id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.hearings(
                updatedCase.id
              ),
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
// CHANGE STATUS
// ========================================

export function useChangeBlotterStatus() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string

      status:
        BlotterCaseStatus
    }) =>
      changeBlotterCaseStatus(
        id,
        status
      ),

    onSuccess: async (
      updatedCase
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.cases,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.summary,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.dashboard,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.case(
                updatedCase.id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.history(
                updatedCase.id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.hearings(
                updatedCase.id
              ),
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
// DELETE / ARCHIVE CASE
// ========================================

export function useDeleteBlotterCase() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      deleteBlotterCase(
        id
      ),

    onSuccess: async (
      _data,
      id
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.cases,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.summary,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.dashboard,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.case(
                id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.history(
                id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.hearings(
                id
              ),
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
// CREATE HEARING
// ========================================

export function useCreateBlotterHearing() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        CreateBlotterHearingInput
    ) =>
      createBlotterHearing(
        input
      ),

    onSuccess: async (
      hearing
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.hearings(
                hearing
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.history(
                hearing
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.case(
                hearing
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.cases,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.dashboard,
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
// UPDATE HEARING
// ========================================

export function useUpdateBlotterHearing() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        UpdateBlotterHearingInput
    ) =>
      updateBlotterHearing(
        input
      ),

    onSuccess: async (
      hearing
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.hearings(
                hearing
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.history(
                hearing
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.case(
                hearing
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.cases,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.dashboard,
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
// DELETE / ARCHIVE HEARING
// ========================================

export function useDeleteBlotterHearing() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: {
        id: string
        blotter_case_id: string
      }
    ) =>
      deleteBlotterHearing(
        input
      ),

    onSuccess: async (
      _data,
      input
    ) => {
      await Promise.all([
        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.hearings(
                input
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.history(
                input
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.case(
                input
                  .blotter_case_id
              ),
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.cases,
          }),

        queryClient
          .invalidateQueries({
            queryKey:
              blotterKeys.dashboard,
          }),
      ])
    },
  })
}