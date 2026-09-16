import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createOfficial,
  getOfficials,
  setOfficialStatus,
  updateOfficial,
} from "@/features/officials/services/officials.service"

import type {
  OfficialFormInput,
} from "@/features/officials/types"

export function useOfficials() {
  return useQuery({
    queryKey: ["officials"],
    queryFn: getOfficials,
  })
}

export function useCreateOfficial() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: OfficialFormInput
    ) =>
      createOfficial(input),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["officials"],
      })
    },
  })
}

export function useUpdateOfficial() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: OfficialFormInput
    }) =>
      updateOfficial(
        id,
        input
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["officials"],
      })
    },
  })
}

export function useSetOfficialStatus() {
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
      setOfficialStatus(
        id,
        isActive
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["officials"],
      })
    },
  })
}