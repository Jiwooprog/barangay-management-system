import { supabase } from "@/lib/supabase"

import type {
  Resident,
  ResidentFormInput,
} from "@/features/residents/types"

// ========================================
// TYPES
// ========================================

export interface ResidentListFilters {
  search: string
  gender: string
  purokId: string
  status:
    | "all"
    | "active"
    | "inactive"
  page: number
  pageSize: number
}

export interface ResidentListResult {
  data: Resident[]
  count: number
}

export interface ResidentPurokOption {
  id: string
  name: string
}

// ========================================
// HELPERS
// ========================================

function cleanOptional(
  value?: string
): string | null {
  return value?.trim() || null
}

// ========================================
// ORIGINAL RESIDENT LIST
// ========================================

export async function getResidents(): Promise<
  Resident[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from("residents")
      .select(`
        *,
        puroks:puroks!residents_purok_id_fkey (
          id,
          name,
          code
        ),
        households:households!residents_household_id_fkey (
          id,
          household_number,
          housing_status
        )
      `)
      .is(
        "deleted_at",
        null
      )
      .order(
        "last_name",
        {
          ascending: true,
        }
      )
      .order(
        "first_name",
        {
          ascending: true,
        }
      )

  if (error) {
    console.error(
      "Residents query error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as Resident[]
}

// ========================================
// PAGINATED RESIDENT LIST
// ========================================

export async function getPaginatedResidents(
  filters: ResidentListFilters
): Promise<ResidentListResult> {
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
        /[,%()]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )

  // ======================================
  // FIND RELATED HOUSEHOLDS / PUROKS
  // ======================================

  let householdIds:
    string[] = []

  let purokIds:
    string[] = []

  if (search) {
    const [
      householdResult,
      purokResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "households"
          )
          .select(
            "id"
          )
          .is(
            "deleted_at",
            null
          )
          .ilike(
            "household_number",
            `%${search}%`
          ),

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
      ])

    if (
      householdResult.error
    ) {
      console.error(
        "Household search error:",
        householdResult.error
      )

      throw householdResult.error
    }

    if (
      purokResult.error
    ) {
      console.error(
        "Purok search error:",
        purokResult.error
      )

      throw purokResult.error
    }

    householdIds =
      (
        householdResult.data ??
        []
      ).map(
        (item) =>
          item.id
      )

    purokIds =
      (
        purokResult.data ??
        []
      ).map(
        (item) =>
          item.id
      )
  }

  // ======================================
  // BASE QUERY
  // ======================================

  let query =
    supabase
      .from(
        "residents"
      )
      .select(
        `
          *,
          puroks:puroks!residents_purok_id_fkey (
            id,
            name,
            code
          ),
          households:households!residents_household_id_fkey (
            id,
            household_number,
            housing_status
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
      `resident_number.ilike.%${search}%`,
      `first_name.ilike.%${search}%`,
      `middle_name.ilike.%${search}%`,
      `last_name.ilike.%${search}%`,
      `suffix.ilike.%${search}%`,
      `email.ilike.%${search}%`,
      `contact_number.ilike.%${search}%`,
    ]

    if (
      householdIds.length >
      0
    ) {
      conditions.push(
        `household_id.in.(${householdIds.join(
          ","
        )})`
      )
    }

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

    query =
      query.or(
        conditions.join(
          ","
        )
      )
  }

  // ======================================
  // GENDER FILTER
  // ======================================

  if (
    filters.gender !==
    "all"
  ) {
    query =
      query.eq(
        "gender",
        filters.gender
      )
  }

  // ======================================
  // PUROK FILTER
  // ======================================

  if (
    filters.purokId !==
    "all"
  ) {
    query =
      query.eq(
        "purok_id",
        filters.purokId
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
        "last_name",
        {
          ascending: true,
        }
      )
      .order(
        "first_name",
        {
          ascending: true,
        }
      )
      .range(
        from,
        to
      )

  if (error) {
    console.error(
      "Paginated residents query error:",
      error
    )

    throw error
  }

  return {
    data:
      (data ??
        []) as Resident[],

    count:
      count ?? 0,
  }
}

// ========================================
// PUROK FILTER OPTIONS
// ========================================

export async function getResidentPurokOptions(): Promise<
  ResidentPurokOption[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "puroks"
      )
      .select(
        "id, name"
      )
      .is(
        "deleted_at",
        null
      )
      .order(
        "name",
        {
          ascending: true,
        }
      )

  if (error) {
    console.error(
      "Resident purok options error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as ResidentPurokOption[]
}


// ========================================
// CREATE RESIDENT
// ========================================

export async function createResident(
  input: ResidentFormInput
): Promise<Resident> {
  const { data, error } = await supabase
    .from("residents")
    .insert({
      resident_number: input.resident_number.trim(),
      first_name: input.first_name.trim(),
      middle_name: cleanOptional(input.middle_name),
      last_name: input.last_name.trim(),
      suffix: cleanOptional(input.suffix),
      birthday: input.birthday,
      gender: input.gender,
      civil_status: cleanOptional(input.civil_status),
      birthplace: cleanOptional(input.birthplace),
      nationality:
        cleanOptional(input.nationality) ?? "Filipino",
      religion: cleanOptional(input.religion),
      occupation: cleanOptional(input.occupation),
      educational_attainment: cleanOptional(
        input.educational_attainment
      ),
      email: cleanOptional(input.email),
      contact_number: cleanOptional(
        input.contact_number
      ),
      house_number: cleanOptional(
        input.house_number
      ),
      street: cleanOptional(input.street),
      purok_id: input.purok_id,
      household_id:
        input.household_id || null,

      is_voter: input.is_voter,
      precinct_number: input.is_voter
        ? cleanOptional(input.precinct_number)
        : null,

      is_4ps: input.is_4ps,

      is_pwd: input.is_pwd,
      pwd_id_number: input.is_pwd
        ? cleanOptional(input.pwd_id_number)
        : null,

      is_senior_citizen:
        input.is_senior_citizen,
      senior_citizen_id_number:
        input.is_senior_citizen
          ? cleanOptional(
              input.senior_citizen_id_number
            )
          : null,

      is_solo_parent: input.is_solo_parent,
      solo_parent_id_number:
        input.is_solo_parent
          ? cleanOptional(
              input.solo_parent_id_number
            )
          : null,

      is_indigenous_people:
        input.is_indigenous_people,

      residency_status:
        input.residency_status,

      residency_start_date:
        input.residency_start_date || null,

      emergency_contact_name:
        cleanOptional(
          input.emergency_contact_name
        ),

      emergency_contact_number:
        cleanOptional(
          input.emergency_contact_number
        ),

      emergency_contact_relationship:
        cleanOptional(
          input.emergency_contact_relationship
        ),

      notes: cleanOptional(input.notes),
    })
    .select()
    .single()

  if (error) {
    console.error(
      "Create resident error:",
      error
    )

    throw error
  }

  return data as Resident
}

// ========================================
// UPDATE RESIDENT
// ========================================

export async function updateResident(
  id: string,
  input: ResidentFormInput
): Promise<Resident> {
  const { data, error } = await supabase
    .from("residents")
    .update({
      resident_number: input.resident_number.trim(),
      first_name: input.first_name.trim(),
      middle_name: cleanOptional(input.middle_name),
      last_name: input.last_name.trim(),
      suffix: cleanOptional(input.suffix),
      birthday: input.birthday,
      gender: input.gender,
      civil_status: cleanOptional(input.civil_status),
      birthplace: cleanOptional(input.birthplace),
      nationality:
        cleanOptional(input.nationality) ?? "Filipino",
      religion: cleanOptional(input.religion),
      occupation: cleanOptional(input.occupation),
      educational_attainment: cleanOptional(
        input.educational_attainment
      ),
      email: cleanOptional(input.email),
      contact_number: cleanOptional(
        input.contact_number
      ),
      house_number: cleanOptional(
        input.house_number
      ),
      street: cleanOptional(input.street),
      purok_id: input.purok_id,
      household_id:
        input.household_id || null,

      is_voter: input.is_voter,
      precinct_number: input.is_voter
        ? cleanOptional(input.precinct_number)
        : null,

      is_4ps: input.is_4ps,

      is_pwd: input.is_pwd,
      pwd_id_number: input.is_pwd
        ? cleanOptional(input.pwd_id_number)
        : null,

      is_senior_citizen:
        input.is_senior_citizen,
      senior_citizen_id_number:
        input.is_senior_citizen
          ? cleanOptional(
              input.senior_citizen_id_number
            )
          : null,

      is_solo_parent: input.is_solo_parent,
      solo_parent_id_number:
        input.is_solo_parent
          ? cleanOptional(
              input.solo_parent_id_number
            )
          : null,

      is_indigenous_people:
        input.is_indigenous_people,

      residency_status:
        input.residency_status,

      residency_start_date:
        input.residency_start_date || null,

      emergency_contact_name:
        cleanOptional(
          input.emergency_contact_name
        ),

      emergency_contact_number:
        cleanOptional(
          input.emergency_contact_number
        ),

      emergency_contact_relationship:
        cleanOptional(
          input.emergency_contact_relationship
        ),

      notes: cleanOptional(input.notes),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(
      "Update resident error:",
      error
    )

    throw error
  }

  return data as Resident
}

// ========================================
// ACTIVATE / DEACTIVATE RESIDENT
// ========================================

export async function setResidentStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from("residents")
    .update({
      is_active: isActive,
    })
    .eq("id", id)

  if (error) {
    console.error(
      "Resident status error:",
      error
    )

    throw error
  }
}

// ========================================
// UPDATE RESIDENT PHOTO
// ========================================

export async function updateResidentPhoto(
  residentId: string,
  photoPath: string | null
): Promise<void> {
  const { error } = await supabase
    .from("residents")
    .update({
      photo_url: photoPath,
    })
    .eq("id", residentId)

  if (error) {
    console.error(
      "Update resident photo error:",
      error
    )

    throw error
  }
}