import { supabase } from "@/lib/supabase"

import type {
  Committee,
  CommitteeFormInput,
  CommitteeMember,
  CommitteeMemberInput,
} from "@/features/committees/types"

function cleanOptional(
  value?: string
) {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

export async function getCommittees(): Promise<
  Committee[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("committees")
    .select(`
      *,
      chairperson:officials!committees_chairperson_official_id_fkey (
        id,
        position,
        official_type,
        is_active,
        residents:residents!officials_resident_id_fkey (
          id,
          first_name,
          middle_name,
          last_name,
          suffix,
          photo_url
        )
      ),
      committee_members (
        id,
        committee_id,
        official_id,
        member_role,
        is_active,
        created_at,
        updated_at,
        deleted_at,
        officials:officials!committee_members_official_id_fkey (
          id,
          position,
          official_type,
          is_active,
          residents:residents!officials_resident_id_fkey (
            id,
            first_name,
            middle_name,
            last_name,
            suffix,
            photo_url
          )
        )
      )
    `)
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
      "Committees query error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as Committee[]
}

export async function createCommittee(
  input: CommitteeFormInput
): Promise<Committee> {
  const {
    data,
    error,
  } = await supabase
    .from("committees")
    .insert({
      name:
        input.name.trim(),

      description:
        cleanOptional(
          input.description
        ),

      chairperson_official_id:
        input.chairperson_official_id ||
        null,

      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error(
      "Create committee error:",
      error
    )

    throw error
  }

  return data as Committee
}

export async function updateCommittee(
  id: string,
  input: CommitteeFormInput
): Promise<Committee> {
  const {
    data,
    error,
  } = await supabase
    .from("committees")
    .update({
      name:
        input.name.trim(),

      description:
        cleanOptional(
          input.description
        ),

      chairperson_official_id:
        input.chairperson_official_id ||
        null,
    })
    .eq(
      "id",
      id
    )
    .select()
    .single()

  if (error) {
    console.error(
      "Update committee error:",
      error
    )

    throw error
  }

  return data as Committee
}

export async function setCommitteeStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("committees")
    .update({
      is_active: isActive,
    })
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Committee status error:",
      error
    )

    throw error
  }
}

export async function addCommitteeMember(
  input: CommitteeMemberInput
): Promise<CommitteeMember> {
  const {
    data,
    error,
  } = await supabase
    .from("committee_members")
    .insert({
      committee_id:
        input.committee_id,

      official_id:
        input.official_id,

      member_role:
        cleanOptional(
          input.member_role
        ),

      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error(
      "Add committee member error:",
      error
    )

    throw error
  }

  return data as CommitteeMember
}

export async function updateCommitteeMember(
  id: string,
  memberRole: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("committee_members")
    .update({
      member_role:
        cleanOptional(
          memberRole
        ),
    })
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Update committee member error:",
      error
    )

    throw error
  }
}

export async function removeCommitteeMember(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("committee_members")
    .delete()
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Remove committee member error:",
      error
    )

    throw error
  }
}