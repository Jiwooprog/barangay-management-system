import {
  useMemo,
  useState,
} from "react"

import {
  Edit,
  Plus,
  Search,
  UserRoundCheck,
  UserRoundCog,
  UserRoundX,
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <UsersRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Committees Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage barangay committees, chairpersons, and members.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAdd}
          className="h-10 rounded-xl bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800"
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Committee
        </Button>
      </div>

      {/* SEARCH */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-slate-700">
          Search Committees
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by committee, chairperson, position, or description..."
            className="h-10 rounded-xl border-slate-200 bg-white pl-9"
          />
        </div>
      </section>

      {/* ERROR */}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          Unable to load committees.
        </div>
      )}

      {/* TABLE */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              Committees
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filteredCommittees.length}{" "}
              {filteredCommittees.length === 1
                ? "committee"
                : "committees"}{" "}
              found
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Committee
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Chairperson
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Members
                </TableHead>

                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </TableHead>

                <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                    className="h-32 text-center text-sm text-slate-500"
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
                      className="h-40 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <UsersRound className="h-5 w-5" />
                        </div>

                        <p className="mt-3 font-medium text-slate-800">
                          No committees found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing your search term or add a new committee.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              {/* ROWS */}

              {!isLoading &&
                filteredCommittees.map(
                  (committee) => (
                    <TableRow
                      key={committee.id}
                      className="border-slate-100 transition-colors hover:bg-slate-50/80"
                    >
                      {/* COMMITTEE */}

                      <TableCell>
                        <div className="max-w-sm">
                          <p className="font-medium text-slate-950">
                            {committee.name}
                          </p>

                          {committee.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
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
                            <p className="font-medium text-slate-950">
                              {getOfficialName(
                                committee.chairperson
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {
                                committee
                                  .chairperson
                                  .position
                              }
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            No chairperson
                          </span>
                        )}
                      </TableCell>

                      {/* MEMBERS */}

                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMembers(
                              committee
                            )
                          }
                          className="rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                          <UserRoundCog className="mr-1.5 h-3.5 w-3.5" />

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
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            committee.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              committee.is_active
                                ? "bg-emerald-500"
                                : "bg-slate-400",
                            ].join(" ")}
                          />

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
                            className="rounded-lg border-slate-200 bg-white"
                          >
                            <Edit className="mr-1.5 h-3.5 w-3.5" />

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
                            className="rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          >
                            <UserRoundCog className="mr-1.5 h-3.5 w-3.5" />

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
                            className={
                              committee.is_active
                                ? "rounded-lg border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                                : "rounded-lg border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            }
                          >
                            {committee.is_active ? (
                              <UserRoundX className="mr-1.5 h-3.5 w-3.5" />
                            ) : (
                              <UserRoundCheck className="mr-1.5 h-3.5 w-3.5" />
                            )}

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

        <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-800">
              {filteredCommittees.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-800">
              {committees.length}
            </span>{" "}
            committees
          </p>
        </div>
      </section>

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