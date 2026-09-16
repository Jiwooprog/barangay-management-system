import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileClock,
  House,
  MapPinned,
  Scale,
  ShieldAlert,
  Users,
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

import {
  useBlotterDashboardStats,
} from "@/features/blotter/hooks/use-blotter"

import {
  useDashboardAnalytics,
} from "@/features/dashboard/use-dashboard-analytics"

import {
  useDashboardStats,
} from "@/features/dashboard/use-dashboard-stats"

// ========================================
// CHART COLORS
// ========================================

const genderColors = [
  "#2563eb",
  "#db2777",
]

const voterColors = [
  "#16a34a",
  "#94a3b8",
]

// ========================================
// STAT CARD
// ========================================

function StatCard({
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ========================================
// CHART CARD
// ========================================

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="font-semibold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  )
}

// ========================================
// HELPERS
// ========================================

function formatLabel(
  value: string
) {
  return value
    .replace(/_/g, " ")
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
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(date)
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
      return "bg-slate-100 text-foreground"

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
// DASHBOARD
// ========================================

export function DashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } =
    useDashboardStats()

  const {
    data: analytics,
    isLoading:
      analyticsLoading,
    error:
      analyticsError,
  } =
    useDashboardAnalytics()

  // ========================================
  // BLOTTER DASHBOARD
  // ========================================

  const {
    data: blotterStats,
    isLoading:
      blotterLoading,
    error:
      blotterError,
  } =
    useBlotterDashboardStats()

  const isLoading =
    statsLoading ||
    analyticsLoading

  // ========================================
  // MAIN LOADING
  // ========================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h1>

          <p className="text-sm text-muted-foreground">
            Loading barangay
            statistics...
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={
                  index
                }
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
              />
            )
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({
            length: 4,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={
                  index
                }
                className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
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

  if (
    statsError ||
    analyticsError
  ) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          Unable to load dashboard
          statistics.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <BarChart3 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Barangay population, households, certificates, demographics, and Peace & Order overview.
          </p>
        </div>
      </div>

      {/* ====================================
          MAIN STAT CARDS
      ==================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Residents"
          value={
            stats?.residents ??
            0
          }
          description="Total registered residents"
          icon={Users}
        />

        <StatCard
          title="Households"
          value={
            stats?.households ??
            0
          }
          description="Registered households"
          icon={House}
        />

        <StatCard
          title="Puroks"
          value={
            stats?.puroks ??
            0
          }
          description="Barangay puroks"
          icon={MapPinned}
        />

        <StatCard
          title="Pending Requests"
          value={
            stats
              ?.pendingRequests ??
            0
          }
          description="Certificate requests"
          icon={FileClock}
        />
      </div>

      {/* ====================================
          ACTIVE POPULATION
      ==================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600">
                Active Population
              </p>

              <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                {analytics
                  ?.totalActiveResidents ??
                  0}
              </p>
            </div>
          </div>

          <p className="max-w-md text-sm leading-6 text-slate-500">
            Residents currently marked active with an active residency status.
          </p>
        </div>
      </section>

      {/* ====================================
          PEACE & ORDER
      ==================================== */}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Peace & Order
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current blotter case workload, mediation, and resolution activity.
            </p>
          </div>
        </div>

        {/* BLOTTER ERROR */}

        {blotterError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            Unable to load Peace &
            Order statistics.

            {blotterError instanceof
              Error && (
              <p className="mt-1 text-xs">
                {
                  blotterError.message
                }
              </p>
            )}
          </div>
        )}

        {/* BLOTTER LOADING */}

        {blotterLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({
              length: 4,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm"
                />
              )
            )}
          </div>
        )}

        {!blotterLoading &&
          !blotterError && (
            <>
              {/* BLOTTER STATS */}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Cases"
                  value={
                    blotterStats
                      ?.total ??
                    0
                  }
                  description="Active blotter records"
                  icon={
                    ClipboardList
                  }
                />

                <StatCard
                  title="Open Cases"
                  value={
                    blotterStats
                      ?.open ??
                    0
                  }
                  description="Cases awaiting action"
                  icon={
                    ShieldAlert
                  }
                />

                <StatCard
                  title="Under Mediation"
                  value={
                    blotterStats
                      ?.under_mediation ??
                    0
                  }
                  description="Cases in mediation"
                  icon={Scale}
                />

                <StatCard
                  title="Resolved Cases"
                  value={
                    blotterStats
                      ?.resolved ??
                    0
                  }
                  description="Settled, referred, dismissed or closed"
                  icon={
                    CheckCircle2
                  }
                />
              </div>

              {/* PRIORITY SUMMARY */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-600">
                    Urgent Cases
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {blotterStats
                      ?.urgent ??
                      0}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Cases marked urgent priority
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-600">
                    High Priority
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {blotterStats
                      ?.high_priority ??
                      0}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Cases marked high priority
                  </p>
                </div>
              </div>

              {/* RECENT CASES */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="font-semibold text-slate-950">
                    Recent Blotter
                    Cases
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Most recently
                    recorded Peace &
                    Order cases.
                  </p>
                </div>

                {(
                  blotterStats
                    ?.recent_cases ??
                  []
                ).length ===
                0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No blotter cases
                    recorded.
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
                            Incident
                            Date
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
                        {(
                          blotterStats
                            ?.recent_cases ??
                          []
                        ).map(
                          (
                            item
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                              className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80"
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

                              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
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

                <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
                  Showing up to 5
                  recent cases.
                </div>
              </section>
            </>
          )}
      </section>

      {/* ====================================
          POPULATION ANALYTICS
      ==================================== */}

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              Population Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Resident demographic and purok distribution overview.
            </p>
          </div>
        </div>

      {/* ====================================
          CHART ROW 1
      ==================================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* GENDER */}

        <ChartCard
          title="Gender Distribution"
          description="Active residents by gender."
        >
          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    analytics
                      ?.gender ??
                    []
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={
                    90
                  }
                  label={({
                    name,
                    value,
                  }) =>
                    `${name}: ${value}`
                  }
                >
                  {(
                    analytics
                      ?.gender ??
                    []
                  ).map(
                    (
                      item,
                      index
                    ) => (
                      <Cell
                        key={
                          item.name
                        }
                        fill={
                          genderColors[
                            index %
                              genderColors.length
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
        </ChartCard>

        {/* VOTER */}

        <ChartCard
          title="Voter Registration"
          description="Registered and non-registered voters."
        >
          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    analytics
                      ?.voter ??
                    []
                  }
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={
                    55
                  }
                  outerRadius={
                    90
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
                  {(
                    analytics
                      ?.voter ??
                    []
                  ).map(
                    (
                      item,
                      index
                    ) => (
                      <Cell
                        key={
                          item.name
                        }
                        fill={
                          voterColors[
                            index %
                              voterColors.length
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
        </ChartCard>
      </div>

      {/* ====================================
          CHART ROW 2
      ==================================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* AGE GROUPS */}

        <ChartCard
          title="Age Groups"
          description="Population distribution by age."
        >
          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  analytics
                    ?.ageGroups ??
                  []
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
                  name="Residents"
                  fill="#047857"
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
        </ChartCard>

        {/* SPECIAL SECTORS */}

        <ChartCard
          title="Special Sectors"
          description="Residents belonging to major programs and sectors."
        >
          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  analytics
                    ?.programs ??
                  []
                }
                layout="vertical"
                margin={{
                  left: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={
                    false
                  }
                />

                <XAxis
                  type="number"
                  allowDecimals={
                    false
                  }
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Residents"
                  fill="#047857"
                  radius={[
                    0,
                    6,
                    6,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ====================================
          PUROK DISTRIBUTION
      ==================================== */}

      <ChartCard
        title="Residents by Purok"
        description="Active resident population across puroks."
      >
        <div className="h-[360px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                analytics
                  ?.puroks ??
                []
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
                interval={0}
              />

              <YAxis
                allowDecimals={
                  false
                }
              />

              <Tooltip />

              <Bar
                dataKey="value"
                name="Residents"
                fill="#0f766e"
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
      </ChartCard>
      </section>
    </div>
  )
}