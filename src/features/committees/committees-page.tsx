import {
  useMemo,
  useState,
} from "react"

import {
  Edit,
  Plus,
  Search,
  UserRoundCog,
  UsersRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { CommitteeFormDialog } from "@/features/committees/components/committee-form-dialog"
import { CommitteeMembersDialog } from "@/features/committees/components/committee-members-dialog"

import {
  useCommittees,
  useSetCommitteeStatus,
} from "@/features/committees/hooks/use-committees"

import type {
  Committee,
  CommitteeOfficial,
} from "@/features/committees/types"

function getOfficialName(
  official:
    | CommitteeOfficial
    | null
    | undefined
) {
  const resident =
    official?.residents

  if (!resident) {
    return "No chairperson"
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

function getMemberCount(
  committee: Committee
) {
  return (
    committee.committee_members?.filter(
      (member) =>
        !member.deleted_at
    ).length ?? 0
  )
}

export function CommitteesPage() {
  const {
    data: committees = [],
    isLoading,
    error,
  } = useCommittees()

  const statusMutation =
    useSetCommitteeStatus()

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    formOpen,
    setFormOpen,
  ] = useState(false)

  const [
    selectedCommittee,
    setSelectedCommittee,
  ] =
    useState<Committee | null>(
      null
    )

  const [
    membersOpen,
    setMembersOpen,
  ] = useState(false)

  const [
    membersCommitteeId,
    setMembersCommitteeId,
  ] =
    useState<string | null>(
      null
    )

  const membersCommittee =
    useMemo(() => {
      if (!membersCommitteeId) {
        return null
      }

      return (
        committees.find(
          (committee) =>
            committee.id ===
            membersCommitteeId
        ) ?? null
      )
    }, [
      committees,
      membersCommitteeId,
    ])

  const filteredCommittees =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase()

      if (!value) {
        return committees
      }

      return committees.filter(
        (committee) => {
          const committeeName =
            committee.name.toLowerCase()

          const description =
            committee.description
              ?.toLowerCase() ??
            ""

          const chairperson =
            getOfficialName(
              committee.chairperson
            ).toLowerCase()

          const position =
            committee.chairperson
              ?.position
              ?.toLowerCase() ??
            ""

          return (
            committeeName.includes(
              value
            ) ||
            description.includes(
              value
            ) ||
            chairperson.includes(
              value
            ) ||
            position.includes(
              value
            )
          )
        }
      )
    }, [
      committees,
      search,
    ])

  const handleAdd = () => {
    setSelectedCommittee(
      null
    )

    setFormOpen(true)
  }

  const handleEdit = (
    committee: Committee
  ) => {
    setSelectedCommittee(
      committee
    )

    setFormOpen(true)
  }

  const handleMembers = (
    committee: Committee
  ) => {
    setMembersCommitteeId(
      committee.id
    )

    setMembersOpen(true)
  }

  const handleStatusChange =
    async (
      committee: Committee
    ) => {
      try {
        await statusMutation.mutateAsync({
          id: committee.id,
          isActive:
            !committee.is_active,
        })
      } catch (statusError) {
        console.error(
          "Unable to update committee status:",
          statusError
        )
      }
    }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5" />

            <h1 className="text-2xl font-bold tracking-tight">
              Committees Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage barangay committees,
            chairpersons, and members.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleAdd}
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Committee
        </Button>
      </div>

      {/* SEARCH */}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search committees..."
          className="pl-9"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load committees.
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Committee
                </TableHead>

                <TableHead>
                  Chairperson
                </TableHead>

                <TableHead>
                  Members
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* LOADING */}

              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading committees...
                  </TableCell>
                </TableRow>
              )}

              {/* EMPTY */}

              {!isLoading &&
                filteredCommittees.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No committees found.
                    </TableCell>
                  </TableRow>
                )}

              {/* ROWS */}

              {!isLoading &&
                filteredCommittees.map(
                  (committee) => (
                    <TableRow
                      key={committee.id}
                    >
                      {/* COMMITTEE */}

                      <TableCell>
                        <div className="max-w-sm">
                          <p className="font-medium">
                            {committee.name}
                          </p>

                          {committee.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {
                                committee.description
                              }
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* CHAIRPERSON */}

                      <TableCell>
                        {committee.chairperson ? (
                          <div>
                            <p className="font-medium">
                              {getOfficialName(
                                committee.chairperson
                              )}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {
                                committee
                                  .chairperson
                                  .position
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No chairperson
                          </span>
                        )}
                      </TableCell>

                      {/* MEMBERS */}

                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleMembers(
                              committee
                            )
                          }
                        >
                          <UserRoundCog className="mr-2 h-4 w-4" />

                          {getMemberCount(
                            committee
                          )}{" "}
                          {getMemberCount(
                            committee
                          ) === 1
                            ? "Member"
                            : "Members"}
                        </Button>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <span
                          className={
                            committee.is_active
                              ? "font-medium text-green-700"
                              : "font-medium text-muted-foreground"
                          }
                        >
                          {committee.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEdit(
                                committee
                              )
                            }
                          >
                            <Edit className="mr-1 h-3.5 w-3.5" />

                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleMembers(
                                committee
                              )
                            }
                          >
                            <UserRoundCog className="mr-1 h-3.5 w-3.5" />

                            Members
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={
                              statusMutation.isPending
                            }
                            onClick={() =>
                              void handleStatusChange(
                                committee
                              )
                            }
                          >
                            {committee.is_active
                              ? "Deactivate"
                              : "Activate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* COUNT */}

      <p className="text-sm text-muted-foreground">
        {filteredCommittees.length}{" "}
        {filteredCommittees.length ===
        1
          ? "committee"
          : "committees"}
      </p>

      {/* ADD / EDIT DIALOG */}

      <CommitteeFormDialog
        open={formOpen}
        onOpenChange={(newOpen) => {
          setFormOpen(newOpen)

          if (!newOpen) {
            setSelectedCommittee(
              null
            )
          }
        }}
        committee={
          selectedCommittee
        }
      />

      {/* MEMBERS DIALOG */}

      <CommitteeMembersDialog
        open={membersOpen}
        onOpenChange={(newOpen) => {
          setMembersOpen(newOpen)

          if (!newOpen) {
            setMembersCommitteeId(
              null
            )
          }
        }}
        committee={
          membersCommittee
        }
      />
    </div>
  )
}