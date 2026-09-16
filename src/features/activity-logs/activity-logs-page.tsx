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
  SlidersHorizontal,
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
        "text-emerald-700"
      )

    case "UPDATE":
      return (
        "border-blue-200 " +
        "bg-blue-50 " +
        "text-blue-700"
      )

    case "DELETE":
      return (
        "border-red-200 " +
        "bg-red-50 " +
        "text-red-700"
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <FileClock className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Activity Logs
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review important actions and changes made throughout the system.
            </p>
          </div>
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
          className="h-10 rounded-xl border-slate-200 bg-white"
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

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Clock className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-800">
              Audit Trail
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Activity logs are created automatically by the database and cannot be edited or deleted through the application.
            </p>
          </div>
        </div>
      </div>

      {/* =================================
          FILTERS
      ================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
            Search & Filters
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* SEARCH */}

          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
              className="h-10 rounded-xl border-slate-200 bg-white pl-9"
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
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
        </div>

        {/* =================================
            TABLE
        ================================= */}

        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950">
              System Activity
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {total}{" "}
              {total === 1
                ? "activity"
                : "activities"}{" "}
              found
            </p>
          </div>

          {isFetching &&
            !isLoading && (
              <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Updating...
              </span>
            )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date & Time
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Module
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Record
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Activity
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                    <div className="flex items-center justify-center gap-2 text-slate-500">
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
                    <p className="font-medium text-red-700">
                      Unable to load activity logs.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
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
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <FileClock className="h-5 w-5" />
                    </div>

                    <p className="mt-3 font-medium text-slate-800">
                      No activity found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
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
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                      >
                        {/* DATE */}

                        <td className="whitespace-nowrap px-4 py-3 align-top text-slate-500">
                          {formatDateTime(
                            log.created_at
                          )}
                        </td>

                        {/* USER */}

                        <td className="px-4 py-3 align-top">
                          {log.actor_email ? (
                            <div>
                              <p className="max-w-[220px] truncate font-medium text-slate-950">
                                {
                                  log.actor_email
                                }
                              </p>

                              <p className="text-xs text-slate-500">
                                Authenticated user
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium text-slate-950">
                                System
                              </p>

                              <p className="text-xs text-slate-500">
                                Database / administrative action
                              </p>
                            </div>
                          )}
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-3 align-top">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
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
                          <p className="font-medium text-slate-950">
                            {
                              log.module
                            }
                          </p>

                          <p className="text-xs text-slate-500">
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
                            <span className="text-slate-400">
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
                            <span className="text-slate-500">
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
                                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
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

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-800">
              {
                startRecord
              }
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-800">
              {
                endRecord
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-800">
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
              className="rounded-lg border-slate-200 bg-white"
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

            <span className="min-w-[92px] text-center text-sm text-slate-500">
              Page{" "}
              <span className="font-medium text-slate-800">
                {
                  page
                }
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-800">
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
              className="rounded-lg border-slate-200 bg-white"
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
      </section>
    </div>
  )
}