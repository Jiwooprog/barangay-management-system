export interface CommitteeOfficialResident {
  id: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  photo_url: string | null
}

export interface CommitteeOfficial {
  id: string
  position: string
  official_type: "barangay" | "sk"
  is_active: boolean

  residents?:
    | CommitteeOfficialResident
    | null
}

export interface CommitteeMember {
  id: string

  committee_id: string
  official_id: string

  member_role: string | null

  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null

  officials?:
    | CommitteeOfficial
    | null
}

export interface Committee {
  id: string

  name: string
  description: string | null

  chairperson_official_id:
    | string
    | null

  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null

  chairperson?:
    | CommitteeOfficial
    | null

  committee_members?:
    | CommitteeMember[]
    | null
}

export interface CommitteeFormInput {
  name: string

  description?: string

  chairperson_official_id:
    | string
    | null
}

export interface CommitteeMemberInput {
  committee_id: string
  official_id: string

  member_role?: string
}