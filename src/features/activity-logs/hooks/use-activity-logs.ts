import {
  useQuery,
} from "@tanstack/react-query"

import {
  getActivityLogs,
} from "../services/activity-logs.service"

import type {
  ActivityLogFilters,
} from "../types"

export const activityLogKeys = {
  all: [
    "activity-logs",
  ] as const,

  list: (
    filters:
      ActivityLogFilters
  ) =>
    [
      ...activityLogKeys.all,
      filters,
    ] as const,
}

export function useActivityLogs(
  filters: ActivityLogFilters
) {
  return useQuery({
    queryKey:
      activityLogKeys.list(
        filters
      ),

    queryFn: () =>
      getActivityLogs(
        filters
      ),
  })
}