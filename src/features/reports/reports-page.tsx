import { useState } from "react"

import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileDown,
  FileText,
  House,
  MapPinned,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  ShieldAlert,
  Users,
  XCircle,
} from "lucide-react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  useDetailedReports,
  useReportsSummary,
} from "@/features/reports/hooks/use-reports"

import {
  exportReportsExcel,
} from "@/features/reports/utils/export-reports-excel"

import {
  exportReportsPdf,
} from "@/features/reports/utils/export-reports-pdf"

import type {
  ReportFilters,
} from "@/features/reports/types"

// ========================================
// CHART COLORS
// ========================================

const certificateColors = [
  "#f59e0b",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
]

const blotterStatusColors = [
  "#ef4444",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#94a3b8",
  "#475569",
]

// ========================================
// SUMMARY CARD
// ========================================

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: number
  description: string
  icon: React.ComponentType<{
    className?: string
  }>
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ========================================
// SECTION HEADER
// ========================================

function ReportSectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-950">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  )
}

// ========================================
// CHART CARD
// ========================================

function ReportChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="font-semibold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      {children}
    </div>
  )
}

// ========================================
// HELPERS
// ========================================

function formatLabel(
  value: string
) {
  return value
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )
}

function formatDate(
  value: string
) {
  const date =
    value.length === 10
      ? new Date(
          `${value}T00:00:00`
        )
      : new Date(value)

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
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date)
}

function getCertificateStatusClass(
  status: string
) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800"

    case "approved":
      return "bg-blue-100 text-blue-800"

    case "issued":
      return "bg-green-100 text-green-800"

    case "rejected":
      return "bg-red-100 text-red-800"

    default:
      return "bg-muted text-muted-foreground"
  }
}

function getBlotterStatusClass(
  status: string
) {
  switch (status) {
    case "open":
      return "bg-red-100 text-red-800"

    case "under_mediation":
      return "bg-amber-100 text-amber-800"

    case "settled":
      return "bg-green-100 text-green-800"

    case "referred":
      return "bg-blue-100 text-blue-800"

    case "dismissed":
      return "bg-muted text-muted-foreground"

    case "closed":
      return "bg-slate-100 text-slate-800"

    default:
      return "bg-muted text-muted-foreground"
  }
}

function getPriorityClass(
  priority: string
) {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800"

    case "high":
      return "bg-orange-100 text-orange-800"

    case "normal":
      return "bg-blue-100 text-blue-800"

    case "low":
      return "bg-muted text-muted-foreground"

    default:
      return "bg-muted text-muted-foreground"
  }
}

// ========================================
// PAGE
// ========================================

