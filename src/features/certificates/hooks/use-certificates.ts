import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  approveCertificateRequest,
  cancelCertificateRequest,
  createCertificateRequest,
  getCertificateRequestSummary,
  getCertificateRequests,
  getCertificateTypes,
  getPaginatedCertificateRequests,
  getPendingCertificateRequestCount,
  issueCertificate,
  rejectCertificateRequest,
  updateCertificatePayment,
} from "@/features/certificates/services/certificates.service"

import type {
  CertificateRequestListFilters,
} from "@/features/certificates/services/certificates.service"

import type {
  ApproveCertificateRequestInput,
  CreateCertificateRequestInput,
  IssueCertificateInput,
  RejectCertificateRequestInput,
  UpdateCertificatePaymentInput,
} from "@/features/certificates/types"

// ========================================
// QUERY KEYS
// ========================================

export const certificateKeys = {
  all: [
    "certificates",
  ] as const,

  types: [
    "certificates",
    "types",
  ] as const,

  requests: [
    "certificates",
    "requests",
  ] as const,

  requestList: (
    filters:
      CertificateRequestListFilters
  ) =>
    [
      "certificates",
      "requests",
      "list",
      filters,
    ] as const,

  pendingCount: [
    "certificates",
    "pending-count",
  ] as const,

  summary: [
    "certificates",
    "summary",
  ] as const,
}

// ========================================
// CERTIFICATE TYPES
// ========================================

export function useCertificateTypes() {
  return useQuery({
    queryKey:
      certificateKeys.types,

    queryFn:
      getCertificateTypes,
  })
}

// ========================================
// ORIGINAL CERTIFICATE REQUESTS
// ========================================

export function useCertificateRequests() {
  return useQuery({
    queryKey:
      certificateKeys.requests,

    queryFn:
      getCertificateRequests,
  })
}

// ========================================
// PAGINATED CERTIFICATE REQUESTS
// ========================================

export function usePaginatedCertificateRequests(
  filters:
    CertificateRequestListFilters
) {
  return useQuery({
    queryKey:
      certificateKeys.requestList(
        filters
      ),

    queryFn: () =>
      getPaginatedCertificateRequests(
        filters
      ),
  })
}

// ========================================
// SUMMARY
// ========================================

export function useCertificateRequestSummary() {
  return useQuery({
    queryKey:
      certificateKeys.summary,

    queryFn:
      getCertificateRequestSummary,
  })
}

// ========================================
// PENDING REQUEST COUNT
// ========================================

export function usePendingCertificateRequestCount() {
  return useQuery({
    queryKey:
      certificateKeys.pendingCount,

    queryFn:
      getPendingCertificateRequestCount,
  })
}

// ========================================
// INVALIDATE HELPERS
// ========================================

async function invalidateCertificateData(
  queryClient:
    ReturnType<
      typeof useQueryClient
    >
) {
  await Promise.all([
    queryClient
      .invalidateQueries({
        queryKey:
          certificateKeys.requests,
      }),

    queryClient
      .invalidateQueries({
        queryKey:
          certificateKeys.summary,
      }),

    queryClient
      .invalidateQueries({
        queryKey:
          certificateKeys.pendingCount,
      }),

    queryClient
      .invalidateQueries({
        queryKey: [
          "dashboard-stats",
        ],
      }),
  ])
}

// ========================================
// CREATE REQUEST
// ========================================

export function useCreateCertificateRequest() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        CreateCertificateRequestInput
    ) =>
      createCertificateRequest(
        input
      ),

    onSuccess: async () => {
      await invalidateCertificateData(
        queryClient
      )
    },
  })
}

// ========================================
// APPROVE
// ========================================

export function useApproveCertificateRequest() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        ApproveCertificateRequestInput
    ) =>
      approveCertificateRequest(
        input
      ),

    onSuccess: async () => {
      await invalidateCertificateData(
        queryClient
      )
    },
  })
}

// ========================================
// REJECT
// ========================================

export function useRejectCertificateRequest() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        RejectCertificateRequestInput
    ) =>
      rejectCertificateRequest(
        input
      ),

    onSuccess: async () => {
      await invalidateCertificateData(
        queryClient
      )
    },
  })
}

// ========================================
// CANCEL
// ========================================

export function useCancelCertificateRequest() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      cancelCertificateRequest(
        id
      ),

    onSuccess: async () => {
      await invalidateCertificateData(
        queryClient
      )
    },
  })
}

// ========================================
// PAYMENT
// ========================================

export function useUpdateCertificatePayment() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        UpdateCertificatePaymentInput
    ) =>
      updateCertificatePayment(
        input
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            certificateKeys.requests,
        })
    },
  })
}

// ========================================
// ISSUE
// ========================================

export function useIssueCertificate() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        IssueCertificateInput
    ) =>
      issueCertificate(
        input
      ),

    onSuccess: async () => {
      await invalidateCertificateData(
        queryClient
      )
    },
  })
}