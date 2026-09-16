import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  addCommitteeMember,
  createCommittee,
  getCommittees,
  removeCommitteeMember,
  setCommitteeStatus,
  updateCommittee,
  updateCommitteeMember,
} from "@/features/committees/services/committees.service"

import type {
  CommitteeFormInput,
  CommitteeMemberInput,
} from "@/features/committees/types"

export function useCommittees() {
  return useQuery({
    queryKey: [
      "committees",
    ],

    queryFn:
      getCommittees,
  })
}

export function useCreateCommittee() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: CommitteeFormInput
    ) =>
      createCommittee(
        input
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "committees",
        ],
      })
    },
  })
}

export function useUpdateCommittee() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: CommitteeFormInput
    }) =>
      updateCommittee(
        id,
        input
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "committees",
        ],
      })
    },
  })
}

export function useSetCommitteeStatus() {
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
      setCommitteeStatus(
        id,
        isActive
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "committees",
        ],
      })
    },
  })
}

export function useAddCommitteeMember() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      input: CommitteeMemberInput
    ) =>
      addCommitteeMember(
        input
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "committees",
        ],
      })
    },
  })
}

export function useUpdateCommitteeMember() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      memberRole,
    }: {
      id: string
      memberRole: string
    }) =>
      updateCommitteeMember(
        id,
        memberRole
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "committees",
        ],
      })
    },
  })
}

export function useRemoveCommitteeMember() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      removeCommitteeMember(
        id
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          "committees",
        ],
      })
    },
  })
}