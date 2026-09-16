import { supabase } from "@/lib/supabase"

import type {
  BlotterCase,
  BlotterCaseStatus,
  BlotterCaseUpdate,
  BlotterDashboardRecentCase,
  BlotterDashboardStats,
  BlotterHearing,
  BlotterPriority,
  CreateBlotterCaseInput,
  CreateBlotterHearingInput,
  UpdateBlotterCaseInput,
  UpdateBlotterHearingInput,
} from "@/features/blotter/types"

// ========================================
// SELECT
// ========================================

const BLOTTER_CASE_SELECT = `
  id,
  case_number,

  complaint_type,

  incident_date,
  incident_time,
  incident_location,
  incident_details,

  complainant_resident_id,
  complainant_name,
  complainant_contact_number,
  complainant_address,

  respondent_resident_id,
  respondent_name,
  respondent_contact_number,
  respondent_address,

  priority,
  status,

  action_taken,
  settlement_details,
  referred_to,
  notes,

  handled_by,
  closed_by,
  closed_at,

  is_active,

  created_at,
  updated_at,
  deleted_at,

  complainant_resident:residents!blotter_cases_complainant_resident_id_fkey (
    id,
    resident_number,
    first_name,
    middle_name,
    last_name,
    suffix,
    contact_number,
    house_number,
    street
  ),

  respondent_resident:residents!blotter_cases_respondent_resident_id_fkey (
    id,
    resident_number,
    first_name,
    middle_name,
    last_name,
    suffix,
    contact_number,
    house_number,
    street
  )
`

// ========================================
// PAGINATED CASE TYPES
// ========================================

export interface BlotterCaseListFilters {
  search: string

  status:
    | BlotterCaseStatus
    | "all"

  priority:
    | BlotterPriority
    | "all"

  page: number
  pageSize: number
}

export interface BlotterCaseListResult {
  data: BlotterCase[]
  count: number
}

export interface BlotterCaseSummary {
  total: number
  open: number
  underMediation: number
  settled: number
}

// ========================================
// HELPERS
// ========================================

function cleanOptional(
  value:
    | string
    | null
    | undefined
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null
  }

  const cleaned =
    value.trim()

  return cleaned || null
}

async function getCurrentUserId() {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data.user) {
    throw new Error(
      "No authenticated user."
    )
  }

  return data.user.id
}

// ========================================
// GET ALL CASES
//
// Kept for compatibility with any module
// that still needs the complete case list.
// ========================================

