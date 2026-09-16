export interface Resident {
  id: string
  resident_number: string

  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null

  birthday: string
  gender: "male" | "female"

  civil_status:
    | "single"
    | "married"
    | "widowed"
    | "separated"
    | null

  birthplace: string | null
  nationality: string | null
  religion: string | null

  occupation: string | null
  educational_attainment: string | null

  email: string | null
  contact_number: string | null

  house_number: string | null
  street: string | null

  purok_id: string
  household_id: string | null

  is_voter: boolean
  precinct_number: string | null

  is_4ps: boolean

  is_pwd: boolean
  pwd_id_number: string | null

  is_senior_citizen: boolean
  senior_citizen_id_number: string | null

  is_solo_parent: boolean
  solo_parent_id_number: string | null

  is_indigenous_people: boolean

  residency_status:
    | "active"
    | "transferred"
    | "deceased"

  residency_start_date: string | null

  emergency_contact_name: string | null
  emergency_contact_number: string | null
  emergency_contact_relationship: string | null

  photo_url: string | null
  notes: string | null

  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null

  puroks?: {
    id: string
    name: string
    code: string | null
  } | null

  households?: {
    id: string
    household_number: string
    housing_status: string | null
  } | null
}

export interface ResidentFormInput {
  resident_number: string

  first_name: string
  middle_name?: string
  last_name: string
  suffix?: string

  birthday: string
  gender: "male" | "female"
  civil_status?: string

  birthplace?: string
  nationality?: string
  religion?: string

  occupation?: string
  educational_attainment?: string

  email?: string
  contact_number?: string

  house_number?: string
  street?: string

  purok_id: string
  household_id?: string | null

  is_voter: boolean
  precinct_number?: string

  is_4ps: boolean

  is_pwd: boolean
  pwd_id_number?: string

  is_senior_citizen: boolean
  senior_citizen_id_number?: string

  is_solo_parent: boolean
  solo_parent_id_number?: string

  is_indigenous_people: boolean

  residency_status:
    | "active"
    | "transferred"
    | "deceased"

  residency_start_date?: string

  emergency_contact_name?: string
  emergency_contact_number?: string
  emergency_contact_relationship?: string

  notes?: string
}