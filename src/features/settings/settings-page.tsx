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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="text-sm text-muted-foreground">
            Loading barangay settings...
          </p>
        </div>

        <div className="h-[520px] animate-pulse rounded-lg border bg-muted" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Settings
          </h1>
        </div>

        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Unable to load barangay settings.

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

      <div>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />

          <h1 className="text-2xl font-bold tracking-tight">
            Barangay Settings
          </h1>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage the official information
          used throughout the Barangay
          Management System.
        </p>
      </div>

      {/* ACCESS NOTICE */}

      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-sm font-medium">
              Super Admin Settings
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Changes here affect official
              barangay information used by
              system-generated documents.
            </p>
          </div>
        </div>
      </div>

      {/* SUCCESS */}

      {saveSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {saveSuccess}
        </div>
      )}

      {/* ERROR */}

      {saveError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {saveError}
        </div>
      )}

      {/* FORM */}

      <section className="overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            Barangay Information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Official barangay identity and
            contact information.
          </p>
        </div>

        <div className="space-y-8 p-5 sm:p-6">
          {/* LOCATION */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />

              <h3 className="font-medium">
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
                />
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* OFFICIAL */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <UserRound className="h-4 w-4" />

              <h3 className="font-medium">
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
              />
            </div>
          </div>

          <div className="border-t" />

          {/* CONTACT */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4" />

              <h3 className="font-medium">
                Contact Information
              </h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-number">
                  Contact Number
                </Label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barangay-email">
                  Email Address
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

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
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t bg-muted/20 p-5">
          <Button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              updateSettings.isPending
            }
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