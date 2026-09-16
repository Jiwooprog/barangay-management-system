import { useQuery } from "@tanstack/react-query"

import { supabase } from "@/lib/supabase"

export interface DashboardChartItem {
  name: string
  value: number
}

export interface DashboardAnalytics {
  totalActiveResidents: number

  gender: DashboardChartItem[]

  voter: DashboardChartItem[]

  ageGroups: DashboardChartItem[]

  programs: DashboardChartItem[]

  puroks: DashboardChartItem[]
}

interface AnalyticsResident {
  birthday: string

  gender: "male" | "female"

  is_voter: boolean

  is_4ps: boolean
  is_pwd: boolean
  is_senior_citizen: boolean
  is_solo_parent: boolean
  is_indigenous_people: boolean

  is_active: boolean

  residency_status:
    | "active"
    | "transferred"
    | "deceased"

  puroks:
  | {
      name: string
    }[]
  | null
}

function calculateAge(
  birthday: string
) {
  const birthDate = new Date(
    `${birthday}T00:00:00`
  )

  const today = new Date()

  let age =
    today.getFullYear() -
    birthDate.getFullYear()

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth()

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate()
    )
  ) {
    age--
  }

  return age
}

async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const {
    data,
    error,
  } = await supabase
    .from("residents")
    .select(`
      birthday,
      gender,
      is_voter,
      is_4ps,
      is_pwd,
      is_senior_citizen,
      is_solo_parent,
      is_indigenous_people,
      is_active,
      residency_status,
      puroks:puroks!residents_purok_id_fkey (
        name
      )
    `)
    .is("deleted_at", null)
    .eq("is_active", true)
    .eq(
      "residency_status",
      "active"
    )

  if (error) {
    console.error(
      "Dashboard analytics error:",
      error
    )

    throw error
  }

  const residents =
    (data ?? []) as AnalyticsResident[]

  // =========================
  // GENDER
  // =========================

  let male = 0
  let female = 0

  // =========================
  // VOTERS
  // =========================

  let voters = 0
  let nonVoters = 0

  // =========================
  // AGE GROUPS
  // =========================

  let children = 0
  let youth = 0
  let adults = 0
  let seniors = 0

  // =========================
  // SPECIAL GROUPS
  // =========================

  let fourPs = 0
  let pwd = 0
  let seniorCitizens = 0
  let soloParents = 0
  let indigenousPeople = 0

  // =========================
  // PUROKS
  // =========================

  const purokCounts =
    new Map<string, number>()

  residents.forEach(
    (resident) => {
      // Gender

      if (
        resident.gender === "male"
      ) {
        male++
      }

      if (
        resident.gender === "female"
      ) {
        female++
      }

      // Voter

      if (resident.is_voter) {
        voters++
      } else {
        nonVoters++
      }

      // Age

      const age =
        calculateAge(
          resident.birthday
        )

      if (age <= 17) {
        children++
      } else if (age <= 30) {
        youth++
      } else if (age <= 59) {
        adults++
      } else {
        seniors++
      }

      // Programs / sectors

      if (resident.is_4ps) {
        fourPs++
      }

      if (resident.is_pwd) {
        pwd++
      }

      if (
        resident.is_senior_citizen
      ) {
        seniorCitizens++
      }

      if (
        resident.is_solo_parent
      ) {
        soloParents++
      }

      if (
        resident.is_indigenous_people
      ) {
        indigenousPeople++
      }

      // Purok

     const purokName =
     resident.puroks?.[0]?.name ??
     "Unassigned"

      purokCounts.set(
        purokName,
        (
          purokCounts.get(
            purokName
          ) ?? 0
        ) + 1
      )
    }
  )

  const puroks =
    Array.from(
      purokCounts.entries()
    )
      .map(
        ([name, value]) => ({
          name,
          value,
        })
      )
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            undefined,
            {
              numeric: true,
            }
          )
      )

  return {
    totalActiveResidents:
      residents.length,

    gender: [
      {
        name: "Male",
        value: male,
      },
      {
        name: "Female",
        value: female,
      },
    ],

    voter: [
      {
        name: "Registered",
        value: voters,
      },
      {
        name: "Not Registered",
        value: nonVoters,
      },
    ],

    ageGroups: [
      {
        name: "0-17",
        value: children,
      },
      {
        name: "18-30",
        value: youth,
      },
      {
        name: "31-59",
        value: adults,
      },
      {
        name: "60+",
        value: seniors,
      },
    ],

    programs: [
      {
        name: "4Ps",
        value: fourPs,
      },
      {
        name: "PWD",
        value: pwd,
      },
      {
        name: "Senior",
        value: seniorCitizens,
      },
      {
        name: "Solo Parent",
        value: soloParents,
      },
      {
        name: "Indigenous",
        value: indigenousPeople,
      },
    ],

    puroks,
  }
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: [
      "dashboard-analytics",
    ],

    queryFn:
      getDashboardAnalytics,
  })
}