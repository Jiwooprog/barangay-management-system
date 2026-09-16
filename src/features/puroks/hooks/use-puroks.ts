import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createPurok,
  getPuroks,
  setPurokStatus,
  updatePurok,
} from "@/features/puroks/services/puroks.service"

import type {
  CreatePurokInput,
  UpdatePurokInput,
} from "@/features/puroks/types"

export function usePuroks() {
  return useQuery({
    queryKey: ["puroks"],
    queryFn: getPuroks,
  })
}

export function useCreatePurok() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePurokInput) =>
      createPurok(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["puroks"],
      })

      await queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      })
    },
  })
}

export function useUpdatePurok() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdatePurokInput
    }) => updatePurok(id, input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["puroks"],
      })

      await queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      })
    },
  })
}

export function useSetPurokStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string
      isActive: boolean
    }) => setPurokStatus(id, isActive),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["puroks"],
      })

      await queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      })
    },
  })
}