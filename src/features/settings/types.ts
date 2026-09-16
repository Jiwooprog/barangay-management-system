export interface BarangaySettings {
  id: number
  barangay_name: string
  municipality_city: string
  province: string

  barangay_address:
    | string
    | null

  punong_barangay_name:
    | string
    | null

  contact_number:
    | string
    | null

  email:
    | string
    | null

  logo_url:
    | string
    | null

  barangay_seal_url:
    | string
    | null

  municipality_seal_url:
    | string
    | null

  created_at: string
  updated_at: string
}

export interface UpdateBarangaySettingsInput {
  barangay_name: string
  municipality_city: string
  province: string

  barangay_address:
    | string
    | null

  punong_barangay_name:
    | string
    | null

  contact_number:
    | string
    | null

  email:
    | string
    | null
}