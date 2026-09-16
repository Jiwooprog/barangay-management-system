import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createMyCertificateRequest,
  getMyAnnouncements,
  getMyCertificateRequests,
  getMyResidentProfile,
  getResidentDashboardData,
} from "@/features/resident-portal/services/resident-portal.service"

import type {
  CreateMyCertificateRequestInput,
} from "@/features/resident-portal/services/resident-portal.service"

// ========================================
// QUERY KEYS
// ========================================

export const residentPortalKeys = {
  all: [
    "resident-portal",
  ] as const,

  profile: [
    "resident-portal",
    "profile",
  ] as const,

  certificates: [
    "resident-portal",
    "certificates",
  ] as const,

  announcements: [
    "resident-portal",
    "announcements",
  ] as const,

  dashboard: [
    "resident-portal",
    "dashboard",
  ] as const,
}

// ========================================
// MY PROFILE
// ========================================

export function useMyResidentProfile() {
  return useQuery({
    queryKey:
      residentPortalKeys.profile,

    queryFn:
      getMyResidentProfile,
  })
}

// ========================================
// MY CERTIFICATES
// ========================================

export function useMyCertificateRequests() {
  return useQuery({
    queryKey:
      residentPortalKeys.certificates,

    queryFn:
      getMyCertificateRequests,
  })
}

// ========================================
// MY ANNOUNCEMENTS
// ========================================

export function useMyAnnouncements() {
  return useQuery({
    queryKey:
      residentPortalKeys.announcements,

    queryFn:
      getMyAnnouncements,
  })
}

// ========================================
// RESIDENT DASHBOARD
// ========================================

export function useResidentDashboardData() {
  return useQuery({
    queryKey:
      residentPortalKeys.dashboard,

    queryFn:
      getResidentDashboardData,
  })
}

// ========================================
// CREATE MY CERTIFICATE REQUEST
// ========================================

export function useCreateMyCertificateRequest() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        CreateMyCertificateRequestInput
    ) =>
      createMyCertificateRequest(
        input
      ),

    onSuccess: async () => {
      await Promise.all([
        // Resident certificate list
        queryClient.invalidateQueries({
          queryKey:
            residentPortalKeys.certificates,
        }),

        // Resident dashboard counts
        queryClient.invalidateQueries({
          queryKey:
            residentPortalKeys.dashboard,
        }),

        // Staff certificate management
        queryClient.invalidateQueries({
          queryKey: [
            "certificates",
            "requests",
          ],
        }),

        // Pending certificate count
        queryClient.invalidateQueries({
          queryKey: [
            "certificates",
            "pending-count",
          ],
        }),

        // Admin/staff dashboard
        queryClient.invalidateQueries({
          queryKey: [
            "dashboard-stats",
          ],
        }),
      ])
    },
  })
}