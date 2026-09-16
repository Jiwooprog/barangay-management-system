import { supabase } from "@/lib/supabase"

import type {
  Official,
  OfficialFormInput,
} from "@/features/officials/types"

function cleanOptional(
  value?: string
) {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

export async function getOfficials(): Promise<
  Official[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("officials")
    .select(`
      *,
      residents:residents!officials_resident_id_fkey (
        id,
        resident_number,
        first_name,
        middle_name,
        last_name,
        suffix,
        photo_url,
        is_active
      )
    `)
    .is("deleted_at", null)
    .order("display_order", {
      ascending: true,
    })
    .order("position", {
      ascending: true,
    })

  if (error) {
    console.error(
      "Officials query error:",
      error
    )

    throw error
  }

  return (data ?? []) as Official[]
}

export async function createOfficial(
  input: OfficialFormInput
): Promise<Official> {
  const {
    data,
    error,
  } = await supabase
    .from("officials")
    .insert({
      resident_id:
        input.resident_id || null,

      official_type:
        input.official_type,

      position:
        input.position.trim(),

      term_start:
        cleanOptional(
          input.term_start
        ),

      term_end:
        cleanOptional(
          input.term_end
        ),

      is_current:
        input.is_current,

      display_order:
        input.display_order,

      notes:
        cleanOptional(
          input.notes
        ),

      is_active: true,
    })
    .select(`
      *,
      residents:residents!officials_resident_id_fkey (
        id,
        resident_number,
        first_name,
        middle_name,
        last_name,
        suffix,
        photo_url,
        is_active
      )
    `)
    .single()

  if (error) {
    console.error(
      "Create official error:",
      error
    )

    throw error
  }

  return data as Official
}

export async function updateOfficial(
  id: string,
  input: OfficialFormInput
): Promise<Official> {
  const {
    data,
    error,
  } = await supabase
    .from("officials")
    .update({
      resident_id:
        input.resident_id || null,

      official_type:
        input.official_type,

      position:
        input.position.trim(),

      term_start:
        cleanOptional(
          input.term_start
        ),

      term_end:
        cleanOptional(
          input.term_end
        ),

      is_current:
        input.is_current,

      display_order:
        input.display_order,

      notes:
        cleanOptional(
          input.notes
        ),
    })
    .eq("id", id)
    .select(`
      *,
      residents:residents!officials_resident_id_fkey (
        id,
        resident_number,
        first_name,
        middle_name,
        last_name,
        suffix,
        photo_url,
        is_active
      )
    `)
    .single()

  if (error) {
    console.error(
      "Update official error:",
      error
    )

    throw error
  }

  return data as Official
}

export async function setOfficialStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("officials")
    .update({
      is_active: isActive,
    })
    .eq("id", id)

  if (error) {
    console.error(
      "Official status error:",
      error
    )

    throw error
  }
}