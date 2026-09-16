import { supabase } from "@/lib/supabase"

import type {
  CreateHouseholdInput,
  Household,
  UpdateHouseholdInput,
} from "@/features/households/types"

// ========================================
// PAGINATED LIST TYPES
// ========================================

export interface HouseholdListFilters {
  search: string

  status:
    | "all"
    | "active"
    | "inactive"

  page: number
  pageSize: number
}

export interface HouseholdListResult {
  data: Household[]
  count: number
}

// ========================================
// GET ALL HOUSEHOLDS
//
// Kept for compatibility with any other
// module that still needs the full list.
// ========================================

export async function getHouseholds(): Promise<
  Household[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("households")
      .select(`
        *,
        puroks (
          id,
          name,
          code
        ),
        household_head:residents!households_household_head_id_fkey (
          id,
          resident_number,
          first_name,
          middle_name,
          last_name,
          suffix
        )
      `)
      .is(
        "deleted_at",
        null
      )
      .order(
        "household_number",
        {
          ascending: true,
        }
      )

  if (error) {
    throw error
  }

  return (
    data ?? []
  ) as Household[]
}

// ========================================
// GET PAGINATED HOUSEHOLDS
// ========================================

export async function getPaginatedHouseholds(
  filters: HouseholdListFilters
): Promise<HouseholdListResult> {
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
  // FIND RELATED PUROKS / HOUSEHOLD HEADS
  // ======================================

  let purokIds:
    string[] = []

  let residentIds:
    string[] = []

  if (search) {
    const [
      purokResult,
      residentResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "puroks"
          )
          .select(
            "id"
          )
          .is(
            "deleted_at",
            null
          )
          .ilike(
            "name",
            `%${search}%`
          ),

        supabase
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
          ),
      ])

    if (
      purokResult.error
    ) {
      console.error(
        "Household purok search error:",
        purokResult.error
      )

      throw purokResult.error
    }

    if (
      residentResult.error
    ) {
      console.error(
        "Household head search error:",
        residentResult.error
      )

      throw residentResult.error
    }

    purokIds =
      (
        purokResult.data ??
        []
      ).map(
        (
          item
        ) =>
          item.id
      )

    residentIds =
      (
        residentResult.data ??
        []
      ).map(
        (
          item
        ) =>
          item.id
      )
  }

  // ======================================
  // BASE QUERY
  // ======================================

  let query =
    supabase
      .from(
        "households"
      )
      .select(
        `
          *,
          puroks (
            id,
            name,
            code
          ),
          household_head:residents!households_household_head_id_fkey (
            id,
            resident_number,
            first_name,
            middle_name,
            last_name,
            suffix
          )
        `,
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
      `household_number.ilike.%${search}%`,
      `house_number.ilike.%${search}%`,
      `street.ilike.%${search}%`,
      `contact_number.ilike.%${search}%`,
      `housing_status.ilike.%${search}%`,
      `income_classification.ilike.%${search}%`,
    ]

    if (
      purokIds.length >
      0
    ) {
      conditions.push(
        `purok_id.in.(${purokIds.join(
          ","
        )})`
      )
    }

    if (
      residentIds.length >
      0
    ) {
      conditions.push(
        `household_head_id.in.(${residentIds.join(
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
    filters.status ===
    "active"
  ) {
    query =
      query.eq(
        "is_active",
        true
      )
  }

  if (
    filters.status ===
    "inactive"
  ) {
    query =
      query.eq(
        "is_active",
        false
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
        "household_number",
        {
          ascending:
            true,
        }
      )
      .range(
        from,
        to
      )

  if (error) {
    console.error(
      "Paginated households error:",
      error
    )

    throw error
  }

  return {
    data:
      (
        data ??
        []
      ) as Household[],

    count:
      count ?? 0,
  }
}

// ========================================
// CREATE HOUSEHOLD
// ========================================

export async function createHousehold(
  input: CreateHouseholdInput
): Promise<Household> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "households"
      )
      .insert({
        household_number:
          input.household_number.trim(),

        purok_id:
          input.purok_id,

        house_number:
          input.house_number
            ?.trim() ||
          null,

        street:
          input.street
            ?.trim() ||
          null,

        contact_number:
          input.contact_number
            ?.trim() ||
          null,

        housing_status:
          input.housing_status ||
          null,

        income_classification:
          input.income_classification
            ?.trim() ||
          null,

        notes:
          input.notes
            ?.trim() ||
          null,

        household_head_id:
          input.household_head_id ||
          null,
      })
      .select()
      .single()

  if (error) {
    throw error
  }

  return data as Household
}

// ========================================
// UPDATE HOUSEHOLD
// ========================================

export async function updateHousehold(
  id: string,
  input: UpdateHouseholdInput
): Promise<Household> {
  const updates:
    Record<
      string,
      unknown
    > = {}

  if (
    input.household_number !==
    undefined
  ) {
    updates.household_number =
      input.household_number.trim()
  }

  if (
    input.purok_id !==
    undefined
  ) {
    updates.purok_id =
      input.purok_id
  }

  if (
    input.house_number !==
    undefined
  ) {
    updates.house_number =
      input.house_number.trim() ||
      null
  }

  if (
    input.street !==
    undefined
  ) {
    updates.street =
      input.street.trim() ||
      null
  }

  if (
    input.contact_number !==
    undefined
  ) {
    updates.contact_number =
      input.contact_number.trim() ||
      null
  }

  if (
    input.housing_status !==
    undefined
  ) {
    updates.housing_status =
      input.housing_status ||
      null
  }

  if (
    input.income_classification !==
    undefined
  ) {
    updates.income_classification =
      input.income_classification.trim() ||
      null
  }

  if (
    input.notes !==
    undefined
  ) {
    updates.notes =
      input.notes.trim() ||
      null
  }

  if (
    input.household_head_id !==
    undefined
  ) {
    updates.household_head_id =
      input.household_head_id ||
      null
  }

  if (
    input.is_active !==
    undefined
  ) {
    updates.is_active =
      input.is_active
  }

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "households"
      )
      .update(
        updates
      )
      .eq(
        "id",
        id
      )
      .select()
      .single()

  if (error) {
    throw error
  }

  return data as Household
}

// ========================================
// ACTIVATE / DEACTIVATE HOUSEHOLD
// ========================================

export async function setHouseholdStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "households"
      )
      .update({
        is_active:
          isActive,
      })
      .eq(
        "id",
        id
      )

  if (error) {
    throw error
  }
}