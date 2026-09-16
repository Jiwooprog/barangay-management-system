import {
  useMemo,
  useState,
} from "react"

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileClock,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  useActivityLogs,
} from "./hooks/use-activity-logs"

import type {
  ActivityAction,
} from "./types"

// ========================================
// CONSTANTS
// ========================================

const PAGE_SIZE =
  20

const MODULES = [
  "ALL",
  "Residents",
  "Households",
  "Puroks",
  "Officials & SK",
  "Committees",
  "Announcements",
  "Certificates",
  "Blotter",
  "User Management",
  "Settings",
] as const

const ACTIONS = [
  "ALL",
  "CREATE",
  "UPDATE",
  "DELETE",
] as const

// ========================================
// HELPERS
// ========================================

function formatDateTime(
  value: string
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",

      second:
        "2-digit",
    }
  ).format(date)
}

function getActionClass(
  action:
    ActivityAction
) {
  switch (action) {
    case "CREATE":
      return (
        "border-emerald-200 " +
        "bg-emerald-50 " +
        "text-emerald-700 " +
        "dark:border-emerald-900 " +
        "dark:bg-emerald-950/40 " +
        "dark:text-emerald-300"
      )

    case "UPDATE":
      return (
        "border-blue-200 " +
        "bg-blue-50 " +
        "text-blue-700 " +
        "dark:border-blue-900 " +
        "dark:bg-blue-950/40 " +
        "dark:text-blue-300"
      )

    case "DELETE":
      return (
        "border-red-200 " +
        "bg-red-50 " +
        "text-red-700 " +
        "dark:border-red-900 " +
        "dark:bg-red-950/40 " +
        "dark:text-red-300"
      )
  }
}

function formatFieldName(
  value: string
) {
  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    )
}

// ========================================
// PAGE
// ========================================

