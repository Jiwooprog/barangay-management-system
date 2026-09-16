export type OfficialType =
  | "barangay"
  | "sk"

export interface OfficialResident {
  id: string
  resident_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  photo_url: string | null
  is_active: boolean
}

export interface Official {
  id: string
  resident_id: string | null

  official_type: OfficialType
  position: string

  term_start: string | null
  term_end: string | null

  is_current: boolean
  display_order: number

  notes: string | null
  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null

  residents?: OfficialResident | null
}

export interface OfficialFormInput {
  resident_id: string | null

  official_type: OfficialType
  position: string

  term_start?: string
  term_end?: string

  is_current: boolean
  display_order: number

  notes?: string
}