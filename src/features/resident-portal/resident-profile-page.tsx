import {
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  HeartHandshake,
  House,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  useMyResidentProfile,
} from "@/features/resident-portal/hooks/use-resident-portal"

// ========================================
// HELPERS
// ========================================

function getFullName(
  firstName: string,
  middleName: string | null,
  lastName: string,
  suffix: string | null
) {
  return [
    firstName,
    middleName,
    lastName,
    suffix,
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

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—"
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date)
}

function calculateAge(
  birthday: string
) {
  const birthDate =
    new Date(birthday)

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return null
  }

  const today =
    new Date()

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

function StatusBadge({
  value,
}: {
  value: boolean
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        value
          ? "bg-green-100 text-green-800"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {value ? "Yes" : "No"}
    </span>
  )
}

// ========================================
// PAGE
// ========================================

export function ResidentProfilePage() {
  const {
    data: profile,
    isLoading,
    error,
  } =
    useMyResidentProfile()

  // ========================================
  // LOADING
  // ========================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-lg border bg-muted/40" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-lg border bg-muted/40" />

          <div className="h-80 animate-pulse rounded-lg border bg-muted/40" />
        </div>
      </div>
    )
  }

  // ========================================
  // ERROR
  // ========================================

  if (
    error ||
    !profile
  ) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h2 className="font-semibold text-destructive">
          Unable to load profile
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your resident information
          could not be retrieved.
        </p>

        {error instanceof Error && (
          <p className="mt-2 text-xs text-destructive">
            {error.message}
          </p>
        )}
      </div>
    )
  }

  const fullName =
    getFullName(
      profile.first_name,
      profile.middle_name,
      profile.last_name,
      profile.suffix
    )

  const age =
    calculateAge(
      profile.birthday
    )

  const address = [
    profile.house_number,
    profile.street,
    profile.puroks?.name,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <p className="text-sm text-muted-foreground">
          Resident Portal
        </p>

        <h1 className="text-2xl font-bold tracking-tight">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View your official resident
          information.
        </p>
      </div>

      {/* PROFILE SUMMARY */}

      <section className="rounded-lg border bg-background p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <UserRound className="h-9 w-9 text-muted-foreground" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              {fullName}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {profile.resident_number}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium capitalize text-green-800">
                {profile.residency_status}
              </span>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {profile.puroks?.name ??
                  "No Purok"}
              </span>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                {profile.households
                  ?.household_number ??
                  "No Household"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONAL + ADDRESS */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PERSONAL */}

        <section className="rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b p-5">
            <UserRound className="h-5 w-5" />

            <h2 className="font-semibold">
              Personal Information
            </h2>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Full Name
              </p>

              <p className="mt-1 font-medium">
                {fullName}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Resident Number
              </p>

              <p className="mt-1 font-medium">
                {profile.resident_number}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Birthday
              </p>

              <p className="mt-1 font-medium">
                {formatDate(
                  profile.birthday
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Age
              </p>

              <p className="mt-1 font-medium">
                {age ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Gender
              </p>

              <p className="mt-1 font-medium capitalize">
                {profile.gender}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Civil Status
              </p>

              <p className="mt-1 font-medium capitalize">
                {profile.civil_status ??
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Birthplace
              </p>

              <p className="mt-1 font-medium">
                {profile.birthplace ??
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Nationality
              </p>

              <p className="mt-1 font-medium">
                {profile.nationality ??
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Religion
              </p>

              <p className="mt-1 font-medium">
                {profile.religion ??
                  "—"}
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT */}

        <section className="rounded-lg border bg-background">
          <div className="flex items-center gap-2 border-b p-5">
            <MapPin className="h-5 w-5" />

            <h2 className="font-semibold">
              Contact & Address
            </h2>
          </div>

          <div className="space-y-5 p-5">
            <div className="flex gap-3">
              <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Address
                </p>

                <p className="mt-1 font-medium">
                  {address || "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <House className="mt-1 h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Household
                </p>

                <p className="mt-1 font-medium">
                  {profile.households
                    ?.household_number ??
                    "Not assigned"}
                </p>

                {profile.households
                  ?.housing_status && (
                  <p className="text-xs capitalize text-muted-foreground">
                    {
                      profile.households
                        .housing_status
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="mt-1 h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Contact Number
                </p>

                <p className="mt-1 font-medium">
                  {profile.contact_number ??
                    "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="mt-1 h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Email
                </p>

                <p className="mt-1 font-medium">
                  {profile.email ??
                    "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CalendarDays className="mt-1 h-4 w-4 text-muted-foreground" />

              <div>
                <p className="text-xs text-muted-foreground">
                  Residency Start Date
                </p>

                <p className="mt-1 font-medium">
                  {formatDate(
                    profile.residency_start_date
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* OCCUPATION + EDUCATION */}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-background p-5">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5" />

            <h2 className="font-semibold">
              Occupation
            </h2>
          </div>

          <p className="mt-4 font-medium">
            {profile.occupation ??
              "Not specified"}
          </p>
        </section>

        <section className="rounded-lg border bg-background p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />

            <h2 className="font-semibold">
              Educational Attainment
            </h2>
          </div>

          <p className="mt-4 font-medium">
            {profile.educational_attainment ??
              "Not specified"}
          </p>
        </section>
      </div>

      {/* SPECIAL SECTORS */}

      <section className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-5">
          <ShieldCheck className="h-5 w-5" />

          <div>
            <h2 className="font-semibold">
              Registrations & Special Sectors
            </h2>

            <p className="text-xs text-muted-foreground">
              Classifications recorded
              by the barangay.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-medium">
              Registered Voter
            </p>

            <div className="mt-2">
              <StatusBadge
                value={
                  profile.is_voter
                }
              />
            </div>

            {profile.is_voter &&
              profile.precinct_number && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Precinct:{" "}
                  {
                    profile.precinct_number
                  }
                </p>
              )}
          </div>

          <div>
            <p className="text-sm font-medium">
              4Ps
            </p>

            <div className="mt-2">
              <StatusBadge
                value={
                  profile.is_4ps
                }
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">
              PWD
            </p>

            <div className="mt-2">
              <StatusBadge
                value={
                  profile.is_pwd
                }
              />
            </div>

            {profile.is_pwd &&
              profile.pwd_id_number && (
                <p className="mt-2 text-xs text-muted-foreground">
                  ID:{" "}
                  {
                    profile.pwd_id_number
                  }
                </p>
              )}
          </div>

          <div>
            <p className="text-sm font-medium">
              Senior Citizen
            </p>

            <div className="mt-2">
              <StatusBadge
                value={
                  profile.is_senior_citizen
                }
              />
            </div>

            {profile.is_senior_citizen &&
              profile.senior_citizen_id_number && (
                <p className="mt-2 text-xs text-muted-foreground">
                  ID:{" "}
                  {
                    profile.senior_citizen_id_number
                  }
                </p>
              )}
          </div>

          <div>
            <p className="text-sm font-medium">
              Solo Parent
            </p>

            <div className="mt-2">
              <StatusBadge
                value={
                  profile.is_solo_parent
                }
              />
            </div>

            {profile.is_solo_parent &&
              profile.solo_parent_id_number && (
                <p className="mt-2 text-xs text-muted-foreground">
                  ID:{" "}
                  {
                    profile.solo_parent_id_number
                  }
                </p>
              )}
          </div>

          <div>
            <p className="text-sm font-medium">
              Indigenous People
            </p>

            <div className="mt-2">
              <StatusBadge
                value={
                  profile.is_indigenous_people
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* EMERGENCY CONTACT */}

      <section className="rounded-lg border bg-background">
        <div className="flex items-center gap-2 border-b p-5">
          <HeartHandshake className="h-5 w-5" />

          <h2 className="font-semibold">
            Emergency Contact
          </h2>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">
              Name
            </p>

            <p className="mt-1 font-medium">
              {profile.emergency_contact_name ??
                "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Contact Number
            </p>

            <p className="mt-1 font-medium">
              {profile.emergency_contact_number ??
                "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">
              Relationship
            </p>

            <p className="mt-1 font-medium">
              {profile.emergency_contact_relationship ??
                "—"}
            </p>
          </div>
        </div>
      </section>

      {/* NOTICE */}

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium">
          Need to update your information?
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Contact barangay staff if
          any official information
          shown here needs to be
          corrected.
        </p>
      </div>
    </div>
  )
}