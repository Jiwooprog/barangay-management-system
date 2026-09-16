import {
  useEffect,
  useState,
} from "react"

import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  Button,
} from "@/components/ui/button"

import {
  Input,
} from "@/components/ui/input"

import {
  Label,
} from "@/components/ui/label"

import {
  useBarangaySettings,
  useUpdateBarangaySettings,
} from "@/features/settings/hooks/use-settings"

export function SettingsPage() {
  const {
    data,
    isLoading,
    error,
  } =
    useBarangaySettings()

  const updateSettings =
    useUpdateBarangaySettings()

  const [
    barangayName,
    setBarangayName,
  ] = useState("")

  const [
    municipalityCity,
    setMunicipalityCity,
  ] = useState("")

  const [
    province,
    setProvince,
  ] = useState("")

  const [
    barangayAddress,
    setBarangayAddress,
  ] = useState("")

  const [
    punongBarangayName,
    setPunongBarangayName,
  ] = useState("")

  const [
    contactNumber,
    setContactNumber,
  ] = useState("")

  const [
    email,
    setEmail,
  ] = useState("")

  const [
    saveError,
    setSaveError,
  ] = useState("")

  const [
    saveSuccess,
    setSaveSuccess,
  ] = useState("")

  useEffect(
    () => {
      if (!data) {
        return
      }

      setBarangayName(
        data.barangay_name ??
          ""
      )

      setMunicipalityCity(
        data.municipality_city ??
          ""
      )

      setProvince(
        data.province ??
          ""
      )

      setBarangayAddress(
        data.barangay_address ??
          ""
      )

      setPunongBarangayName(
        data.punong_barangay_name ??
          ""
      )

      setContactNumber(
        data.contact_number ??
          ""
      )

      setEmail(
        data.email ??
          ""
      )
    },
    [
      data,
    ]
  )

  const handleSave =
    async () => {
      if (
        !barangayName.trim() ||
        !municipalityCity.trim() ||
        !province.trim()
      ) {
        setSaveSuccess("")

        setSaveError(
          "Barangay name, municipality/city, and province are required."
        )

        return
      }

      if (
        email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email.trim()
        )
      ) {
        setSaveSuccess("")

        setSaveError(
          "Enter a valid email address."
        )

        return
      }

      try {
        setSaveError("")
        setSaveSuccess("")

        await updateSettings.mutateAsync({
          barangay_name:
            barangayName.trim(),

          municipality_city:
            municipalityCity.trim(),

          province:
            province.trim(),

          barangay_address:
            barangayAddress.trim() ||
            null,

          punong_barangay_name:
            punongBarangayName.trim() ||
            null,

          contact_number:
            contactNumber.trim() ||
            null,

          email:
            email.trim() ||
            null,
        })

        setSaveSuccess(
          "Barangay settings saved successfully."
        )
      } catch (
        mutationError
      ) {
        setSaveSuccess("")

        setSaveError(
          mutationError instanceof
            Error
            ? mutationError.message
            : "Unable to save barangay settings."
        )
      }
    }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Barangay Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Loading barangay settings...
            </p>
          </div>
        </div>

        <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Building2 className="h-5 w-5" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Barangay Settings
          </h2>
        </div>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-medium">
            Unable to load barangay settings.
          </p>

          {error instanceof
            Error && (
            <p className="mt-1 text-xs">
              {error.message}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Building2 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Barangay Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage the official information used throughout the Barangay Management System.
          </p>
        </div>
      </div>

      {/* ACCESS NOTICE */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-800">
              Super Admin Settings
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Changes here affect official barangay information used by system-generated documents.
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS */}

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          {saveSuccess}
        </div>
      )}

      {/* ERROR */}

      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {saveError}
        </div>
      )}

      {/* FORM */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-950">
            Barangay Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Official barangay identity and contact information.
          </p>
        </div>

        <div className="space-y-8 p-5 sm:p-6">
          {/* LOCATION */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <MapPin className="h-4 w-4" />
              </div>

              <h3 className="font-medium text-slate-800">
                Location
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="barangay-name">
                  Barangay Name
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </Label>

                <Input
                  id="barangay-name"
                  value={
                    barangayName
                  }
                  onChange={(
                    event
                  ) =>
                    setBarangayName(
                      event.target.value
                    )
                  }
                  placeholder="Barangay name"
                  className="h-10 rounded-xl border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="municipality-city">
                  Municipality / City
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </Label>

                <Input
                  id="municipality-city"
                  value={
                    municipalityCity
                  }
                  onChange={(
                    event
                  ) =>
                    setMunicipalityCity(
                      event.target.value
                    )
                  }
                  placeholder="Municipality or city"
                  className="h-10 rounded-xl border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">
                  Province
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                </Label>

                <Input
                  id="province"
                  value={
                    province
                  }
                  onChange={(
                    event
                  ) =>
                    setProvince(
                      event.target.value
                    )
                  }
                  placeholder="Province"
                  className="h-10 rounded-xl border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barangay-address">
                  Office Address
                </Label>

                <Input
                  id="barangay-address"
                  value={
                    barangayAddress
                  }
                  onChange={(
                    event
                  ) =>
                    setBarangayAddress(
                      event.target.value
                    )
                  }
                  placeholder="Barangay Hall address"
                  className="h-10 rounded-xl border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* OFFICIAL */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <UserRound className="h-4 w-4" />
              </div>

              <h3 className="font-medium text-slate-800">
                Barangay Official
              </h3>
            </div>

            <div className="max-w-xl space-y-2">
              <Label htmlFor="punong-barangay">
                Punong Barangay
              </Label>

              <Input
                id="punong-barangay"
                value={
                  punongBarangayName
                }
                onChange={(
                  event
                ) =>
                  setPunongBarangayName(
                    event.target.value
                  )
                }
                placeholder="Full name of Punong Barangay"
                className="h-10 rounded-xl border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* CONTACT */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Phone className="h-4 w-4" />
              </div>

              <h3 className="font-medium text-slate-800">
                Contact Information
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-number">
                  Contact Number
                </Label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="contact-number"
                    value={
                      contactNumber
                    }
                    onChange={(
                      event
                    ) =>
                      setContactNumber(
                        event.target.value
                      )
                    }
                    placeholder="Contact number"
                    className="h-10 rounded-xl border-slate-200 bg-white pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barangay-email">
                  Email Address
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <Input
                    id="barangay-email"
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="barangay@example.com"
                    className="h-10 rounded-xl border-slate-200 bg-white pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t border-slate-200 bg-slate-50/60 px-5 py-4">
          <Button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              updateSettings.isPending
            }
            className="h-10 rounded-xl bg-emerald-700 px-4 text-white hover:bg-emerald-800"
          >
            <Save className="mr-2 h-4 w-4" />

            {updateSettings.isPending
              ? "Saving..."
              : "Save Settings"}
          </Button>
        </div>
      </section>
    </div>
  )
}