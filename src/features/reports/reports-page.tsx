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
    <div className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="rounded-md bg-muted p-3">
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
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
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
    <div className="rounded-lg border bg-background p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>

          <p className="text-sm text-muted-foreground">
            Loading report
            statistics...
          </p>
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
                className="h-32 animate-pulse rounded-lg border bg-muted"
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
        </div>

        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load report
          statistics.

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

      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />

          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Barangay population,
          certificates, and Peace &
          Order reporting overview.
        </p>
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

        <div className="rounded-lg border bg-background">
          <div className="border-b p-5">
            <h3 className="font-semibold">
              Case Status Breakdown
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Detailed Peace &
              Order case status
              distribution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                Open
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter?.open ??
                  0
                }
              </p>
            </div>

            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                Under Mediation
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter
                    ?.under_mediation ??
                  0
                }
              </p>
            </div>

            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                Settled
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter
                    ?.settled ??
                  0
                }
              </p>
            </div>

            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                Referred
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter
                    ?.referred ??
                  0
                }
              </p>
            </div>

            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                Dismissed
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter
                    ?.dismissed ??
                  0
                }
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs text-muted-foreground">
                Closed
              </p>

              <p className="mt-2 text-2xl font-bold">
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

        <div className="rounded-lg border bg-background">
          <div className="border-b p-5">
            <h3 className="font-semibold">
              Priority Breakdown
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Blotter cases grouped
              by recorded priority.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                Low
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter?.low ??
                  0
                }
              </p>
            </div>

            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                Normal
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter
                    ?.normal ??
                  0
                }
              </p>
            </div>

            <div className="border-b p-5 xl:border-b-0 xl:border-r">
              <p className="text-xs text-muted-foreground">
                High
              </p>

              <p className="mt-2 text-2xl font-bold">
                {
                  blotter?.high ??
                  0
                }
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs text-muted-foreground">
                Urgent
              </p>

              <p className="mt-2 text-2xl font-bold">
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

        <div className="rounded-lg border bg-background p-5 shadow-sm">
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
              />
            </div>

            {/* FILTER BUTTONS */}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={
                  handleApplyFilters
                }
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
              >
                <RotateCcw className="mr-2 h-4 w-4" />

                Clear
              </Button>
            </div>
          </div>

          {/* FILTER ERROR */}

          {filterError && (
            <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {
                filterError
              }
            </div>
          )}

          {/* FILTER DESCRIPTION */}

          <div className="mt-4 text-xs text-muted-foreground">
            {hasDateFilter ? (
              <p>
                Showing records from{" "}

                <span className="font-medium text-foreground">
                  {appliedFilters.startDate
                    ? formatDate(
                        appliedFilters.startDate
                      )
                    : "the beginning"}
                </span>

                {" "}through{" "}

                <span className="font-medium text-foreground">
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
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
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
          <div className="h-64 animate-pulse rounded-lg border bg-muted" />

          <div className="h-64 animate-pulse rounded-lg border bg-muted" />
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

            <section className="overflow-hidden rounded-lg border bg-background shadow-sm">
              <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    Certificate Request
                    Report
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Certificate
                    requests matching
                    the selected date
                    range.
                  </p>
                </div>

                <span className="text-sm font-medium">
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
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No certificate
                  requests found for
                  this date range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          Request #
                        </th>

                        <th className="px-4 py-3 text-left font-medium">
                          Date
                        </th>

                        <th className="px-4 py-3 text-left font-medium">
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
                            className="border-b last:border-b-0"
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-medium">
                              {
                                item.request_number
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatDate(
                                item.created_at
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={[
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
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

            <section className="overflow-hidden rounded-lg border bg-background shadow-sm">
              <div className="flex flex-col gap-2 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    Peace & Order Case
                    Report
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Blotter cases
                    matching the
                    selected incident
                    date range.
                  </p>
                </div>

                <span className="text-sm font-medium">
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
                <div className="p-10 text-center text-sm text-muted-foreground">
                  No Peace & Order
                  cases found for this
                  date range.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          Case #
                        </th>

                        <th className="px-4 py-3 text-left font-medium">
                          Complaint
                        </th>

                        <th className="px-4 py-3 text-left font-medium">
                          Incident Date
                        </th>

                        <th className="px-4 py-3 text-left font-medium">
                          Priority
                        </th>

                        <th className="px-4 py-3 text-left font-medium">
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
                            className="border-b last:border-b-0"
                          >
                            <td className="whitespace-nowrap px-4 py-3 font-medium">
                              {
                                item.case_number
                              }
                            </td>

                            <td className="px-4 py-3">
                              {
                                item.complaint_type
                              }
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                              {formatDate(
                                item.incident_date
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={[
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
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
                                  "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
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

      <section className="rounded-lg border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Report Export
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Export the currently
              filtered report data.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
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