export function ActivityLogsPage() {
  const [
    search,
    setSearch,
  ] =
    useState("")

  const [
    module,
    setModule,
  ] =
    useState(
      "ALL"
    )

  const [
    action,
    setAction,
  ] =
    useState<
      "ALL" |
      ActivityAction
    >(
      "ALL"
    )

  const [
    page,
    setPage,
  ] =
    useState(1)

  const filters =
    useMemo(
      () => ({
        search,
        module,
        action,
        page,
        pageSize:
          PAGE_SIZE,
      }),
      [
        search,
        module,
        action,
        page,
      ]
    )

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } =
    useActivityLogs(
      filters
    )

  const logs =
    data?.data ??
    []

  const total =
    data?.count ??
    0

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total /
          PAGE_SIZE
      )
    )

  const startRecord =
    total === 0
      ? 0
      : (
          page -
          1
        ) *
          PAGE_SIZE +
        1

  const endRecord =
    Math.min(
      page *
        PAGE_SIZE,
      total
    )

  function resetToFirstPage() {
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* =================================
          HEADER
      ================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileClock className="h-6 w-6 text-muted-foreground" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Activity Logs
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Review important actions and changes made throughout the system.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={
            isFetching
          }
          onClick={() =>
            void refetch()
          }
        >
          {isFetching ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}

          Refresh
        </Button>
      </div>

      {/* =================================
          NOTICE
      ================================= */}

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex gap-3">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

          <div>
            <p className="text-sm font-medium">
              Audit Trail
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Activity logs are created automatically by the database and cannot be edited or deleted through the application.
            </p>
          </div>
        </div>
      </div>

      {/* =================================
          FILTERS
      ================================= */}

      <div className="rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
          {/* SEARCH */}

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={
                search
              }
              onChange={(
                event
              ) => {
                setSearch(
                  event
                    .target
                    .value
                )

                resetToFirstPage()
              }}
              placeholder="Search user, record, module, or action..."
              className="pl-9"
            />
          </div>

          {/* MODULE */}

          <select
            value={
              module
            }
            onChange={(
              event
            ) => {
              setModule(
                event
                  .target
                  .value
              )

              resetToFirstPage()
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring"
          >
            {MODULES.map(
              (
                item
              ) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item ===
                  "ALL"
                    ? "All Modules"
                    : item}
                </option>
              )
            )}
          </select>

          {/* ACTION */}

          <select
            value={
              action
            }
            onChange={(
              event
            ) => {
              setAction(
                event
                  .target
                  .value as
                  | "ALL"
                  | ActivityAction
              )

              resetToFirstPage()
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring"
          >
            {ACTIONS.map(
              (
                item
              ) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item ===
                  "ALL"
                    ? "All Actions"
                    : item}
                </option>
              )
            )}
          </select>
        </div>

        {/* =================================
            TABLE
        ================================= */}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Date & Time
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  User
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Action
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Module
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Record
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Activity
                </th>

                <th className="px-4 py-3 font-medium text-muted-foreground">
                  Changed Fields
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={
                      7
                    }
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Loading activity logs...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={
                      7
                    }
                    className="px-4 py-16 text-center"
                  >
                    <p className="font-medium text-destructive">
                      Unable to load activity logs.
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {error instanceof
                      Error
                        ? error.message
                        : "An unexpected error occurred."}
                    </p>
                  </td>
                </tr>
              ) : logs.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={
                      7
                    }
                    className="px-4 py-16 text-center"
                  >
                    <FileClock className="mx-auto h-8 w-8 text-muted-foreground/50" />

                    <p className="mt-3 font-medium">
                      No activity found
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing the search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map(
                  (
                    log
                  ) => {
                    const visibleChangedFields =
                      log.changed_fields.filter(
                        (
                          field
                        ) =>
                          field !==
                          "updated_at"
                      )

                    return (
                      <tr
                        key={
                          log.id
                        }
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        {/* DATE */}

                        <td className="whitespace-nowrap px-4 py-3 align-top text-muted-foreground">
                          {formatDateTime(
                            log.created_at
                          )}
                        </td>

                        {/* USER */}

                        <td className="px-4 py-3 align-top">
                          {log.actor_email ? (
                            <div>
                              <p className="max-w-[220px] truncate font-medium">
                                {
                                  log.actor_email
                                }
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Authenticated user
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">
                                System
                              </p>

                              <p className="text-xs text-muted-foreground">
                                Database / administrative action
                              </p>
                            </div>
                          )}
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-3 align-top">
                          <span
                            className={[
                              "inline-flex rounded-md border px-2 py-1 text-xs font-medium",
                              getActionClass(
                                log.action
                              ),
                            ].join(
                              " "
                            )}
                          >
                            {
                              log.action
                            }
                          </span>
                        </td>

                        {/* MODULE */}

                        <td className="px-4 py-3 align-top">
                          <p className="font-medium">
                            {
                              log.module
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              log.entity_type
                            }
                          </p>
                        </td>

                        {/* RECORD */}

                        <td className="px-4 py-3 align-top">
                          {log.entity_label ? (
                            <span className="font-mono text-xs">
                              {
                                log.entity_label
                              }
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-[320px] px-4 py-3 align-top">
                          {
                            log.description
                          }
                        </td>

                        {/* CHANGED FIELDS */}

                        <td className="max-w-[300px] px-4 py-3 align-top">
                          {log.action !==
                          "UPDATE" ? (
                            <span className="text-muted-foreground">
                              —
                            </span>
                          ) : visibleChangedFields.length ===
                            0 ? (
                            <span className="text-muted-foreground">
                              Record updated
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {visibleChangedFields.map(
                                (
                                  field
                                ) => (
                                  <span
                                    key={
                                      field
                                    }
                                    className="rounded-md border bg-muted/50 px-2 py-0.5 text-xs"
                                  >
                                    {formatFieldName(
                                      field
                                    )}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* =================================
            PAGINATION
        ================================= */}

        <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {
                startRecord
              }
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {
                endRecord
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {
                total
              }
            </span>{" "}
            activities
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page <= 1 ||
                isFetching
              }
              onClick={() =>
                setPage(
                  (
                    current
                  ) =>
                    Math.max(
                      1,
                      current -
                        1
                    )
                )
              }
            >
              <ChevronLeft className="mr-1 h-4 w-4" />

              Previous
            </Button>

            <span className="px-2 text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium text-foreground">
                {
                  page
                }
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {
                  totalPages
                }
              </span>
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                page >=
                  totalPages ||
                isFetching
              }
              onClick={() =>
                setPage(
                  (
                    current
                  ) =>
                    Math.min(
                      totalPages,
                      current +
                        1
                    )
                )
              }
            >
              Next

              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}