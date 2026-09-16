import { supabase } from "@/lib/supabase"

import type {
  CertificateRequest,
} from "@/features/certificates/types"

import type {
  Announcement,
} from "@/features/announcements/types"

// ========================================
// TYPES
// ========================================

export interface CreateMyCertificateRequestInput {
  certificate_type_id: string
  purpose: string

  business_name?: string
  business_address?: string

  notes?: string
}

export interface ResidentPortalProfile {
  id: string

  resident_number: string

  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null

  birthday: string
  gender: string
  civil_status: string | null

  birthplace: string | null
  nationality: string | null
  religion: string | null

  occupation: string | null
  educational_attainment: string | null

  email: string | null
  contact_number: string | null

  house_number: string | null
  street: string | null

  purok_id: string | null
  household_id: string | null

  // VOTER
  is_voter: boolean
  precinct_number: string | null

  // 4PS
  is_4ps: boolean

  // PWD
  is_pwd: boolean
  pwd_id_number: string | null

  // SENIOR CITIZEN
  is_senior_citizen: boolean
  senior_citizen_id_number: string | null

  // SOLO PARENT
  is_solo_parent: boolean
  solo_parent_id_number: string | null

  // INDIGENOUS PEOPLE
  is_indigenous_people: boolean

  // RESIDENCY
  residency_status: string
  residency_start_date: string | null

  // EMERGENCY CONTACT
  emergency_contact_name: string | null
  emergency_contact_number: string | null
  emergency_contact_relationship: string | null

  photo_url: string | null
  notes: string | null

  is_active: boolean

  // RELATIONSHIPS

  puroks:
    | {
        id: string
        name: string
        code: string | null
      }
    | null

  households:
    | {
        id: string
        household_number: string
        house_number: string | null
        street: string | null
        housing_status: string | null
      }
    | null
}

export interface ResidentDashboardData {
  profile: ResidentPortalProfile

  totalCertificateRequests: number

  pendingCertificateRequests: number

  approvedCertificateRequests: number

  issuedCertificateRequests: number

  recentCertificateRequests:
    CertificateRequest[]

  recentAnnouncements:
    Announcement[]
}

// ========================================
// CURRENT RESIDENT ID
// ========================================

export async function getCurrentResidentId(): Promise<string> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "current_resident_id"
  )

  if (error) {
    console.error(
      "Current resident ID error:",
      error
    )

    throw error
  }

  if (!data) {
    throw new Error(
      "This account is not linked to a resident record."
    )
  }

  return data as string
}

// ========================================
// MY RESIDENT PROFILE
// ========================================

export async function getMyResidentProfile(): Promise<
  ResidentPortalProfile
> {
  const residentId =
    await getCurrentResidentId()

  const {
    data,
    error,
  } = await supabase
    .from("residents")
    .select(`
      id,
      resident_number,
      first_name,
      middle_name,
      last_name,
      suffix,
      birthday,
      gender,
      civil_status,
      birthplace,
      nationality,
      religion,
      occupation,
      educational_attainment,
      email,
      contact_number,
      house_number,
      street,
      purok_id,
      household_id,

      is_voter,
      precinct_number,

      is_4ps,

      is_pwd,
      pwd_id_number,

      is_senior_citizen,
      senior_citizen_id_number,

      is_solo_parent,
      solo_parent_id_number,

      is_indigenous_people,

      residency_status,
      residency_start_date,

      emergency_contact_name,
      emergency_contact_number,
      emergency_contact_relationship,

      photo_url,
      notes,
      is_active,

      puroks:puroks!residents_purok_id_fkey (
        id,
        name,
        code
      ),

      households:households!residents_household_id_fkey (
        id,
        household_number,
        house_number,
        street,
        housing_status
      )
    `)
    .eq(
      "id",
      residentId
    )
    .is(
      "deleted_at",
      null
    )
    .single()

  if (error) {
    console.error(
      "Resident portal profile error:",
      error
    )

    throw error
  }

  if (!data) {
    throw new Error(
      "Resident profile was not found."
    )
  }

  return data as unknown as ResidentPortalProfile
}

