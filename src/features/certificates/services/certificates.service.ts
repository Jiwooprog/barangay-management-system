import { supabase } from "@/lib/supabase"

import type {
  ApproveCertificateRequestInput,
  CertificatePaymentStatus,
  CertificateRequest,
  CertificateRequestStatus,
  CertificateType,
  CreateCertificateRequestInput,
  IssueCertificateInput,
  RejectCertificateRequestInput,
  UpdateCertificatePaymentInput,
} from "@/features/certificates/types"

// ========================================
// PAGINATED LIST TYPES
// ========================================

export interface CertificateRequestListFilters {
  search: string

  status:
    | CertificateRequestStatus
    | "all"

  paymentStatus:
    | CertificatePaymentStatus
    | "all"

  certificateTypeId: string

  page: number
  pageSize: number
}

export interface CertificateRequestListResult {
  data: CertificateRequest[]
  count: number
}

export interface CertificateRequestSummary {
  pending: number
  approved: number
  issued: number
}

// ========================================
// HELPERS
// ========================================

function cleanOptional(
  value?: string
) {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

// ========================================
// CURRENT AUTH USER
// ========================================

async function getCurrentUserId(): Promise<string> {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser()

  if (error) {
    console.error(
      "Get current user error:",
      error
    )

    throw error
  }

  if (!data.user) {
    throw new Error(
      "No authenticated user found."
    )
  }

  return data.user.id
}

// ========================================
// CERTIFICATE TYPES
// ========================================

export async function getCertificateTypes(): Promise<
  CertificateType[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "certificate_types"
      )
      .select("*")
      .is(
        "deleted_at",
        null
      )
      .order(
        "name",
        {
          ascending: true,
        }
      )

  if (error) {
    console.error(
      "Certificate types query error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as CertificateType[]
}

// ========================================
// CERTIFICATE REQUESTS
//
// Kept for compatibility with any other
// module that still needs the full list.
// ========================================

export async function getCertificateRequests(): Promise<
  CertificateRequest[]
> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
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
      "Certificate requests query error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as CertificateRequest[]
}

// ========================================
// PAGINATED CERTIFICATE REQUESTS
// ========================================

export async function getPaginatedCertificateRequests(
  filters: CertificateRequestListFilters
): Promise<CertificateRequestListResult> {
  const page =
    Math.max(
      filters.page,
      1
    )

  const pageSize =
    Math.max(
      filters.pageSize,
      1
    )

  const from =
    (page - 1) *
    pageSize

  const to =
    from +
    pageSize -
    1

  const search =
    filters.search
      .trim()
      .replace(
        /[,%()"]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )

  // ======================================
  // RELATED SEARCH
  //
  // Search resident name / number and
  // certificate type name separately,
  // then use the matching IDs in the
  // certificate request query.
  // ======================================

  let residentIds:
    string[] = []

  let certificateTypeIds:
    string[] = []

  if (search) {
    const [
      residentsResult,
      certificateTypesResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "residents"
          )
          .select(
            "id"
          )
          .is(
            "deleted_at",
            null
          )
          .or(
            [
              `resident_number.ilike.%${search}%`,
              `first_name.ilike.%${search}%`,
              `middle_name.ilike.%${search}%`,
              `last_name.ilike.%${search}%`,
              `suffix.ilike.%${search}%`,
            ].join(",")
          ),

        supabase
          .from(
            "certificate_types"
          )
          .select(
            "id"
          )
          .is(
            "deleted_at",
            null
          )
          .ilike(
            "name",
            `%${search}%`
          ),
      ])

    if (
      residentsResult.error
    ) {
      console.error(
        "Certificate resident search error:",
        residentsResult.error
      )

      throw residentsResult.error
    }

    if (
      certificateTypesResult.error
    ) {
      console.error(
        "Certificate type search error:",
        certificateTypesResult.error
      )

      throw certificateTypesResult.error
    }

    residentIds =
      (
        residentsResult.data ??
        []
      ).map(
        (resident) =>
          resident.id
      )

    certificateTypeIds =
      (
        certificateTypesResult.data ??
        []
      ).map(
        (type) =>
          type.id
      )
  }

  // ======================================
  // BASE QUERY
  // ======================================

  let query =
    supabase
      .from(
        "certificate_requests"
      )
      .select(
        `
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
        `,
        {
          count: "exact",
        }
      )
      .is(
        "deleted_at",
        null
      )

  // ======================================
  // SEARCH
  // ======================================

  if (search) {
    const conditions = [
      `request_number.ilike.%${search}%`,
      `certificate_number.ilike.%${search}%`,
      `purpose.ilike.%${search}%`,
      `business_name.ilike.%${search}%`,
      `payment_reference.ilike.%${search}%`,
    ]

    if (
      residentIds.length >
      0
    ) {
      conditions.push(
        `resident_id.in.(${residentIds.join(
          ","
        )})`
      )
    }

    if (
      certificateTypeIds.length >
      0
    ) {
      conditions.push(
        `certificate_type_id.in.(${certificateTypeIds.join(
          ","
        )})`
      )
    }

    query =
      query.or(
        conditions.join(",")
      )
  }

  // ======================================
  // STATUS FILTER
  // ======================================

  if (
    filters.status !==
    "all"
  ) {
    query =
      query.eq(
        "status",
        filters.status
      )
  }

  // ======================================
  // PAYMENT FILTER
  // ======================================

  if (
    filters.paymentStatus !==
    "all"
  ) {
    query =
      query.eq(
        "payment_status",
        filters.paymentStatus
      )
  }

  // ======================================
  // CERTIFICATE TYPE FILTER
  // ======================================

  if (
    filters.certificateTypeId !==
    "all"
  ) {
    query =
      query.eq(
        "certificate_type_id",
        filters.certificateTypeId
      )
  }

  // ======================================
  // ORDER + PAGINATION
  // ======================================

  const {
    data,
    error,
    count,
  } =
    await query
      .order(
        "requested_at",
        {
          ascending: false,
        }
      )
      .range(
        from,
        to
      )

  if (error) {
    console.error(
      "Paginated certificate requests error:",
      error
    )

    throw error
  }

  return {
    data:
      (data ??
        []) as CertificateRequest[],

    count:
      count ?? 0,
  }
}

// ========================================
// CERTIFICATE REQUEST SUMMARY
//
// These are global totals, not counts from
// the current paginated page.
// ========================================

export async function getCertificateRequestSummary(): Promise<
  CertificateRequestSummary
> {
  async function countStatus(
    status:
      CertificateRequestStatus
  ): Promise<number> {
    const {
      count,
      error,
    } =
      await supabase
        .from(
          "certificate_requests"
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          }
        )
        .is(
          "deleted_at",
          null
        )
        .eq(
          "status",
          status
        )

    if (error) {
      console.error(
        `Certificate ${status} count error:`,
        error
      )

      throw error
    }

    return count ?? 0
  }

  const [
    pending,
    approved,
    issued,
  ] =
    await Promise.all([
      countStatus(
        "pending"
      ),

      countStatus(
        "approved"
      ),

      countStatus(
        "issued"
      ),
    ])

  return {
    pending,
    approved,
    issued,
  }
}