export async function getBlotterCases(): Promise<
  BlotterCase[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("blotter_cases")
    .select(
      BLOTTER_CASE_SELECT
    )
    .is(
      "deleted_at",
      null
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(
      "Get blotter cases error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as unknown as BlotterCase[]
}

// ========================================
// GET PAGINATED CASES
// ========================================

export async function getPaginatedBlotterCases(
  filters: BlotterCaseListFilters
): Promise<BlotterCaseListResult> {
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

  const search =
    filters.search
      .trim()
      .replace(
        /[,%()"]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )

  // ======================================
  // FIND RELATED RESIDENTS
  // ======================================

  let residentIds:
    string[] = []

  if (search) {
    const {
      data:
        residentData,
      error:
        residentError,
    } =
      await supabase
        .from(
          "residents"
        )
        .select(
          "id"
        )
        .is(
          "deleted_at",
          null
        )
        .or(
          [
            `resident_number.ilike.%${search}%`,
            `first_name.ilike.%${search}%`,
            `middle_name.ilike.%${search}%`,
            `last_name.ilike.%${search}%`,
            `suffix.ilike.%${search}%`,
          ].join(",")
        )

    if (
      residentError
    ) {
      console.error(
        "Blotter resident search error:",
        residentError
      )

      throw residentError
    }

    residentIds =
      (
        residentData ??
        []
      ).map(
        (
          resident
        ) =>
          resident.id
      )
  }

  // ======================================
  // BASE QUERY
  // ======================================

  let query =
    supabase
      .from(
        "blotter_cases"
      )
      .select(
        BLOTTER_CASE_SELECT,
        {
          count:
            "exact",
        }
      )
      .is(
        "deleted_at",
        null
      )

  // ======================================
  // SEARCH
  // ======================================

  if (search) {
    const conditions = [
      `case_number.ilike.%${search}%`,
      `complaint_type.ilike.%${search}%`,
      `complainant_name.ilike.%${search}%`,
      `respondent_name.ilike.%${search}%`,
      `incident_location.ilike.%${search}%`,
      `incident_details.ilike.%${search}%`,
    ]

    if (
      residentIds.length >
      0
    ) {
      conditions.push(
        `complainant_resident_id.in.(${residentIds.join(
          ","
        )})`
      )

      conditions.push(
        `respondent_resident_id.in.(${residentIds.join(
          ","
        )})`
      )
    }

    query =
      query.or(
        conditions.join(
          ","
        )
      )
  }

  // ======================================
  // STATUS FILTER
  // ======================================

  if (
    filters.status !==
    "all"
  ) {
    query =
      query.eq(
        "status",
        filters.status
      )
  }

  // ======================================
  // PRIORITY FILTER
  // ======================================

  if (
    filters.priority !==
    "all"
  ) {
    query =
      query.eq(
        "priority",
        filters.priority
      )
  }

  // ======================================
  // SORT + PAGINATION
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
    console.error(
      "Paginated blotter cases error:",
      error
    )

    throw error
  }

  return {
    data:
      (
        data ??
        []
      ) as unknown as BlotterCase[],

    count:
      count ?? 0,
  }
}

// ========================================
// BLOTTER CASE SUMMARY
//
// Global totals for the main Blotter page.
// These are independent from pagination.
// ========================================

export async function getBlotterCaseSummary(): Promise<
  BlotterCaseSummary
> {
  async function countCases(
    status?:
      BlotterCaseStatus
  ): Promise<number> {
    let query =
      supabase
        .from(
          "blotter_cases"
        )
        .select(
          "id",
          {
            count:
              "exact",
            head:
              true,
          }
        )
        .is(
          "deleted_at",
          null
        )

    if (status) {
      query =
        query.eq(
          "status",
          status
        )
    }

    const {
      count,
      error,
    } =
      await query

    if (error) {
      console.error(
        "Blotter summary count error:",
        error
      )

      throw error
    }

    return count ?? 0
  }

  const [
    total,
    open,
    underMediation,
    settled,
  ] =
    await Promise.all([
      countCases(),

      countCases(
        "open"
      ),

      countCases(
        "under_mediation"
      ),

      countCases(
        "settled"
      ),
    ])

  return {
    total,
    open,
    underMediation,
    settled,
  }
}

// ========================================
// GET ONE CASE
// ========================================

export async function getBlotterCaseById(
  id: string
): Promise<BlotterCase> {
  const {
    data,
    error,
  } = await supabase
    .from("blotter_cases")
    .select(
      BLOTTER_CASE_SELECT
    )
    .eq(
      "id",
      id
    )
    .is(
      "deleted_at",
      null
    )
    .single()

  if (error) {
    console.error(
      "Get blotter case error:",
      error
    )

    throw error
  }

  return data as unknown as BlotterCase
}

// ========================================
// CREATE CASE HISTORY
// ========================================

async function createCaseHistory(
  input: {
    blotter_case_id: string
    action: string

    description?:
      | string
      | null

    old_status?:
      | string
      | null

    new_status?:
      | string
      | null
  }
) {
  const userId =
    await getCurrentUserId()

  const {
    error,
  } = await supabase
    .from(
      "blotter_case_updates"
    )
    .insert({
      blotter_case_id:
        input.blotter_case_id,

      action:
        input.action,

      description:
        cleanOptional(
          input.description
        ),

      old_status:
        cleanOptional(
          input.old_status
        ),

      new_status:
        cleanOptional(
          input.new_status
        ),

      created_by:
        userId,
    })

  if (error) {
    console.error(
      "Create blotter history error:",
      error
    )

    throw error
  }
}

// ========================================
// GET CASE HISTORY
// ========================================

export async function getBlotterCaseUpdates(
  blotterCaseId: string
): Promise<
  BlotterCaseUpdate[]
> {
  const {
    data,
    error,
  } = await supabase
    .from(
      "blotter_case_updates"
    )
    .select(`
      id,
      blotter_case_id,
      action,
      description,
      old_status,
      new_status,
      created_by,
      created_at
    `)
    .eq(
      "blotter_case_id",
      blotterCaseId
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(
      "Get blotter case history error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as BlotterCaseUpdate[]
}

// ========================================
// CREATE CASE
// ========================================

export async function createBlotterCase(
  input: CreateBlotterCaseInput
): Promise<BlotterCase> {
  const userId =
    await getCurrentUserId()

  const payload = {
    complaint_type:
      input.complaint_type.trim(),

    incident_date:
      input.incident_date,

    incident_time:
      cleanOptional(
        input.incident_time
      ),

    incident_location:
      cleanOptional(
        input.incident_location
      ),

    incident_details:
      input.incident_details.trim(),

    // ====================================
    // COMPLAINANT
    // ====================================

    complainant_resident_id:
      input.complainant_resident_id ||
      null,

    complainant_name:
      cleanOptional(
        input.complainant_name
      ),

    complainant_contact_number:
      cleanOptional(
        input.complainant_contact_number
      ),

    complainant_address:
      cleanOptional(
        input.complainant_address
      ),

    // ====================================
    // RESPONDENT
    // ====================================

    respondent_resident_id:
      input.respondent_resident_id ||
      null,

    respondent_name:
      cleanOptional(
        input.respondent_name
      ),

    respondent_contact_number:
      cleanOptional(
        input.respondent_contact_number
      ),

    respondent_address:
      cleanOptional(
        input.respondent_address
      ),

    // ====================================
    // CASE MANAGEMENT
    // ====================================

    priority:
      input.priority ??
      "normal",

    status:
      "open" as const,

    handled_by:
      userId,

    notes:
      cleanOptional(
        input.notes
      ),
  }

  const {
    data,
    error,
  } = await supabase
    .from("blotter_cases")
    .insert(payload)
    .select(
      BLOTTER_CASE_SELECT
    )
    .single()

  if (error) {
    console.error(
      "Create blotter case error:",
      error
    )

    throw error
  }

  const createdCase =
    data as unknown as BlotterCase

  // ========================================
  // HISTORY
  // ========================================

  await createCaseHistory({
    blotter_case_id:
      createdCase.id,

    action:
      "case_created",

    description:
      `Blotter case ${createdCase.case_number} was created.`,

    new_status:
      "open",
  })

  return createdCase
}

// ========================================
// UPDATE CASE
// ========================================

export async function updateBlotterCase(
  input: UpdateBlotterCaseInput
): Promise<BlotterCase> {
  const existing =
    await getBlotterCaseById(
      input.id
    )

  const payload: Record<
    string,
    unknown
  > = {}

  // ========================================
  // INCIDENT
  // ========================================

  if (
    input.complaint_type !==
    undefined
  ) {
    payload.complaint_type =
      input.complaint_type.trim()
  }

  if (
    input.incident_date !==
    undefined
  ) {
    payload.incident_date =
      input.incident_date
  }

  if (
    input.incident_time !==
    undefined
  ) {
    payload.incident_time =
      cleanOptional(
        input.incident_time
      )
  }

  if (
    input.incident_location !==
    undefined
  ) {
    payload.incident_location =
      cleanOptional(
        input.incident_location
      )
  }

  if (
    input.incident_details !==
    undefined
  ) {
    payload.incident_details =
      input.incident_details.trim()
  }

  // ========================================
  // COMPLAINANT
  // ========================================

  if (
    input.complainant_resident_id !==
    undefined
  ) {
    payload.complainant_resident_id =
      input.complainant_resident_id ||
      null
  }

  if (
    input.complainant_name !==
    undefined
  ) {
    payload.complainant_name =
      cleanOptional(
        input.complainant_name
      )
  }

  if (
    input.complainant_contact_number !==
    undefined
  ) {
    payload.complainant_contact_number =
      cleanOptional(
        input.complainant_contact_number
      )
  }

  if (
    input.complainant_address !==
    undefined
  ) {
    payload.complainant_address =
      cleanOptional(
        input.complainant_address
      )
  }

  // ========================================
  // RESPONDENT
  // ========================================

  if (
    input.respondent_resident_id !==
    undefined
  ) {
    payload.respondent_resident_id =
      input.respondent_resident_id ||
      null
  }

  if (
    input.respondent_name !==
    undefined
  ) {
    payload.respondent_name =
      cleanOptional(
        input.respondent_name
      )
  }

  if (
    input.respondent_contact_number !==
    undefined
  ) {
    payload.respondent_contact_number =
      cleanOptional(
        input.respondent_contact_number
      )
  }

  if (
    input.respondent_address !==
    undefined
  ) {
    payload.respondent_address =
      cleanOptional(
        input.respondent_address
      )
  }

  // ========================================
  // CASE MANAGEMENT
  // ========================================

  if (
    input.priority !==
    undefined
  ) {
    payload.priority =
      input.priority
  }

  if (
    input.status !==
    undefined
  ) {
    payload.status =
      input.status
  }

  if (
    input.action_taken !==
    undefined
  ) {
    payload.action_taken =
      cleanOptional(
        input.action_taken
      )
  }

  if (
    input.settlement_details !==
    undefined
  ) {
    payload.settlement_details =
      cleanOptional(
        input.settlement_details
      )
  }

  if (
    input.referred_to !==
    undefined
  ) {
    payload.referred_to =
      cleanOptional(
        input.referred_to
      )
  }

  if (
    input.notes !==
    undefined
  ) {
    payload.notes =
      cleanOptional(
        input.notes
      )
  }

  // ========================================
  // CLOSED STATUS
  // ========================================

  if (
    input.status ===
      "closed" &&
    existing.status !==
      "closed"
  ) {
    payload.closed_by =
      await getCurrentUserId()

    payload.closed_at =
      new Date().toISOString()
  }

  // ========================================
  // REOPEN CLOSED CASE
  // ========================================

  if (
    input.status &&
    input.status !==
      "closed" &&
    existing.status ===
      "closed"
  ) {
    payload.closed_by =
      null

    payload.closed_at =
      null
  }

  // ========================================
  // UPDATE
  // ========================================

  const {
    data,
    error,
  } = await supabase
    .from("blotter_cases")
    .update(payload)
    .eq(
      "id",
      input.id
    )
    .select(
      BLOTTER_CASE_SELECT
    )
    .single()

  if (error) {
    console.error(
      "Update blotter case error:",
      error
    )

    throw error
  }

  const updatedCase =
    data as unknown as BlotterCase

  // ========================================
  // HISTORY
  // ========================================

  if (
    input.status &&
    input.status !==
      existing.status
  ) {
    await createCaseHistory({
      blotter_case_id:
        updatedCase.id,

      action:
        "status_changed",

      description:
        `Case status changed from ${existing.status} to ${updatedCase.status}.`,

      old_status:
        existing.status,

      new_status:
        updatedCase.status,
    })
  } else {
    await createCaseHistory({
      blotter_case_id:
        updatedCase.id,

      action:
        "case_updated",

      description:
        `Blotter case ${updatedCase.case_number} was updated.`,
    })
  }

  return updatedCase
}

// ========================================
// CHANGE CASE STATUS
// ========================================

export async function changeBlotterCaseStatus(
  id: string,
  status: BlotterCaseStatus
): Promise<BlotterCase> {
  return updateBlotterCase({
    id,
    status,
  })
}

// ========================================
// SOFT DELETE / ARCHIVE CASE
// ========================================

export async function deleteBlotterCase(
  id: string
): Promise<void> {
  const existing =
    await getBlotterCaseById(
      id
    )

  const {
    error,
  } = await supabase
    .from("blotter_cases")
    .update({
      deleted_at:
        new Date().toISOString(),

      is_active:
        false,
    })
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Delete blotter case error:",
      error
    )

    throw error
  }

  // ========================================
  // HISTORY
  // ========================================

  await createCaseHistory({
    blotter_case_id:
      id,

    action:
      "case_deleted",

    description:
      `Blotter case ${existing.case_number} was archived.`,
  })
}

// ========================================
// GET CASE HEARINGS
// ========================================

export async function getBlotterHearings(
  blotterCaseId: string
): Promise<BlotterHearing[]> {
  const {
    data,
    error,
  } = await supabase
    .from("blotter_hearings")
    .select(`
      id,
      blotter_case_id,
      hearing_date,
      venue,
      status,
      complainant_present,
      respondent_present,
      notes,
      outcome,
      conducted_by,
      created_at,
      updated_at,
      deleted_at
    `)
    .eq(
      "blotter_case_id",
      blotterCaseId
    )
    .is(
      "deleted_at",
      null
    )
    .order(
      "hearing_date",
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(
      "Get blotter hearings error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as BlotterHearing[]
}

// ========================================
// CREATE HEARING
// ========================================

export async function createBlotterHearing(
  input: CreateBlotterHearingInput
): Promise<BlotterHearing> {
  const {
    data,
    error,
  } = await supabase
    .from("blotter_hearings")
    .insert({
      blotter_case_id:
        input.blotter_case_id,

      hearing_date:
        input.hearing_date,

      venue:
        cleanOptional(
          input.venue
        ),

      status:
        "scheduled",

      notes:
        cleanOptional(
          input.notes
        ),
    })
    .select(`
      id,
      blotter_case_id,
      hearing_date,
      venue,
      status,
      complainant_present,
      respondent_present,
      notes,
      outcome,
      conducted_by,
      created_at,
      updated_at,
      deleted_at
    `)
    .single()

  if (error) {
    console.error(
      "Create blotter hearing error:",
      error
    )

    throw error
  }

  const hearing =
    data as BlotterHearing

  await createCaseHistory({
    blotter_case_id:
      input.blotter_case_id,

    action:
      "hearing_scheduled",

    description:
      `A hearing was scheduled for ${new Date(
        input.hearing_date
      ).toLocaleString("en-PH")}.`,
  })

  return hearing
}

// ========================================
// UPDATE HEARING
// ========================================

export async function updateBlotterHearing(
  input: UpdateBlotterHearingInput
): Promise<BlotterHearing> {
  const payload: Record<
    string,
    unknown
  > = {}

  if (
    input.hearing_date !==
    undefined
  ) {
    payload.hearing_date =
      input.hearing_date
  }

  if (
    input.venue !==
    undefined
  ) {
    payload.venue =
      cleanOptional(
        input.venue
      )
  }

  if (
    input.status !==
    undefined
  ) {
    payload.status =
      input.status
  }

  if (
    input.complainant_present !==
    undefined
  ) {
    payload.complainant_present =
      input.complainant_present
  }

  if (
    input.respondent_present !==
    undefined
  ) {
    payload.respondent_present =
      input.respondent_present
  }

  if (
    input.notes !==
    undefined
  ) {
    payload.notes =
      cleanOptional(
        input.notes
      )
  }

  if (
    input.outcome !==
    undefined
  ) {
    payload.outcome =
      cleanOptional(
        input.outcome
      )
  }

  if (
    input.status ===
    "completed"
  ) {
    payload.conducted_by =
      await getCurrentUserId()
  }

  const {
    data,
    error,
  } = await supabase
    .from("blotter_hearings")
    .update(payload)
    .eq(
      "id",
      input.id
    )
    .eq(
      "blotter_case_id",
      input.blotter_case_id
    )
    .select(`
      id,
      blotter_case_id,
      hearing_date,
      venue,
      status,
      complainant_present,
      respondent_present,
      notes,
      outcome,
      conducted_by,
      created_at,
      updated_at,
      deleted_at
    `)
    .single()

  if (error) {
    console.error(
      "Update blotter hearing error:",
      error
    )

    throw error
  }

  const hearing =
    data as BlotterHearing

  await createCaseHistory({
    blotter_case_id:
      input.blotter_case_id,

    action:
      input.status ===
      "completed"
        ? "hearing_completed"
        : input.status ===
            "cancelled"
          ? "hearing_cancelled"
          : input.status ===
              "rescheduled"
            ? "hearing_rescheduled"
            : "hearing_updated",

    description:
      `Hearing record was updated. Current status: ${hearing.status}.`,
  })

  return hearing
}

// ========================================
// ARCHIVE HEARING
// ========================================

export async function deleteBlotterHearing(
  input: {
    id: string
    blotter_case_id: string
  }
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("blotter_hearings")
    .update({
      deleted_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      input.id
    )
    .eq(
      "blotter_case_id",
      input.blotter_case_id
    )

  if (error) {
    console.error(
      "Delete blotter hearing error:",
      error
    )

    throw error
  }

  await createCaseHistory({
    blotter_case_id:
      input.blotter_case_id,

    action:
      "hearing_archived",

    description:
      "A hearing record was archived.",
  })
}

// ========================================
// BLOTTER DASHBOARD STATS
// ========================================

export async function getBlotterDashboardStats(): Promise<
  BlotterDashboardStats
> {
  const {
    data,
    error,
  } = await supabase
    .from("blotter_cases")
    .select(`
      id,
      case_number,
      complaint_type,
      incident_date,
      priority,
      status,
      created_at
    `)
    .is(
      "deleted_at",
      null
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(
      "Get blotter dashboard stats error:",
      error
    )

    throw error
  }

  const cases =
    (
      data ?? []
    ) as BlotterDashboardRecentCase[]

  // ========================================
  // STATUS COUNTS
  // ========================================

  const open =
    cases.filter(
      (item) =>
        item.status ===
        "open"
    ).length

  const underMediation =
    cases.filter(
      (item) =>
        item.status ===
        "under_mediation"
    ).length

  const settled =
    cases.filter(
      (item) =>
        item.status ===
        "settled"
    ).length

  const referred =
    cases.filter(
      (item) =>
        item.status ===
        "referred"
    ).length

  const dismissed =
    cases.filter(
      (item) =>
        item.status ===
        "dismissed"
    ).length

  const closed =
    cases.filter(
      (item) =>
        item.status ===
        "closed"
    ).length

  // ========================================
  // RESOLVED
  // ========================================

  const resolved =
    cases.filter(
      (item) =>
        item.status ===
          "settled" ||
        item.status ===
          "referred" ||
        item.status ===
          "dismissed" ||
        item.status ===
          "closed"
    ).length

  // ========================================
  // PRIORITY
  // ========================================

  const urgent =
    cases.filter(
      (item) =>
        item.priority ===
        "urgent"
    ).length

  const highPriority =
    cases.filter(
      (item) =>
        item.priority ===
        "high"
    ).length

  // ========================================
  // RETURN
  // ========================================

  return {
    total:
      cases.length,

    open,

    under_mediation:
      underMediation,

    settled,

    referred,

    dismissed,

    closed,

    resolved,

    urgent,

    high_priority:
      highPriority,

    recent_cases:
      cases.slice(
        0,
        5
      ),
  }
}