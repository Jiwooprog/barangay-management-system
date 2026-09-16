export type AssignableUserRole =
  | "super_admin"
  | "barangay_staff"
  | "resident"

export type UserRoleName =
  | AssignableUserRole
  | "No Role"

export interface UserOverview {
  user_id: string

  email:
    | string
    | null

  display_name:
    | string
    | null

  role_name:
    UserRoleName

  resident_id:
    | string
    | null

  resident_number:
    | string
    | null

  resident_name:
    | string
    | null

  created_at: string

  last_sign_in_at:
    | string
    | null

  email_confirmed_at:
    | string
    | null
}

export interface ManageableResident {
  id: string

  resident_number:
    string

  first_name:
    string

  middle_name:
    | string
    | null

  last_name:
    string

  suffix:
    | string
    | null
}

export interface UpdateUserAccessInput {
  userId: string
  role: AssignableUserRole

  residentId:
    | string
    | null
}