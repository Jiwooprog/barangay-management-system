import type { ReactNode } from "react"

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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        value
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          value
            ? "bg-emerald-500"
            : "bg-slate-400",
        ].join(" ")}
      />

      {value ? "Yes" : "No"}
    </span>
  )
}

function InfoField({
  label,
  value,
  capitalize = false,
}: {
  label: string
  value: ReactNode
  capitalize?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={[
          "mt-1.5 text-sm font-medium text-slate-900",
          capitalize
            ? "capitalize"
            : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
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
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-6"
      >
        <h2 className="font-semibold text-red-800">
          Unable to load profile
        </h2>

        <p className="mt-2 text-sm text-red-700/80">
          Your resident information could not be retrieved.
        </p>

        {error instanceof Error && (
          <p className="mt-2 text-xs text-red-700">
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
      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <UserRound className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Resident Portal
          </p>

          <h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-950">
            My Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View your official resident information.
          </p>
        </div>
      </div>

      {/* ========================================
          PROFILE SUMMARY
      ======================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <UserRound className="h-9 w-9" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-slate-950">
              {fullName}
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {profile.resident_number}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                {profile.residency_status}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {profile.puroks?.name ??
                  "No Purok"}
              </span>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {profile.households
                  ?.household_number ??
                  "No Household"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          PERSONAL + CONTACT
      ======================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PERSONAL INFORMATION */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <UserRound className="h-4 w-4" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-950">
                Personal Information
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Basic details from your resident record.
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <InfoField
              label="Full Name"
              value={fullName}
            />

            <InfoField
              label="Resident Number"
              value={profile.resident_number}
            />

            <InfoField
              label="Birthday"
              value={formatDate(
                profile.birthday
              )}
            />

            <InfoField
              label="Age"
              value={age ?? "—"}
            />

            <InfoField
              label="Gender"
              value={profile.gender}
              capitalize
            />

            <InfoField
              label="Civil Status"
              value={
                profile.civil_status ??
                "—"
              }
              capitalize
            />

            <InfoField
              label="Birthplace"
              value={
                profile.birthplace ??
                "—"
              }
            />

            <InfoField
              label="Nationality"
              value={
                profile.nationality ??
                "—"
              }
            />

            <InfoField
              label="Religion"
              value={
                profile.religion ??
                "—"
              }
            />
          </div>
        </section>

        {/* CONTACT & ADDRESS */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <MapPin className="h-4 w-4" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-950">
                Contact & Address
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Your registered contact and residency details.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 px-5">
            <div className="flex gap-3 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <MapPin className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Address
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {address || "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <House className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Household
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {profile.households
                    ?.household_number ??
                    "Not assigned"}
                </p>

                {profile.households
                  ?.housing_status && (
                  <p className="mt-0.5 text-xs capitalize text-slate-500">
                    {
                      profile.households
                        .housing_status
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Phone className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contact Number
                </p>

                <p className="mt-1 break-words text-sm font-medium text-slate-900">
                  {profile.contact_number ??
                    "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Mail className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-900">
                  {profile.email ??
                    "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <CalendarDays className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Residency Start Date
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {formatDate(
                    profile.residency_start_date
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================
          OCCUPATION + EDUCATION
      ======================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Occupation
              </p>

              <p className="mt-1 text-base font-semibold text-slate-950">
                {profile.occupation ??
                  "Not specified"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Educational Attainment
              </p>

              <p className="mt-1 text-base font-semibold text-slate-950">
                {profile.educational_attainment ??
                  "Not specified"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================
          SPECIAL SECTORS
      ======================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-950">
              Registrations & Special Sectors
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Classifications recorded by the barangay.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
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
                <p className="mt-2 text-xs text-slate-500">
                  Precinct:{" "}
                  {
                    profile.precinct_number
                  }
                </p>
              )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
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

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
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
                <p className="mt-2 text-xs text-slate-500">
                  ID:{" "}
                  {
                    profile.pwd_id_number
                  }
                </p>
              )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
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
                <p className="mt-2 text-xs text-slate-500">
                  ID:{" "}
                  {
                    profile.senior_citizen_id_number
                  }
                </p>
              )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
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
                <p className="mt-2 text-xs text-slate-500">
                  ID:{" "}
                  {
                    profile.solo_parent_id_number
                  }
                </p>
              )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-sm font-semibold text-slate-800">
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

      {/* ========================================
          EMERGENCY CONTACT
      ======================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <HeartHandshake className="h-4 w-4" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-950">
              Emergency Contact
            </h3>

            <p className="mt-0.5 text-xs text-slate-500">
              Contact information recorded for emergencies.
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-3">
          <InfoField
            label="Name"
            value={
              profile.emergency_contact_name ??
              "—"
            }
          />

          <InfoField
            label="Contact Number"
            value={
              profile.emergency_contact_number ??
              "—"
            }
          />

          <InfoField
            label="Relationship"
            value={
              profile.emergency_contact_relationship ??
              "—"
            }
          />
        </div>
      </section>

      {/* ========================================
          NOTICE
      ======================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Need to update your information?
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Contact barangay staff if any official information shown here needs to be corrected.
          </p>
        </div>
      </div>
    </div>
  )
}
