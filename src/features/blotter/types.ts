// ========================================
// BLOTTER STATUS
// ========================================

export type BlotterCaseStatus =
  | "open"
  | "under_mediation"
  | "settled"
  | "referred"
  | "dismissed"
  | "closed"

// ========================================
// PRIORITY
// ========================================

export type BlotterPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent"

// ========================================
// HEARING STATUS
// ========================================

export type BlotterHearingStatus =
  | "scheduled"
  | "completed"
  | "rescheduled"
  | "cancelled"
  | "no_show"

// ========================================
// RESIDENT SUMMARY
// ========================================

export interface BlotterResidentSummary {
  id: string

  resident_number: string

  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null

  contact_number: string | null

  house_number: string | null
  street: string | null
}

// ========================================
// BLOTTER CASE
// ========================================

export interface BlotterCase {
  id: string

  case_number: string

  // Incident
  complaint_type: string

  incident_date: string
  incident_time: string | null

  incident_location: string | null

  incident_details: string

  // Complainant
  complainant_resident_id:
    | string
    | null

  complainant_name:
    | string
    | null

  complainant_contact_number:
    | string
    | null

  complainant_address:
    | string
    | null

  // Respondent
  respondent_resident_id:
    | string
    | null

  respondent_name:
    | string
    | null

  respondent_contact_number:
    | string
    | null

  respondent_address:
    | string
    | null

  // Case management
  priority: BlotterPriority

  status: BlotterCaseStatus

  action_taken:
    | string
    | null

  settlement_details:
    | string
    | null

  referred_to:
    | string
    | null

  notes:
    | string
    | null

  // Staff
  handled_by:
    | string
    | null

  closed_by:
    | string
    | null

  closed_at:
    | string
    | null

  // System
  is_active: boolean

  created_at: string
  updated_at: string

  deleted_at:
    | string
    | null

  // Relationships
  complainant_resident:
    | BlotterResidentSummary
    | null

  respondent_resident:
    | BlotterResidentSummary
    | null
}

// ========================================
// CREATE CASE
// ========================================

export interface CreateBlotterCaseInput {
  complaint_type: string

  incident_date: string

  incident_time?:
    | string
    | null

  incident_location?:
    | string
    | null

  incident_details: string

  // Complainant
  complainant_resident_id?:
    | string
    | null

  complainant_name?:
    | string
    | null

  complainant_contact_number?:
    | string
    | null

  complainant_address?:
    | string
    | null

  // Respondent
  respondent_resident_id?:
    | string
    | null

  respondent_name?:
    | string
    | null

  respondent_contact_number?:
    | string
    | null

  respondent_address?:
    | string
    | null

  priority?: BlotterPriority

  notes?:
    | string
    | null
}

// ========================================
// UPDATE CASE
// ========================================

export interface UpdateBlotterCaseInput {
  id: string

  complaint_type?: string

  incident_date?: string

  incident_time?:
    | string
    | null

  incident_location?:
    | string
    | null

  incident_details?: string

  complainant_resident_id?:
    | string
    | null

  complainant_name?:
    | string
    | null

  complainant_contact_number?:
    | string
    | null

  complainant_address?:
    | string
    | null

  respondent_resident_id?:
    | string
    | null

  respondent_name?:
    | string
    | null

  respondent_contact_number?:
    | string
    | null

  respondent_address?:
    | string
    | null

  priority?: BlotterPriority

  status?: BlotterCaseStatus

  action_taken?:
    | string
    | null

  settlement_details?:
    | string
    | null

  referred_to?:
    | string
    | null

  notes?:
    | string
    | null
}

// ========================================
// BLOTTER HEARING
// ========================================

export interface BlotterHearing {
  id: string

  blotter_case_id: string

  hearing_date: string

  venue:
    | string
    | null

  status:
    BlotterHearingStatus

  complainant_present:
    | boolean
    | null

  respondent_present:
    | boolean
    | null

  notes:
    | string
    | null

  outcome:
    | string
    | null

  conducted_by:
    | string
    | null

  created_at: string
  updated_at: string

  deleted_at:
    | string
    | null
}

// ========================================
// CASE HISTORY
// ========================================

export interface BlotterCaseUpdate {
  id: string

  blotter_case_id: string

  action: string

  description:
    | string
    | null

  old_status:
    | string
    | null

  new_status:
    | string
    | null

  created_by:
    | string
    | null

  created_at: string
}

// ========================================
// CREATE HEARING
// ========================================

export interface CreateBlotterHearingInput {
  blotter_case_id: string

  hearing_date: string

  venue?:
    | string
    | null

  notes?:
    | string
    | null
}

// ========================================
// UPDATE HEARING
// ========================================

export interface UpdateBlotterHearingInput {
  id: string

  blotter_case_id: string

  hearing_date?: string

  venue?:
    | string
    | null

  status?:
    BlotterHearingStatus

  complainant_present?:
    | boolean
    | null

  respondent_present?:
    | boolean
    | null

  notes?:
    | string
    | null

  outcome?:
    | string
    | null
}

// ========================================
// BLOTTER DASHBOARD
// ========================================

export interface BlotterDashboardRecentCase {
  id: string
  case_number: string
  complaint_type: string

  incident_date: string

  priority:
    BlotterPriority

  status:
    BlotterCaseStatus

  created_at: string
}

export interface BlotterDashboardStats {
  total: number

  open: number

  under_mediation: number

  settled: number

  referred: number

  dismissed: number

  closed: number

  resolved: number

  urgent: number

  high_priority: number

  recent_cases:
    BlotterDashboardRecentCase[]
}