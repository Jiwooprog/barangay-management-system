import {
  supabase,
} from "@/lib/supabase"

import type {
  BarangaySettings,
  UpdateBarangaySettingsInput,
} from "@/features/settings/types"

// ========================================
// GET SETTINGS
// ========================================

export async function getBarangaySettings() {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "barangay_settings"
      )
      .select("*")
      .eq(
        "id",
        1
      )
      .single()

  if (error) {
    throw error
  }

  return data as BarangaySettings
}

// ========================================
// UPDATE SETTINGS
// ========================================

export async function updateBarangaySettings(
  input:
    UpdateBarangaySettingsInput
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "barangay_settings"
      )
      .update({
        barangay_name:
          input.barangay_name,

        municipality_city:
          input.municipality_city,

        province:
          input.province,

        barangay_address:
          input.barangay_address,

        punong_barangay_name:
          input.punong_barangay_name,

        contact_number:
          input.contact_number,

        email:
          input.email,

        updated_at:
          new Date()
            .toISOString(),
      })
      .eq(
        "id",
        1
      )
      .select("*")
      .single()

  if (error) {
    throw error
  }

  return data as BarangaySettings
}