// ========================================
// MY CERTIFICATE REQUESTS
// ========================================

export async function getMyCertificateRequests(): Promise<
  CertificateRequest[]
> {
  const residentId =
    await getCurrentResidentId()

  const {
    data,
    error,
  } = await supabase
    .from("certificate_requests")
    .select(`
      *,

      residents:residents!certificate_requests_resident_id_fkey (
        id,
        resident_number,
        first_name,
        middle_name,
        last_name,
        suffix,
        birthday,
        gender,
        contact_number,
        house_number,
        street,
        purok_id,
        household_id,
        residency_status,
        is_active,

        puroks:puroks!residents_purok_id_fkey (
          id,
          name,
          code
        )
      ),

      certificate_types:certificate_types!certificate_requests_certificate_type_id_fkey (
        id,
        code,
        name,
        description,
        fee,
        is_active,
        created_at,
        updated_at,
        deleted_at
      )
    `)
    .eq(
      "resident_id",
      residentId
    )
    .is(
      "deleted_at",
      null
    )
    .order(
      "requested_at",
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(
      "Resident certificate requests error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as unknown as CertificateRequest[]
}

// ========================================
// MY ANNOUNCEMENTS
// ========================================
//
// Supabase RLS should control which
// announcements this resident may see.
//
// Resident may receive:
// - Everyone
// - Residents
// - Their own purok
//
// Staff-only announcements should be
// blocked by RLS.
// ========================================

export async function getMyAnnouncements(): Promise<
  Announcement[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .select(`
      *,
      puroks:puroks (
        id,
        name,
        code
      )
    `)
    .eq(
      "status",
      "published"
    )
    .eq(
      "is_active",
      true
    )
    .is(
      "deleted_at",
      null
    )
    .order(
      "is_pinned",
      {
        ascending: false,
      }
    )
    .order(
      "publish_at",
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(
      "Resident announcements error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as unknown as Announcement[]
}

// ========================================
// RESIDENT DASHBOARD
// ========================================

export async function getResidentDashboardData(): Promise<
  ResidentDashboardData
> {
  const [
    profile,
    certificateRequests,
    announcements,
  ] = await Promise.all([
    getMyResidentProfile(),

    getMyCertificateRequests(),

    getMyAnnouncements(),
  ])

  const pendingCertificateRequests =
    certificateRequests.filter(
      (request) =>
        request.status ===
        "pending"
    ).length

  const approvedCertificateRequests =
    certificateRequests.filter(
      (request) =>
        request.status ===
        "approved"
    ).length

  const issuedCertificateRequests =
    certificateRequests.filter(
      (request) =>
        request.status ===
        "issued"
    ).length

  return {
    profile,

    totalCertificateRequests:
      certificateRequests.length,

    pendingCertificateRequests,

    approvedCertificateRequests,

    issuedCertificateRequests,

    recentCertificateRequests:
      certificateRequests.slice(
        0,
        5
      ),

    recentAnnouncements:
      announcements.slice(
        0,
        5
      ),
  }
}
// ========================================
// CREATE MY CERTIFICATE REQUEST
// ========================================

export async function createMyCertificateRequest(
  input: CreateMyCertificateRequestInput
): Promise<{
  id: string
  request_number: string
}> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "create_my_certificate_request",
    {
      p_certificate_type_id:
        input.certificate_type_id,

      p_purpose:
        input.purpose.trim(),

      p_business_name:
        input.business_name?.trim() ||
        null,

      p_business_address:
        input.business_address?.trim() ||
        null,

      p_notes:
        input.notes?.trim() ||
        null,
    }
  )

  if (error) {
    console.error(
      "Create resident certificate request error:",
      error
    )

    throw error
  }

  if (
    !data ||
    data.length === 0
  ) {
    throw new Error(
      "Certificate request was not created."
    )
  }

  return data[0] as {
    id: string
    request_number: string
  }
}