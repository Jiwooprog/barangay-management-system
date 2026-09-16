import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  createAnnouncement,
  getAnnouncements,
  getPaginatedAnnouncements,
  publishAnnouncement,
  setAnnouncementPinned,
  setAnnouncementStatus,
  unpublishAnnouncement,
  updateAnnouncement,
} from "@/features/announcements/services/announcements.service"

import type {
  AnnouncementListFilters,
} from "@/features/announcements/services/announcements.service"

import type {
  AnnouncementFormInput,
} from "@/features/announcements/types"

// ========================================
// QUERY KEYS
// ========================================

export const announcementKeys = {
  all: [
    "announcements",
  ] as const,

  fullList: [
    "announcements",
    "all",
  ] as const,

  list: (
    filters:
      AnnouncementListFilters
  ) =>
    [
      "announcements",
      "list",
      filters,
    ] as const,
}

// ========================================
// ORIGINAL FULL LIST
//
// Kept for compatibility.
// ========================================

export function useAnnouncements() {
  return useQuery({
    queryKey:
      announcementKeys
        .fullList,

    queryFn:
      getAnnouncements,
  })
}

// ========================================
// PAGINATED LIST
// ========================================

export function usePaginatedAnnouncements(
  filters:
    AnnouncementListFilters
) {
  return useQuery({
    queryKey:
      announcementKeys.list(
        filters
      ),

    queryFn: () =>
      getPaginatedAnnouncements(
        filters
      ),
  })
}

// ========================================
// CREATE
// ========================================

export function useCreateAnnouncement() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input:
        AnnouncementFormInput
    ) =>
      createAnnouncement(
        input
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            announcementKeys.all,
        })
    },
  })
}

// ========================================
// UPDATE
// ========================================

export function useUpdateAnnouncement() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input:
        AnnouncementFormInput
    }) =>
      updateAnnouncement(
        id,
        input
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            announcementKeys.all,
        })
    },
  })
}

// ========================================
// ACTIVE STATUS
// ========================================

export function useSetAnnouncementStatus() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string
      isActive: boolean
    }) =>
      setAnnouncementStatus(
        id,
        isActive
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            announcementKeys.all,
        })
    },
  })
}

// ========================================
// PUBLISH
// ========================================

export function usePublishAnnouncement() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      publishAnnouncement(
        id
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            announcementKeys.all,
        })
    },
  })
}

// ========================================
// UNPUBLISH
// ========================================

export function useUnpublishAnnouncement() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      unpublishAnnouncement(
        id
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            announcementKeys.all,
        })
    },
  })
}

// ========================================
// PIN / UNPIN
// ========================================

export function useSetAnnouncementPinned() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      isPinned,
    }: {
      id: string
      isPinned: boolean
    }) =>
      setAnnouncementPinned(
        id,
        isPinned
      ),

    onSuccess: async () => {
      await queryClient
        .invalidateQueries({
          queryKey:
            announcementKeys.all,
        })
    },
  })
}