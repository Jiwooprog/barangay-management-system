import {
  useQuery,
} from "@tanstack/react-query"

import {
  getDetailedReports,
  getReportsSummary,
} from "@/features/reports/services/reports.service"

import type {
  ReportFilters,
} from "@/features/reports/types"

// ========================================
// QUERY KEYS
// ========================================

export const reportsKeys = {
  all: [
    "reports",
  ] as const,

  summary: [
    "reports",
    "summary",
  ] as const,

  detailed: (
    filters:
      ReportFilters
  ) =>
    [
      "reports",
      "detailed",
      filters.startDate ??
        "",
      filters.endDate ??
        "",
    ] as const,
}

// ========================================
// SUMMARY
// ========================================

export function useReportsSummary() {
  return useQuery({
    queryKey:
      reportsKeys.summary,

    queryFn:
      getReportsSummary,
  })
}

// ========================================
// DETAILED REPORTS
// ========================================

export function useDetailedReports(
  filters:
    ReportFilters
) {
  return useQuery({
    queryKey:
      reportsKeys.detailed(
        filters
      ),

    queryFn: () =>
      getDetailedReports(
        filters
      ),
  })
}