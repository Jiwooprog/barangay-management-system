export interface Household {
  id: string
  household_number: string

  purok_id: string

  house_number: string | null
  street: string | null

  contact_number: string | null
  housing_status: string | null
  income_classification: string | null
  notes: string | null

  household_head_id: string | null

  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null

  puroks?: {
    id: string
    name: string
    code: string | null
  } | null

  household_head?: {
    id: string
    resident_number: string
    first_name: string
    middle_name: string | null
    last_name: string
    suffix: string | null
  } | null
}

export interface CreateHouseholdInput {
  household_number: string
  purok_id: string

  house_number?: string
  street?: string

  contact_number?: string
  housing_status?: string
  income_classification?: string
  notes?: string

  household_head_id?: string | null
}

export interface UpdateHouseholdInput
  extends Partial<CreateHouseholdInput> {
  is_active?: boolean
}