// ========================================
// CREATE CERTIFICATE REQUEST
// ========================================

export async function createCertificateRequest(
  input: CreateCertificateRequestInput
): Promise<CertificateRequest> {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
      .insert({
        resident_id:
          input.resident_id,

        certificate_type_id:
          input.certificate_type_id,

        purpose:
          input.purpose.trim(),

        business_name:
          cleanOptional(
            input.business_name
          ),

        business_address:
          cleanOptional(
            input.business_address
          ),

        status:
          "pending",

        payment_status:
          input.payment_status,

        amount:
          input.amount,

        payment_reference:
          cleanOptional(
            input.payment_reference
          ),

        notes:
          cleanOptional(
            input.notes
          ),
      })
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
      .single()

  if (error) {
    console.error(
      "Create certificate request error:",
      error
    )

    throw error
  }

  return data as CertificateRequest
}

// ========================================
// APPROVE CERTIFICATE REQUEST
// ========================================

export async function approveCertificateRequest(
  input: ApproveCertificateRequestInput
): Promise<void> {
  const userId =
    await getCurrentUserId()

  const {
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
      .update({
        status:
          "approved",

        reviewed_by:
          userId,

        reviewed_at:
          new Date().toISOString(),

        rejection_reason:
          null,

        payment_status:
          input.payment_status,

        amount:
          input.amount,

        payment_reference:
          cleanOptional(
            input.payment_reference
          ),

        notes:
          cleanOptional(
            input.notes
          ),
      })
      .eq(
        "id",
        input.id
      )
      .eq(
        "status",
        "pending"
      )

  if (error) {
    console.error(
      "Approve certificate request error:",
      error
    )

    throw error
  }
}

// ========================================
// REJECT CERTIFICATE REQUEST
// ========================================

export async function rejectCertificateRequest(
  input: RejectCertificateRequestInput
): Promise<void> {
  const userId =
    await getCurrentUserId()

  const {
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
      .update({
        status:
          "rejected",

        reviewed_by:
          userId,

        reviewed_at:
          new Date().toISOString(),

        rejection_reason:
          input.rejection_reason.trim(),

        notes:
          cleanOptional(
            input.notes
          ),
      })
      .eq(
        "id",
        input.id
      )
      .eq(
        "status",
        "pending"
      )

  if (error) {
    console.error(
      "Reject certificate request error:",
      error
    )

    throw error
  }
}

// ========================================
// CANCEL CERTIFICATE REQUEST
// ========================================

export async function cancelCertificateRequest(
  id: string
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
      .update({
        status:
          "cancelled",
      })
      .eq(
        "id",
        id
      )
      .in(
        "status",
        [
          "pending",
          "approved",
        ]
      )

  if (error) {
    console.error(
      "Cancel certificate request error:",
      error
    )

    throw error
  }
}

// ========================================
// UPDATE CERTIFICATE PAYMENT
// ========================================

export async function updateCertificatePayment(
  input: UpdateCertificatePaymentInput
): Promise<void> {
  const {
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
      .update({
        payment_status:
          input.payment_status,

        amount:
          input.amount,

        payment_reference:
          cleanOptional(
            input.payment_reference
          ),
      })
      .eq(
        "id",
        input.id
      )

  if (error) {
    console.error(
      "Update certificate payment error:",
      error
    )

    throw error
  }
}

// ========================================
// ISSUE CERTIFICATE
// ========================================
//
// IMPORTANT:
//
// certificate_number is NOT sent from
// React.
//
// PostgreSQL automatically generates:
//
// CERT-2026-000001
// CERT-2026-000002
//
// when status changes to "issued".
// ========================================

export async function issueCertificate(
  input: IssueCertificateInput
): Promise<void> {
  const userId =
    await getCurrentUserId()

  const {
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
      .update({
        status:
          "issued",

        issued_by:
          userId,

        issued_at:
          new Date().toISOString(),

        notes:
          cleanOptional(
            input.notes
          ),
      })
      .eq(
        "id",
        input.id
      )
      .eq(
        "status",
        "approved"
      )

  if (error) {
    console.error(
      "Issue certificate error:",
      error
    )

    throw error
  }
}

// ========================================
// PENDING REQUEST COUNT
// ========================================

export async function getPendingCertificateRequestCount(): Promise<
  number
> {
  const {
    count,
    error,
  } =
    await supabase
      .from(
        "certificate_requests"
      )
      .select(
        "*",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .is(
        "deleted_at",
        null
      )
      .eq(
        "status",
        "pending"
      )

  if (error) {
    console.error(
      "Pending certificate request count error:",
      error
    )

    throw error
  }

  return count ?? 0
}