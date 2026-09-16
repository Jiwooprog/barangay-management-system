import {
  supabase,
} from "@/lib/supabase"

import type {
  DetailedReportsData,
  ReportFilters,
  ReportsSummary,
} from "@/features/reports/types"

// ========================================
// HELPERS
// ========================================

async function getActiveCount(
  table:
    | "residents"
    | "households"
    | "puroks"
) {
  const {
    count,
    error,
  } = await supabase
    .from(table)
    .select(
      "*",
      {
        count: "exact",
        head: true,
      }
    )
    .eq(
      "is_active",
      true
    )
    .is(
      "deleted_at",
      null
    )

  if (error) {
    console.error(
      `Count ${table} error:`,
      error
    )

    throw error
  }

  return count ?? 0
}

// ========================================
// DATE HELPER
// ========================================

function getNextDate(
  value: string
) {
  const date =
    new Date(
      `${value}T00:00:00`
    )

  date.setDate(
    date.getDate() + 1
  )

  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    ),

    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    ),
  ].join("-")
}

// ========================================
// REPORT SUMMARY
// ========================================

export async function getReportsSummary(): Promise<
  ReportsSummary
> {
  // ========================================
  // POPULATION
  // ========================================

  const [
    residents,
    households,
    puroks,
  ] = await Promise.all([
    getActiveCount(
      "residents"
    ),

    getActiveCount(
      "households"
    ),

    getActiveCount(
      "puroks"
    ),
  ])

  // ========================================
  // CERTIFICATES
  // ========================================

  const {
    data:
      certificateRows,
    error:
      certificateError,
  } = await supabase
    .from(
      "certificate_requests"
    )
    .select(
      "status"
    )

  if (
    certificateError
  ) {
    console.error(
      "Get certificate report summary error:",
      certificateError
    )

    throw certificateError
  }

  const certificates =
    certificateRows ?? []

  const certificateSummary = {
    total:
      certificates.length,

    pending:
      certificates.filter(
        (item) =>
          item.status ===
          "pending"
      ).length,

    approved:
      certificates.filter(
        (item) =>
          item.status ===
          "approved"
      ).length,

    issued:
      certificates.filter(
        (item) =>
          item.status ===
          "issued"
      ).length,

    rejected:
      certificates.filter(
        (item) =>
          item.status ===
          "rejected"
      ).length,
  }

  // ========================================
  // BLOTTER
  // ========================================

  const {
    data:
      blotterRows,
    error:
      blotterError,
  } = await supabase
    .from(
      "blotter_cases"
    )
    .select(`
      status,
      priority
    `)
    .is(
      "deleted_at",
      null
    )

  if (
    blotterError
  ) {
    console.error(
      "Get blotter report summary error:",
      blotterError
    )

    throw blotterError
  }

  const blotter =
    blotterRows ?? []

  const blotterSummary = {
    total:
      blotter.length,

    open:
      blotter.filter(
        (item) =>
          item.status ===
          "open"
      ).length,

    under_mediation:
      blotter.filter(
        (item) =>
          item.status ===
          "under_mediation"
      ).length,

    settled:
      blotter.filter(
        (item) =>
          item.status ===
          "settled"
      ).length,

    referred:
      blotter.filter(
        (item) =>
          item.status ===
          "referred"
      ).length,

    dismissed:
      blotter.filter(
        (item) =>
          item.status ===
          "dismissed"
      ).length,

    closed:
      blotter.filter(
        (item) =>
          item.status ===
          "closed"
      ).length,

    low:
      blotter.filter(
        (item) =>
          item.priority ===
          "low"
      ).length,

    normal:
      blotter.filter(
        (item) =>
          item.priority ===
          "normal"
      ).length,

    high:
      blotter.filter(
        (item) =>
          item.priority ===
          "high"
      ).length,

    urgent:
      blotter.filter(
        (item) =>
          item.priority ===
          "urgent"
      ).length,
  }

  // ========================================
  // RETURN SUMMARY
  // ========================================

  return {
    population: {
      residents,
      households,
      puroks,
    },

    certificates:
      certificateSummary,

    blotter:
      blotterSummary,
  }
}

// ========================================
// DETAILED REPORT DATA
// ========================================

export async function getDetailedReports(
  filters: ReportFilters
): Promise<DetailedReportsData> {
  // ========================================
  // CERTIFICATE REPORT
  // ========================================

  let certificateQuery =
    supabase
      .from(
        "certificate_requests"
      )
      .select(`
        id,
        request_number,
        status,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: false,
        }
      )

  // Start date:
  // include from 12:00 AM
  if (
    filters.startDate
  ) {
    certificateQuery =
      certificateQuery.gte(
        "created_at",
        `${filters.startDate}T00:00:00`
      )
  }

  // End date:
  // use less-than the following date
  // so the entire selected end day
  // is included.
  if (
    filters.endDate
  ) {
    certificateQuery =
      certificateQuery.lt(
        "created_at",
        `${getNextDate(
          filters.endDate
        )}T00:00:00`
      )
  }

  const {
    data:
      certificateRows,
    error:
      certificateError,
  } =
    await certificateQuery

  if (
    certificateError
  ) {
    console.error(
      "Get detailed certificate report error:",
      certificateError
    )

    throw certificateError
  }

  // ========================================
  // BLOTTER REPORT
  // ========================================

  let blotterQuery =
    supabase
      .from(
        "blotter_cases"
      )
      .select(`
        id,
        case_number,
        complaint_type,
        incident_date,
        priority,
        status
      `)
      .is(
        "deleted_at",
        null
      )
      .order(
        "incident_date",
        {
          ascending: false,
        }
      )

  if (
    filters.startDate
  ) {
    blotterQuery =
      blotterQuery.gte(
        "incident_date",
        filters.startDate
      )
  }

  if (
    filters.endDate
  ) {
    blotterQuery =
      blotterQuery.lte(
        "incident_date",
        filters.endDate
      )
  }

  const {
    data:
      blotterRows,
    error:
      blotterError,
  } =
    await blotterQuery

  if (
    blotterError
  ) {
    console.error(
      "Get detailed blotter report error:",
      blotterError
    )

    throw blotterError
  }

  // ========================================
  // RETURN DETAILS
  // ========================================

  return {
    certificates:
      certificateRows ?? [],

    blotter:
      blotterRows ?? [],
  }
}