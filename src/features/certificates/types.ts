export type CertificateRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "issued"
  | "cancelled"

export type CertificatePaymentStatus =
  | "unpaid"
  | "paid"
  | "waived"

export interface CertificateType {
  id: string

  code: string
  name: string
  description: string | null

  fee: number

  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CertificateResident {
  id: string

  resident_number: string

  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null

  birthday: string
  gender: "male" | "female"

  contact_number: string | null

  house_number: string | null
  street: string | null

  purok_id: string
  household_id: string | null

  residency_status:
    | "active"
    | "transferred"
    | "deceased"

  is_active: boolean

  puroks?:
    | {
        id: string
        name: string
        code: string | null
      }
    | null
}

export interface CertificateRequest {
  id: string

  request_number: string

  resident_id: string
  certificate_type_id: string

  purpose: string

  business_name: string | null
  business_address: string | null

  status: CertificateRequestStatus

  payment_status:
    CertificatePaymentStatus

  amount: number

  payment_reference: string | null

  reviewed_by: string | null
  reviewed_at: string | null

  rejection_reason: string | null

  certificate_number: string | null

  verification_token: string

  issued_by: string | null
  issued_at: string | null

  requested_at: string

  notes: string | null

  created_at: string
  updated_at: string
  deleted_at: string | null

  residents?:
    | CertificateResident
    | null

  certificate_types?:
    | CertificateType
    | null
}

export interface CreateCertificateRequestInput {
  resident_id: string

  certificate_type_id: string

  purpose: string

  business_name?: string
  business_address?: string

  payment_status:
    CertificatePaymentStatus

  amount: number

  payment_reference?: string

  notes?: string
}

export interface ApproveCertificateRequestInput {
  id: string

  payment_status:
    CertificatePaymentStatus

  amount: number

  payment_reference?: string

  notes?: string
}

export interface RejectCertificateRequestInput {
  id: string

  rejection_reason: string
  notes?: string
}

export interface IssueCertificateInput {
  id: string
  notes?: string
}

export interface UpdateCertificatePaymentInput {
  id: string

  payment_status:
    CertificatePaymentStatus

  amount: number

  payment_reference?: string
}

export interface CertificateRequestFilters {
  search?: string

  status?:
    | CertificateRequestStatus
    | "all"

  paymentStatus?:
    | CertificatePaymentStatus
    | "all"

  certificateTypeId?: string
}

export interface CertificateVerification {
  is_valid: boolean

  certificate_number: string
  request_number: string

  certificate_type: string
  resident_name: string

  issued_at: string
}