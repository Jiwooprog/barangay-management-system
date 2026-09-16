import {
  supabase,
} from "@/lib/supabase"

import type {
  ActivityLogFilters,
  ActivityLogsResult,
} from "../types"

export async function getActivityLogs(
  filters: ActivityLogFilters
): Promise<ActivityLogsResult> {
  const page =
    Math.max(
      filters.page,
      1
    )

  const pageSize =
    Math.max(
      filters.pageSize,
      1
    )

  const from =
    (page - 1) *
    pageSize

  const to =
    from +
    pageSize -
    1

  let query =
    supabase
      .from(
        "activity_logs"
      )
      .select(
        `
          id,
          user_id,
          actor_email,
          action,
          module,
          entity_type,
          entity_id,
          entity_label,
          description,
          changed_fields,
          created_at
        `,
        {
          count:
            "exact",
        }
      )

  // ======================================
  // MODULE FILTER
  // ======================================

  if (
    filters.module !==
    "ALL"
  ) {
    query =
      query.eq(
        "module",
        filters.module
      )
  }

  // ======================================
  // ACTION FILTER
  // ======================================

  if (
    filters.action !==
    "ALL"
  ) {
    query =
      query.eq(
        "action",
        filters.action
      )
  }

  // ======================================
  // SEARCH
  // ======================================

  const search =
    filters.search
      .trim()
      .replace(
        /[,%()]/g,
        " "
      )

  if (search) {
    query =
      query.or(
        [
          `description.ilike.%${search}%`,
          `actor_email.ilike.%${search}%`,
          `entity_label.ilike.%${search}%`,
          `entity_type.ilike.%${search}%`,
          `module.ilike.%${search}%`,
        ].join(",")
      )
  }

  // ======================================
  // ORDER + PAGINATION
  // ======================================

  const {
    data,
    error,
    count,
  } =
    await query
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      )
      .range(
        from,
        to
      )

  if (error) {
    throw error
  }

  return {
    data:
      (data ?? []) as ActivityLogsResult["data"],

    count:
      count ?? 0,
  }
}