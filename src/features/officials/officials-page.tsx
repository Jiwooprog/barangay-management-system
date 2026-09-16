import {
  useMemo,
  useState,
} from "react"

import {
  Edit,
  Plus,
  Search,
  ShieldCheck,
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

import { OfficialAvatar } from "@/features/officials/components/official-avatar"
import { OfficialFormDialog } from "@/features/officials/components/official-form-dialog"

import {
  useOfficials,
  useSetOfficialStatus,
} from "@/features/officials/hooks/use-officials"

import type {
  Official,
  OfficialType,
} from "@/features/officials/types"

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

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  )
}

export function OfficialsPage() {
  const {
    data: officials = [],
    isLoading,
    error,
  } = useOfficials()

  const statusMutation =
    useSetOfficialStatus()

  const [
    activeType,
    setActiveType,
  ] =
    useState<OfficialType>(
      "barangay"
    )

  const [
    search,
    setSearch,
  ] = useState("")

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false)

  const [
    selectedOfficial,
    setSelectedOfficial,
  ] =
    useState<Official | null>(
      null
    )

  const filteredOfficials =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase()

      return officials.filter(
        (official) => {
          if (
            official.official_type !==
            activeType
          ) {
            return false
          }

          if (!searchValue) {
            return true
          }

          const name =
            getOfficialName(
              official
            ).toLowerCase()

          const position =
            official.position.toLowerCase()

          const residentNumber =
            official.residents
              ?.resident_number
              ?.toLowerCase() ??
            ""

          return (
            name.includes(
              searchValue
            ) ||
            position.includes(
              searchValue
            ) ||
            residentNumber.includes(
              searchValue
            )
          )
        }
      )
    }, [
      officials,
      activeType,
      search,
    ])

  const barangayCount =
    officials.filter(
      (official) =>
        official.official_type ===
        "barangay"
    ).length

  const skCount =
    officials.filter(
      (official) =>
        official.official_type ===
        "sk"
    ).length

  const handleAdd = () => {
    setSelectedOfficial(
      null
    )

    setDialogOpen(
      true
    )
  }

  const handleEdit = (
    official: Official
  ) => {
    setSelectedOfficial(
      official
    )

    setDialogOpen(
      true
    )
  }

  const handleStatusChange =
    async (
      official: Official
    ) => {
      try {
        await statusMutation.mutateAsync(
          {
            id: official.id,
            isActive:
              !official.is_active,
          }
        )
      } catch (error) {
        console.error(
          "Unable to update official status:",
          error
        )
      }
    }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />

            <h1 className="text-2xl font-bold tracking-tight">
              Officials Management
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage Barangay and
            Sangguniang Kabataan
            officials.
          </p>
        </div>

        <Button
          onClick={
            handleAdd
          }
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Official
        </Button>
      </div>

      {/* TYPE TABS */}

      <div className="flex flex-wrap gap-2 border-b pb-3">
        <Button
          type="button"
          variant={
            activeType ===
            "barangay"
              ? "default"
              : "outline"
          }
          onClick={() =>
            setActiveType(
              "barangay"
            )
          }
        >
          Barangay Officials
          <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {barangayCount}
          </span>
        </Button>

        <Button
          type="button"
          variant={
            activeType ===
            "sk"
              ? "default"
              : "outline"
          }
          onClick={() =>
            setActiveType(
              "sk"
            )
          }
        >
          SK Officials
          <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">
            {skCount}
          </span>
        </Button>
      </div>

      {/* SEARCH */}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder="Search officials..."
          value={
            search
          }
          onChange={(
            event
          ) =>
            setSearch(
              event.target
                .value
            )
          }
          className="pl-9"
        />
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load
          officials.
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Photo
                </TableHead>

                <TableHead>
                  Name
                </TableHead>

                <TableHead>
                  Position
                </TableHead>

                <TableHead>
                  Term
                </TableHead>

                <TableHead>
                  Current
                </TableHead>

                <TableHead>
                  Order
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
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading
                    officials...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                filteredOfficials.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={
                        8
                      }
                      className="h-24 text-center text-muted-foreground"
                    >
                      No{" "}
                      {activeType ===
                      "barangay"
                        ? "Barangay"
                        : "SK"}{" "}
                      officials
                      found.
                    </TableCell>
                  </TableRow>
                )}

              {!isLoading &&
                filteredOfficials.map(
                  (
                    official
                  ) => (
                    <TableRow
                      key={
                        official.id
                      }
                    >
                      <TableCell>
                        <OfficialAvatar
                          resident={
                            official.residents
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getOfficialName(
                              official
                            )}
                          </div>

                          {official
                            .residents
                            ?.resident_number && (
                            <div className="text-xs text-muted-foreground">
                              {
                                official
                                  .residents
                                  .resident_number
                              }
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {
                          official.position
                        }
                      </TableCell>

                      <TableCell>
                        <div className="whitespace-nowrap text-sm">
                          {formatDate(
                            official.term_start
                          )}
                        </div>

                        <div className="whitespace-nowrap text-xs text-muted-foreground">
                          to{" "}
                          {formatDate(
                            official.term_end
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {official.is_current
                          ? "Yes"
                          : "No"}
                      </TableCell>

                      <TableCell>
                        {
                          official.display_order
                        }
                      </TableCell>

                      <TableCell>
                        <span
                          className={
                            official.is_active
                              ? "font-medium text-green-700"
                              : "font-medium text-muted-foreground"
                          }
                        >
                          {official.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleEdit(
                                official
                              )
                            }
                          >
                            <Edit className="mr-1 h-3.5 w-3.5" />

                            Edit
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              statusMutation.isPending
                            }
                            onClick={() =>
                              void handleStatusChange(
                                official
                              )
                            }
                          >
                            {official.is_active
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

      <p className="text-sm text-muted-foreground">
        {
          filteredOfficials.length
        }{" "}
        {filteredOfficials.length ===
        1
          ? "official"
          : "officials"}
      </p>

      {/* DIALOG */}

      <OfficialFormDialog
        open={
          dialogOpen
        }
        onOpenChange={(
          newOpen
        ) => {
          setDialogOpen(
            newOpen
          )

          if (!newOpen) {
            setSelectedOfficial(
              null
            )
          }
        }}
        official={
          selectedOfficial
        }
        defaultType={
          activeType
        }
      />
    </div>
  )
}