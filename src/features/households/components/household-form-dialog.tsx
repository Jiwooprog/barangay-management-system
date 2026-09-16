import { useEffect, useRef, useState, type FormEvent } from "react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  useCreateHousehold,
  useUpdateHousehold,
} from "@/features/households/hooks/use-households"

import type { Household } from "@/features/households/types"

import { usePuroks } from "@/features/puroks/hooks/use-puroks"
import { supabase } from "@/lib/supabase"

interface HouseholdFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  household?: Household | null
}

interface HouseholdMember {
  id: string
  resident_number: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
}

async function getHouseholdMembers(
  householdId: string
): Promise<HouseholdMember[]> {
  const { data, error } = await supabase
    .from("residents")
    .select(`
      id,
      resident_number,
      first_name,
      middle_name,
      last_name,
      suffix
    `)
    .eq("household_id", householdId)
    .is("deleted_at", null)
    .eq("is_active", true)
    .order("last_name", {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data ?? []
}

function getResidentName(
  resident: HouseholdMember
) {
  return [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ")
}

const PH_MOBILE_PATTERN =
  /^(?:09\d{9}|\+639\d{9})$/

function normalizePhone(
  value: string
) {
  return value.replace(
    /[\s()-]/g,
    ""
  )
}

export function HouseholdFormDialog({
  open,
  onOpenChange,
  household,
}: HouseholdFormDialogProps) {
  const createMutation = useCreateHousehold()
  const updateMutation = useUpdateHousehold()

  const {
    data: puroks = [],
    isLoading: puroksLoading,
  } = usePuroks()

  const {
    data: householdMembers = [],
    isLoading: membersLoading,
  } = useQuery({
    queryKey: [
      "household-members",
      household?.id,
    ],

    queryFn: () =>
      getHouseholdMembers(household!.id),

    enabled:
      open &&
      Boolean(household?.id),
  })

  const [
    householdNumber,
    setHouseholdNumber,
  ] = useState("")

  const [
    purokId,
    setPurokId,
  ] = useState("")

  const [
    houseNumber,
    setHouseNumber,
  ] = useState("")

  const [
    street,
    setStreet,
  ] = useState("")

  const [
    contactNumber,
    setContactNumber,
  ] = useState("")

  const [
    housingStatus,
    setHousingStatus,
  ] = useState("")

  const [
    incomeClassification,
    setIncomeClassification,
  ] = useState("")

  const [
    householdHeadId,
    setHouseholdHeadId,
  ] = useState("")

  const [
    notes,
    setNotes,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  const errorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const isEditing =
    Boolean(household)

  useEffect(
    () => {
      if (
        !error ||
        !open
      ) {
        return
      }

      const timer =
        window.setTimeout(
          () => {
            errorRef.current
              ?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              })
          },
          50
        )

      return () => {
        window.clearTimeout(
          timer
        )
      }
    },
    [
      error,
      open,
    ]
  )

  useEffect(() => {
    if (household) {
      setHouseholdNumber(
        household.household_number
      )

      setPurokId(
        household.purok_id
      )

      setHouseNumber(
        household.house_number ?? ""
      )

      setStreet(
        household.street ?? ""
      )

      setContactNumber(
        household.contact_number ?? ""
      )

      setHousingStatus(
        household.housing_status ?? ""
      )

      setIncomeClassification(
        household.income_classification ?? ""
      )

      setHouseholdHeadId(
        household.household_head_id ?? ""
      )

      setNotes(
        household.notes ?? ""
      )
    } else {
      setHouseholdNumber("")
      setPurokId("")
      setHouseNumber("")
      setStreet("")
      setContactNumber("")
      setHousingStatus("")
      setIncomeClassification("")
      setHouseholdHeadId("")
      setNotes("")
    }

    setError("")
  }, [household, open])

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const cleanedHouseholdNumber =
      householdNumber.trim()

    if (!cleanedHouseholdNumber) {
      setError(
        "Household number is required."
      )
      return
    }

    if (!purokId) {
      setError(
        "Please select a purok."
      )
      return
    }

    const cleanedContactNumber =
      normalizePhone(
        contactNumber
      )

    if (
      cleanedContactNumber &&
      !PH_MOBILE_PATTERN.test(
        cleanedContactNumber
      )
    ) {
      setError(
        "Contact number must use 09XXXXXXXXX or +639XXXXXXXXX format."
      )
      return
    }

    setError("")

    try {
      if (household) {
        await updateMutation.mutateAsync({
          id: household.id,

          input: {
            household_number:
              cleanedHouseholdNumber,

            purok_id:
              purokId,

            house_number:
              houseNumber.trim(),

            street:
              street.trim(),

            contact_number:
              cleanedContactNumber,

            housing_status:
              housingStatus.trim(),

            income_classification:
              incomeClassification.trim(),

            household_head_id:
              householdHeadId || null,

            notes:
              notes.trim(),
          },
        })
      } else {
        await createMutation.mutateAsync({
          household_number:
            cleanedHouseholdNumber,

          purok_id:
            purokId,

          house_number:
            houseNumber.trim(),

          street:
            street.trim(),

          contact_number:
            cleanedContactNumber,

          housing_status:
            housingStatus.trim(),

          income_classification:
            incomeClassification.trim(),

          notes:
            notes.trim(),
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error(
        "Household save error:",
        error
      )

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        setError(
          String(error.message)
        )
      } else {
        setError(
          "Unable to save household."
        )
      }
    }
  }

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending

  const activePuroks =
    puroks.filter(
      (purok) =>
        purok.is_active ||
        purok.id === purokId
    )

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Household"
              : "Add Household"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update household information."
              : "Register a new household in the barangay."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Household Number */}
            <div className="space-y-2">
              <Label htmlFor="household-number">
                Household Number
              </Label>

              <Input
                id="household-number"
                placeholder="HH-0004"
                value={householdNumber}
                onChange={(event) =>
                  setHouseholdNumber(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />
            </div>

            {/* Purok */}
            <div className="space-y-2">
              <Label htmlFor="purok">
                Purok
              </Label>

              <select
                id="purok"
                value={purokId}
                onChange={(event) =>
                  setPurokId(
                    event.target.value
                  )
                }
                disabled={
                  isSaving ||
                  puroksLoading
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
              >
                <option value="">
                  {puroksLoading
                    ? "Loading puroks..."
                    : "Select purok"}
                </option>

                {activePuroks.map(
                  (purok) => (
                    <option
                      key={purok.id}
                      value={purok.id}
                    >
                      {purok.code
                        ? `${purok.code} - ${purok.name}`
                        : purok.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* House Number */}
            <div className="space-y-2">
              <Label htmlFor="house-number">
                House Number
              </Label>

              <Input
                id="house-number"
                placeholder="104"
                value={houseNumber}
                onChange={(event) =>
                  setHouseNumber(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">
                Street
              </Label>

              <Input
                id="street"
                placeholder="Quezon Street"
                value={street}
                onChange={(event) =>
                  setStreet(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contact-number">
                Contact Number
              </Label>

              <Input
                id="contact-number"
                type="tel"
                inputMode="tel"
                placeholder="09XXXXXXXXX"
                value={contactNumber}
                onChange={(event) =>
                  setContactNumber(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />
            </div>

            {/* Housing Status */}
            <div className="space-y-2">
              <Label htmlFor="housing-status">
                Housing Status
              </Label>

              <select
                id="housing-status"
                value={housingStatus}
                onChange={(event) =>
                  setHousingStatus(
                    event.target.value
                  )
                }
                disabled={isSaving}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
              >
                <option value="">
                  Select status
                </option>

                <option value="owned">
                  Owned
                </option>

                <option value="rented">
                  Rented
                </option>

                <option value="shared">
                  Shared
                </option>

                <option value="informal">
                  Informal
                </option>
              </select>
            </div>

            {/* Income Classification */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="income-classification">
                Income Classification
              </Label>

              <Input
                id="income-classification"
                placeholder="Optional"
                value={incomeClassification}
                onChange={(event) =>
                  setIncomeClassification(
                    event.target.value
                  )
                }
                disabled={isSaving}
              />
            </div>

            {/* Household Head */}
            {isEditing && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="household-head">
                  Household Head
                </Label>

                <select
                  id="household-head"
                  value={householdHeadId}
                  onChange={(event) =>
                    setHouseholdHeadId(
                      event.target.value
                    )
                  }
                  disabled={
                    isSaving ||
                    membersLoading
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
                >
                  <option value="">
                    {membersLoading
                      ? "Loading members..."
                      : "No household head selected"}
                  </option>

                  {householdMembers.map(
                    (resident) => (
                      <option
                        key={resident.id}
                        value={resident.id}
                      >
                        {getResidentName(
                          resident
                        )}
                      </option>
                    )
                  )}
                </select>

                {!membersLoading &&
                  householdMembers.length ===
                    0 && (
                    <p className="text-xs text-muted-foreground">
                      This household does
                      not have any residents
                      assigned yet.
                    </p>
                  )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">
                Notes
              </Label>

              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                disabled={isSaving}
                placeholder="Optional notes"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(false)
              }
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Household"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}