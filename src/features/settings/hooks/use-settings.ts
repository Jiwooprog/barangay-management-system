import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  getBarangaySettings,
  updateBarangaySettings,
} from "@/features/settings/services/settings.service"

export const settingsKeys = {
  all:
    ["settings"] as const,

  barangay:
    [
      "settings",
      "barangay",
    ] as const,
}

export function useBarangaySettings() {
  return useQuery({
    queryKey:
      settingsKeys.barangay,

    queryFn:
      getBarangaySettings,
  })
}

export function useUpdateBarangaySettings() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn:
      updateBarangaySettings,

    onSuccess:
      async () => {
        await queryClient.invalidateQueries({
          queryKey:
            settingsKeys.all,
        })
      },
  })
}