export function ReportsPage() {
  // ========================================
  // SUMMARY QUERY
  // ========================================

  const {
    data,
    isLoading,
    error,
  } =
    useReportsSummary()

  // ========================================
  // DATE FILTER STATE
  // ========================================

  const [
    startDate,
    setStartDate,
  ] = useState("")

  const [
    endDate,
    setEndDate,
  ] = useState("")

  const [
    filterError,
    setFilterError,
  ] = useState("")

  const [
    appliedFilters,
    setAppliedFilters,
  ] =
    useState<ReportFilters>(
      {}
    )

  // ========================================
  // EXPORT STATES
  // ========================================

  const [
    exportingExcel,
    setExportingExcel,
  ] = useState(false)

  const [
    exportingPdf,
    setExportingPdf,
  ] = useState(false)

  // ========================================
  // DETAILED REPORT QUERY
  // ========================================

  const {
    data:
      detailedReports,
    isLoading:
      detailedLoading,
    error:
      detailedError,
  } =
    useDetailedReports(
      appliedFilters
    )

  // ========================================
  // FILTER ACTIONS
  // ========================================

  const handleApplyFilters =
    () => {
      if (
        startDate &&
        endDate &&
        startDate >
          endDate
      ) {
        setFilterError(
          "Start date cannot be later than end date."
        )

        return
      }

      setFilterError("")

      setAppliedFilters({
        startDate:
          startDate ||
          undefined,

        endDate:
          endDate ||
          undefined,
      })
    }

  const handleClearFilters =
    () => {
      setStartDate("")
      setEndDate("")
      setFilterError("")

      setAppliedFilters(
        {}
      )
    }

  // ========================================
  // MAIN LOADING
  // ========================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Reports & Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Loading report statistics...
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 8,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={
                  index
                }
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            )
          )}
        </div>
      </div>
    )
  }

  // ========================================
  // MAIN ERROR
  // ========================================

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <BarChart3 className="h-5 w-5" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Reports & Analytics
          </h2>
        </div>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-medium">
            Unable to load report statistics.
          </p>

          {error instanceof
            Error && (
            <p className="mt-1 text-xs">
              {
                error.message
              }
            </p>
          )}
        </div>
      </div>
    )
  }

  // ========================================
  // SUMMARY DATA
  // ========================================

  const population =
    data?.population

  const certificates =
    data?.certificates

  const blotter =
    data?.blotter

  const resolvedCases =
    (blotter?.settled ??
      0) +
    (blotter?.referred ??
      0) +
    (blotter?.dismissed ??
      0) +
    (blotter?.closed ??
      0)

  // ========================================
  // CHART DATA
  // ========================================

  const certificateChartData = [
    {
      name:
        "Pending",

      value:
        certificates?.pending ??
        0,
    },

    {
      name:
        "Approved",

      value:
        certificates?.approved ??
        0,
    },

    {
      name:
        "Issued",

      value:
        certificates?.issued ??
        0,
    },

    {
      name:
        "Rejected",

      value:
        certificates?.rejected ??
        0,
    },
  ]

  const blotterStatusChartData = [
    {
      name:
        "Open",

      value:
        blotter?.open ??
        0,
    },

    {
      name:
        "Under Mediation",

      value:
        blotter
          ?.under_mediation ??
        0,
    },

    {
      name:
        "Settled",

      value:
        blotter?.settled ??
        0,
    },

    {
      name:
        "Referred",

      value:
        blotter?.referred ??
        0,
    },

    {
      name:
        "Dismissed",

      value:
        blotter?.dismissed ??
        0,
    },

    {
      name:
        "Closed",

      value:
        blotter?.closed ??
        0,
    },
  ]

  const blotterPriorityChartData = [
    {
      name:
        "Low",

      value:
        blotter?.low ??
        0,
    },

    {
      name:
        "Normal",

      value:
        blotter?.normal ??
        0,
    },

    {
      name:
        "High",

      value:
        blotter?.high ??
        0,
    },

    {
      name:
        "Urgent",

      value:
        blotter?.urgent ??
        0,
    },
  ]

  // ========================================
  // DETAILED DATA
  // ========================================

  const certificateRows =
    detailedReports
      ?.certificates ??
    []

  const blotterRows =
    detailedReports
      ?.blotter ??
    []

  // ========================================
  // EXCEL EXPORT
  // ========================================

  const handleExportExcel =
    async () => {
      if (
        !data ||
        !detailedReports
      ) {
        return
      }

      try {
        setExportingExcel(
          true
        )

        await exportReportsExcel({
          summary:
            data,

          certificates:
            certificateRows,

          blotter:
            blotterRows,

          filters:
            appliedFilters,
        })
      } catch (
        exportError
      ) {
        console.error(
          "Excel export error:",
          exportError
        )
      } finally {
        setExportingExcel(
          false
        )
      }
    }

  // ========================================
  // PDF EXPORT
  // ========================================

  const handleExportPdf =
    async () => {
      if (
        !data ||
        !detailedReports
      ) {
        return
      }

      try {
        setExportingPdf(
          true
        )

        await exportReportsPdf({
          summary:
            data,

          certificates:
            certificateRows,

          blotter:
            blotterRows,

          filters:
            appliedFilters,
        })
      } catch (
        exportError
      ) {
        console.error(
          "PDF export error:",
          exportError
        )
      } finally {
        setExportingPdf(
          false
        )
      }
    }

  const hasDateFilter =
    Boolean(
      appliedFilters.startDate ||
        appliedFilters.endDate
    )

  return (
    <div className="space-y-8">
      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <BarChart3 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Reports & Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Barangay population, certificates, and Peace & Order reporting overview.
          </p>
        </div>
      </div>

      {/* ====================================
          POPULATION REPORTS
      ==================================== */}

      <section className="space-y-4">
        <ReportSectionHeader
          title="Population Reports"
          description="Current barangay population and household records."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Residents"
            value={
              population
                ?.residents ??
              0
            }
            description="Active registered residents"
            icon={Users}
          />

          <SummaryCard
            title="Households"
            value={
              population
                ?.households ??
              0
            }
            description="Active registered households"
            icon={House}
          />

          <SummaryCard
            title="Puroks"
            value={
              population
                ?.puroks ??
              0
            }
            description="Active barangay puroks"
            icon={
              MapPinned
            }
          />
        </div>
      </section>

      {/* ====================================
          CERTIFICATE REPORTS
      ==================================== */}

      <section className="space-y-4">
        <ReportSectionHeader
          title="Certificate Reports"
          description="Summary of certificate requests and processing status."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            title="Total Requests"
            value={
              certificates
                ?.total ??
              0
            }
            description="All certificate requests"
            icon={
              FileText
            }
          />

          <SummaryCard
            title="Pending"
            value={
              certificates
                ?.pending ??
              0
            }
            description="Awaiting review"
            icon={
              Clock3
            }
          />

          <SummaryCard
            title="Approved"
            value={
              certificates
                ?.approved ??
              0
            }
            description="Approved requests"
            icon={
              CheckCircle2
            }
          />

          <SummaryCard
            title="Issued"
            value={
              certificates
                ?.issued ??
              0
            }
            description="Certificates issued"
            icon={
              BadgeCheck
            }
          />

          <SummaryCard
            title="Rejected"
            value={
              certificates
                ?.rejected ??
              0
            }
            description="Rejected requests"
            icon={
              XCircle
            }
          />
        </div>

        {/* ====================================
            CERTIFICATE CHART
        ==================================== */}

        <ReportChartCard
          title="Certificate Status Distribution"
          description="Current certificate requests grouped by processing status."
        >
          <div className="h-[320px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    certificateChartData
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={
                    60
                  }
                  outerRadius={
                    95
                  }
                  paddingAngle={
                    3
                  }
                  label={({
                    name,
                    value,
                  }) =>
                    `${name}: ${value}`
                  }
                >
                  {certificateChartData.map(
                    (
                      item,
                      index
                    ) => (
                      <Cell
                        key={
                          item.name
                        }
                        fill={
                          certificateColors[
                            index %
                              certificateColors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ReportChartCard>
      </section>

      {/* ====================================
          PEACE & ORDER REPORTS
      ==================================== */}

      <section className="space-y-4">
        <ReportSectionHeader
          title="Peace & Order Reports"
          description="Blotter cases, mediation, resolution, and priority overview."
        />

        {/* ====================================
            MAIN BLOTTER CARDS
        ==================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Cases"
            value={
              blotter?.total ??
              0
            }
            description="All active blotter cases"
            icon={
              ShieldAlert
            }
          />

          <SummaryCard
            title="Open Cases"
            value={
              blotter?.open ??
              0
            }
            description="Awaiting action"
            icon={
              FileText
            }
          />

          <SummaryCard
            title="Under Mediation"
            value={
              blotter
                ?.under_mediation ??
              0
            }
            description="Cases in mediation"
            icon={
              Scale
            }
          />

          <SummaryCard
            title="Resolved"
            value={
              resolvedCases
            }
            description="Settled, referred, dismissed or closed"
            icon={
              CheckCircle2
            }
          />
        </div>

        {/* ====================================
            CASE STATUS BREAKDOWN
        ==================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h3 className="font-semibold text-slate-950">
              Case Status Breakdown
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Detailed Peace &
              Order case status
              distribution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                Open
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter?.open ??
                  0
                }
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                Under Mediation
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter
                    ?.under_mediation ??
                  0
                }
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                Settled
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter
                    ?.settled ??
                  0
                }
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                Referred
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter
                    ?.referred ??
                  0
                }
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                Dismissed
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter
                    ?.dismissed ??
                  0
                }
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs text-slate-500">
                Closed
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter
                    ?.closed ??
                  0
                }
              </p>
            </div>
          </div>
        </div>

        {/* ====================================
            PRIORITY BREAKDOWN
        ==================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h3 className="font-semibold text-slate-950">
              Priority Breakdown
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Blotter cases grouped
              by recorded priority.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                Low
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter?.low ??
                  0
                }
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                Normal
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter
                    ?.normal ??
                  0
                }
              </p>
            </div>

            <div className="border-b border-slate-200 p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-slate-500">
                High
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter?.high ??
                  0
                }
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs text-slate-500">
                Urgent
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950">
                {
                  blotter
                    ?.urgent ??
                  0
                }
              </p>
            </div>
          </div>
        </div>

        {/* ====================================
            PEACE & ORDER CHARTS
        ==================================== */}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* STATUS CHART */}

          <ReportChartCard
            title="Case Status Distribution"
            description="Blotter cases grouped by current case status."
          >
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={
                      blotterStatusChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={
                      95
                    }
                    label={({
                      name,
                      value,
                    }) =>
                      `${name}: ${value}`
                    }
                  >
                    {blotterStatusChartData.map(
                      (
                        item,
                        index
                      ) => (
                        <Cell
                          key={
                            item.name
                          }
                          fill={
                            blotterStatusColors[
                              index %
                                blotterStatusColors.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ReportChartCard>

          {/* PRIORITY CHART */}

          <ReportChartCard
            title="Case Priority Distribution"
            description="Peace & Order cases grouped by priority."
          >
            <div className="h-[320px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    blotterPriorityChartData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={
                      false
                    }
                  />

                  <XAxis
                    dataKey="name"
                  />

                  <YAxis
                    allowDecimals={
                      false
                    }
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Cases"
                    fill="#2563eb"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ReportChartCard>
        </div>
      </section>

      {/* ====================================
          DETAILED REPORT FILTER
      ==================================== */}

      <section className="space-y-4">
        <ReportSectionHeader
          title="Detailed Reports"
          description="Filter certificate requests and Peace & Order records by date."
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700">
            <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
            Date Range Filter
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            {/* START DATE */}

            <div className="space-y-2">
              <Label htmlFor="report-start-date">
                Start Date
              </Label>

              <Input
                id="report-start-date"
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target
                      .value
                  )
                }
                className="h-10 rounded-xl border-slate-200 bg-white"
              />
            </div>

            {/* END DATE */}

            <div className="space-y-2">
              <Label htmlFor="report-end-date">
                End Date
              </Label>

              <Input
                id="report-end-date"
                type="date"
                value={
                  endDate
                }
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target
                      .value
                  )
                }
                className="h-10 rounded-xl border-slate-200 bg-white"
              />
            </div>

            {/* FILTER BUTTONS */}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={
                  handleApplyFilters
                }
                className="h-10 rounded-xl bg-emerald-700 px-4 text-white hover:bg-emerald-800"
              >
                <Search className="mr-2 h-4 w-4" />

                Apply
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={
                  handleClearFilters
                }
                className="h-10 rounded-xl border-slate-200 bg-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" />

                Clear
              </Button>
            </div>
          </div>

          {/* FILTER ERROR */}

          {filterError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {
                filterError
              }
            </div>
          )}

          {/* FILTER DESCRIPTION */}

          <div className="mt-4 text-xs text-slate-500">
            {hasDateFilter ? (
              <p>
                Showing records from{" "}

                <span className="font-medium text-slate-800">
                  {appliedFilters.startDate
                    ? formatDate(
                        appliedFilters.startDate
                      )
                    : "the beginning"}
                </span>

                {" "}through{" "}

                <span className="font-medium text-slate-800">
                  {appliedFilters.endDate
                    ? formatDate(
                        appliedFilters.endDate
                      )
                    : "the latest record"}
                </span>
                .
              </p>
            ) : (
              <p>
                No date filter
                applied. Showing all
                available records.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ====================================
          DETAILED ERROR
      ==================================== */}

      {detailedError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load detailed
          report data.

          {detailedError instanceof
            Error && (
            <p className="mt-1 text-xs">
              {
                detailedError.message
              }
            </p>
          )}
        </div>
      )}

      {/* ====================================
          DETAILED LOADING
      ==================================== */}

      {detailedLoading && (
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />

          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        </div>
      )}

      {/* ====================================
          DETAILED TABLES
      ==================================== */}

      {!detailedLoading &&
        !detailedError && (
          <>
            {/* ====================================
                CERTIFICATE TABLE
            ==================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Certificate Request
                    Report
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Certificate
                    requests matching
                    the selected date
                    range.
                  </p>
                </div>

                <span className="text-sm font-medium text-slate-700">
                  {
                    certificateRows.length
                  }{" "}
                  record
                  {certificateRows.length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>

              {certificateRows.length ===
              0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  No certificate
                  requests found for
                  this date range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Request #
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {certificateRows.map(
                        (
                          item
                        ) => (
                          <tr
                            key={
                              item.id
                            }
                            className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80"
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                              {
                                item.request_number
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                              {formatDate(
                                item.created_at
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={[
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                  getCertificateStatusClass(
                                    item.status
                                  ),
                                ].join(
                                  " "
                                )}
                              >
                                {formatLabel(
                                  item.status
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ====================================
                BLOTTER TABLE
            ==================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Peace & Order Case
                    Report
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Blotter cases
                    matching the
                    selected incident
                    date range.
                  </p>
                </div>

                <span className="text-sm font-medium text-slate-700">
                  {
                    blotterRows.length
                  }{" "}
                  record
                  {blotterRows.length ===
                  1
                    ? ""
                    : "s"}
                </span>
              </div>

              {blotterRows.length ===
              0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  No Peace & Order
                  cases found for this
                  date range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Case #
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Complaint
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Incident Date
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Priority
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {blotterRows.map(
                        (
                          item
                        ) => (
                          <tr
                            key={
                              item.id
                            }
                            className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80"
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-950">
                              {
                                item.case_number
                              }
                            </td>

                            <td className="px-4 py-3">
                              {
                                item.complaint_type
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                              {formatDate(
                                item.incident_date
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={[
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                  getPriorityClass(
                                    item.priority
                                  ),
                                ].join(
                                  " "
                                )}
                              >
                                {formatLabel(
                                  item.priority
                                )}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={[
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                  getBlotterStatusClass(
                                    item.status
                                  ),
                                ].join(
                                  " "
                                )}
                              >
                                {formatLabel(
                                  item.status
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

      {/* ====================================
          REPORT EXPORT
      ==================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">
              Report Export
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Export the currently
              filtered report data.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Excel and PDF exports
              use the currently
              applied date range.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* EXCEL */}

            <Button
              type="button"
              onClick={
                handleExportExcel
              }
              disabled={
                exportingExcel ||
                exportingPdf ||
                detailedLoading ||
                Boolean(
                  detailedError
                )
              }
              className="rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
            >
              <Download className="mr-2 h-4 w-4" />

              {exportingExcel
                ? "Exporting..."
                : "Export Excel"}
            </Button>

            {/* PDF */}

            <Button
              type="button"
              variant="outline"
              onClick={
                handleExportPdf
              }
              disabled={
                exportingPdf ||
                exportingExcel ||
                detailedLoading ||
                Boolean(
                  detailedError
                )
              }
              className="rounded-xl border-slate-200 bg-white"
            >
              <FileDown className="mr-2 h-4 w-4" />

              {exportingPdf
                ? "Exporting..."
                : "Export PDF"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}