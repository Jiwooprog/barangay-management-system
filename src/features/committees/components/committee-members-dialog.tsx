import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"

import {
  Save,
  Trash2,
  UserPlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  useAddCommitteeMember,
  useRemoveCommitteeMember,
  useUpdateCommitteeMember,
} from "@/features/committees/hooks/use-committees"

import type {
  Committee,
  CommitteeMember,
} from "@/features/committees/types"

import { useOfficials } from "@/features/officials/hooks/use-officials"
import type { Official } from "@/features/officials/types"

interface CommitteeMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  committee: Committee | null
}

function getOfficialName(
  official: Official
) {
  const resident =
    official.residents

  if (!resident) {
    return "No resident linked"
  }

  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

function getMemberName(
  member: CommitteeMember
) {
  const resident =
    member.officials?.residents

  if (!resident) {
    return "No resident linked"
  }

  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

export function CommitteeMembersDialog({
  open,
  onOpenChange,
  committee,
}: CommitteeMembersDialogProps) {
  const {
    data: officials = [],
    isLoading: officialsLoading,
  } = useOfficials()

  const addMutation =
    useAddCommitteeMember()

  const updateMutation =
    useUpdateCommitteeMember()

  const removeMutation =
    useRemoveCommitteeMember()

  const [
    selectedOfficialId,
    setSelectedOfficialId,
  ] = useState("")

  const [
    newMemberRole,
    setNewMemberRole,
  ] = useState("Member")

  const [
    roleValues,
    setRoleValues,
  ] = useState<
    Record<string, string>
  >({})

  const [
    error,
    setError,
  ] = useState("")

  const members =
    useMemo(() => {
      return (
        committee?.committee_members ??
        []
      )
        .filter(
          (member) =>
            !member.deleted_at
        )
        .sort((a, b) => {
          const nameA =
            getMemberName(a)

          const nameB =
            getMemberName(b)

          return nameA.localeCompare(
            nameB
          )
        })
    }, [committee])

  useEffect(() => {
    if (!open) {
      return
    }

    const initialRoles:
      Record<string, string> = {}

    members.forEach(
      (member) => {
        initialRoles[
          member.id
        ] =
          member.member_role ??
          "Member"
      }
    )

    setRoleValues(
      initialRoles
    )

    setSelectedOfficialId("")
    setNewMemberRole("Member")
    setError("")
  }, [
    open,
    members,
  ])

  const existingOfficialIds =
    useMemo(() => {
      return new Set(
        members.map(
          (member) =>
            member.official_id
        )
      )
    }, [members])

  const availableOfficials =
    useMemo(() => {
      if (!committee) {
        return []
      }

      return officials
        .filter(
          (official) => {
            if (
              !official.is_active
            ) {
              return false
            }

            if (
              existingOfficialIds.has(
                official.id
              )
            ) {
              return false
            }

            // Chairperson is already
            // represented separately.
            if (
              official.id ===
              committee.chairperson_official_id
            ) {
              return false
            }

            return true
          }
        )
        .sort((a, b) => {
          const nameA =
            getOfficialName(a)

          const nameB =
            getOfficialName(b)

          return nameA.localeCompare(
            nameB
          )
        })
    }, [
      officials,
      committee,
      existingOfficialIds,
    ])

  const handleAddMember = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!committee) {
      return
    }

    if (
      !selectedOfficialId
    ) {
      setError(
        "Please select an official."
      )

      return
    }

    try {
      setError("")

      await addMutation.mutateAsync({
        committee_id:
          committee.id,

        official_id:
          selectedOfficialId,

        member_role:
          newMemberRole.trim() ||
          "Member",
      })

      setSelectedOfficialId("")
      setNewMemberRole("Member")
    } catch (addError) {
      console.error(
        "Unable to add committee member:",
        addError
      )

      if (
        typeof addError ===
          "object" &&
        addError !== null &&
        "message" in addError
      ) {
        setError(
          String(
            addError.message
          )
        )
      } else {
        setError(
          "Unable to add committee member."
        )
      }
    }
  }

  const handleSaveRole =
    async (
      member: CommitteeMember
    ) => {
      const role =
        roleValues[
          member.id
        ]?.trim()

      if (!role) {
        setError(
          "Member role cannot be empty."
        )

        return
      }

      try {
        setError("")

        await updateMutation.mutateAsync({
          id: member.id,
          memberRole: role,
        })
      } catch (updateError) {
        console.error(
          "Unable to update member role:",
          updateError
        )

        if (
          typeof updateError ===
            "object" &&
          updateError !== null &&
          "message" in updateError
        ) {
          setError(
            String(
              updateError.message
            )
          )
        } else {
          setError(
            "Unable to update member role."
          )
        }
      }
    }

  const handleRemoveMember =
    async (
      member: CommitteeMember
    ) => {
      const memberName =
        getMemberName(
          member
        )

      const confirmed =
        window.confirm(
          `Remove ${memberName} from this committee?`
        )

      if (!confirmed) {
        return
      }

      try {
        setError("")

        await removeMutation.mutateAsync(
          member.id
        )
      } catch (removeError) {
        console.error(
          "Unable to remove committee member:",
          removeError
        )

        if (
          typeof removeError ===
            "object" &&
          removeError !== null &&
          "message" in removeError
        ) {
          setError(
            String(
              removeError.message
            )
          )
        } else {
          setError(
            "Unable to remove committee member."
          )
        }
      }
    }

  const isBusy =
    addMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending

  if (!committee) {
    return null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Manage Members
          </DialogTitle>

          <DialogDescription>
            Add or remove officials
            from{" "}
            <strong>
              {committee.name}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        {/* ADD MEMBER */}

        <form
          onSubmit={
            handleAddMember
          }
          className="space-y-4 rounded-md border p-4"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />

            <h3 className="font-semibold">
              Add Member
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="committee-member-official">
                Official
              </Label>

              <select
                id="committee-member-official"
                value={
                  selectedOfficialId
                }
                onChange={(
                  event
                ) =>
                  setSelectedOfficialId(
                    event.target
                      .value
                  )
                }
                disabled={
                  isBusy ||
                  officialsLoading
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  {officialsLoading
                    ? "Loading officials..."
                    : "Select official"}
                </option>

                {availableOfficials.map(
                  (
                    official
                  ) => (
                    <option
                      key={
                        official.id
                      }
                      value={
                        official.id
                      }
                    >
                      {getOfficialName(
                        official
                      )}{" "}
                      —{" "}
                      {
                        official.position
                      }
                    </option>
                  )
                )}
              </select>

              {!officialsLoading &&
                availableOfficials.length ===
                  0 && (
                  <p className="text-xs text-muted-foreground">
                    No additional
                    active officials
                    are available.
                  </p>
                )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="committee-member-role">
                Member Role
              </Label>

              <Input
                id="committee-member-role"
                list="committee-role-options"
                value={
                  newMemberRole
                }
                onChange={(
                  event
                ) =>
                  setNewMemberRole(
                    event.target
                      .value
                  )
                }
                placeholder="Member"
                disabled={
                  isBusy
                }
              />

              <datalist id="committee-role-options">
                <option value="Vice Chairperson" />
                <option value="Secretary" />
                <option value="Member" />
                <option value="Technical Adviser" />
                <option value="Focal Person" />
              </datalist>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isBusy ||
                !selectedOfficialId
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />

              {addMutation.isPending
                ? "Adding..."
                : "Add Member"}
            </Button>
          </div>
        </form>

        {/* CURRENT MEMBERS */}

        <section className="space-y-3">
          <div>
            <h3 className="font-semibold">
              Current Members
            </h3>

            <p className="text-sm text-muted-foreground">
              {members.length}{" "}
              {members.length ===
              1
                ? "member"
                : "members"}
            </p>
          </div>

          {members.length ===
          0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No committee
              members have been
              assigned yet.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(
                (member) => (
                  <div
                    key={
                      member.id
                    }
                    className="rounded-md border p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {getMemberName(
                            member
                          )}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {member
                            .officials
                            ?.position ??
                            "Unknown position"}
                        </p>

                        <p className="text-xs uppercase text-muted-foreground">
                          {member
                            .officials
                            ?.official_type ===
                          "sk"
                            ? "SK Official"
                            : "Barangay Official"}
                        </p>
                      </div>

                      <div className="flex flex-1 flex-col gap-2 sm:max-w-sm sm:flex-row">
                        <Input
                          value={
                            roleValues[
                              member.id
                            ] ??
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            setRoleValues(
                              (
                                current
                              ) => ({
                                ...current,

                                [member.id]:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                          disabled={
                            isBusy
                          }
                          placeholder="Member role"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            isBusy
                          }
                          onClick={() =>
                            void handleSaveRole(
                              member
                            )
                          }
                        >
                          <Save className="mr-1 h-3.5 w-3.5" />

                          Save
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            isBusy
                          }
                          onClick={() =>
                            void handleRemoveMember(
                              member
                            )
                          }
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />

                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* CHAIRPERSON NOTE */}

        {committee.chairperson && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <span className="font-medium">
              Chairperson:
            </span>{" "}
            {committee.chairperson
              .residents
              ? [
                  committee
                    .chairperson
                    .residents
                    .first_name,

                  committee
                    .chairperson
                    .residents
                    .middle_name,

                  committee
                    .chairperson
                    .residents
                    .last_name,

                  committee
                    .chairperson
                    .residents
                    .suffix,
                ]
                  .filter(Boolean)
                  .join(" ")
              : "No resident linked"}{" "}
            —{" "}
            {
              committee
                .chairperson
                .position
            }
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onOpenChange(
                false
              )
            }
            disabled={
              isBusy
            }
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}