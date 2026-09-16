import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

import {
  Loader2,
  Save,
  UserRound,
} from "lucide-react"

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
  useCreateBlotterCase,
  useUpdateBlotterCase,
} from "@/features/blotter/hooks/use-blotter"

import { supabase } from "@/lib/supabase"

import type {
  BlotterCase,
  BlotterPriority,
} from "@/features/blotter/types"

// ========================================
// TYPES
// ========================================

type PartyMode =
  | "resident"
  | "external"

interface ResidentOption {
  id: string
  resident_number: string

  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null

  contact_number: string | null

  house_number: string | null
  street: string | null
}

interface BlotterCaseDialogProps {
  open: boolean

  onOpenChange: (
    open: boolean
  ) => void

  caseData?: BlotterCase | null
}

// ========================================
// HELPERS
// ========================================

function getResidentName(
  resident: ResidentOption
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

function getResidentAddress(
  resident: ResidentOption
) {
  return [
    resident.house_number,
    resident.street,
  ]
    .filter(Boolean)
    .join(", ")
}

function normalizeTime(
  value: string | null
) {
  if (!value) {
    return ""
  }

  return value.slice(
    0,
    5
  )
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

function getTodayDateValue() {
  const now =
    new Date()

  const year =
    now.getFullYear()

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    )

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    )

  return `${year}-${month}-${day}`
}

// ========================================
// COMPONENT
// ========================================

export function BlotterCaseDialog({
  open,
  onOpenChange,
  caseData = null,
}: BlotterCaseDialogProps) {
  const createMutation =
    useCreateBlotterCase()

  const updateMutation =
    useUpdateBlotterCase()

  const isEditMode =
    Boolean(caseData)

  const today =
    getTodayDateValue()

  // ========================================
  // RESIDENT OPTIONS
  // ========================================

  const [
    residents,
    setResidents,
  ] = useState<
    ResidentOption[]
  >([])

  const [
    residentsLoading,
    setResidentsLoading,
  ] = useState(false)

  // ========================================
  // INCIDENT
  // ========================================

  const [
    complaintType,
    setComplaintType,
  ] = useState("")

  const [
    incidentDate,
    setIncidentDate,
  ] = useState("")

  const [
    incidentTime,
    setIncidentTime,
  ] = useState("")

  const [
    incidentLocation,
    setIncidentLocation,
  ] = useState("")

  const [
    incidentDetails,
    setIncidentDetails,
  ] = useState("")

  const [
    priority,
    setPriority,
  ] =
    useState<BlotterPriority>(
      "normal"
    )

  const [
    notes,
    setNotes,
  ] = useState("")

  // ========================================
  // COMPLAINANT
  // ========================================

  const [
    complainantMode,
    setComplainantMode,
  ] =
    useState<PartyMode>(
      "resident"
    )

  const [
    complainantResidentId,
    setComplainantResidentId,
  ] = useState("")

  const [
    complainantName,
    setComplainantName,
  ] = useState("")

  const [
    complainantContact,
    setComplainantContact,
  ] = useState("")

  const [
    complainantAddress,
    setComplainantAddress,
  ] = useState("")

  // ========================================
  // RESPONDENT
  // ========================================

  const [
    respondentMode,
    setRespondentMode,
  ] =
    useState<PartyMode>(
      "resident"
    )

  const [
    respondentResidentId,
    setRespondentResidentId,
  ] = useState("")

  const [
    respondentName,
    setRespondentName,
  ] = useState("")

  const [
    respondentContact,
    setRespondentContact,
  ] = useState("")

  const [
    respondentAddress,
    setRespondentAddress,
  ] = useState("")

  const [
    formError,
    setFormError,
  ] = useState("")

  const errorRef =
    useRef<HTMLDivElement | null>(
      null
    )

  useEffect(
    () => {
      if (
        !formError ||
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
      formError,
      open,
    ]
  )

  // ========================================
  // LOAD RESIDENTS
  // ========================================

  useEffect(() => {
    if (!open) {
      return
    }

    const loadResidents =
      async () => {
        try {
          setResidentsLoading(
            true
          )

          const {
            data,
            error,
          } =
            await supabase
              .from(
                "residents"
              )
              .select(`
                id,
                resident_number,
                first_name,
                middle_name,
                last_name,
                suffix,
                contact_number,
                house_number,
                street
              `)
              .eq(
                "is_active",
                true
              )
              .is(
                "deleted_at",
                null
              )
              .order(
                "last_name",
                {
                  ascending: true,
                }
              )
              .order(
                "first_name",
                {
                  ascending: true,
                }
              )

          if (error) {
            throw error
          }

          setResidents(
            (data ??
              []) as ResidentOption[]
          )
        } catch (
          residentError
        ) {
          console.error(
            "Load blotter resident options error:",
            residentError
          )
        } finally {
          setResidentsLoading(
            false
          )
        }
      }

    void loadResidents()
  }, [open])

  // ========================================
  // POPULATE / RESET FORM
  // ========================================

  useEffect(() => {
    if (!open) {
      return
    }

    setFormError("")

    if (!caseData) {
      setComplaintType("")
      setIncidentDate("")
      setIncidentTime("")
      setIncidentLocation("")
      setIncidentDetails("")
      setPriority("normal")
      setNotes("")

      setComplainantMode(
        "resident"
      )

      setComplainantResidentId(
        ""
      )

      setComplainantName("")
      setComplainantContact("")
      setComplainantAddress("")

      setRespondentMode(
        "resident"
      )

      setRespondentResidentId(
        ""
      )

      setRespondentName("")
      setRespondentContact("")
      setRespondentAddress("")

      return
    }

    // ========================================
    // EDIT DATA
    // ========================================

    setComplaintType(
      caseData.complaint_type
    )

    setIncidentDate(
      caseData.incident_date
    )

    setIncidentTime(
      normalizeTime(
        caseData.incident_time
      )
    )

    setIncidentLocation(
      caseData.incident_location ??
        ""
    )

    setIncidentDetails(
      caseData.incident_details
    )

    setPriority(
      caseData.priority
    )

    setNotes(
      caseData.notes ?? ""
    )

    // Complainant

    if (
      caseData.complainant_resident_id
    ) {
      setComplainantMode(
        "resident"
      )

      setComplainantResidentId(
        caseData.complainant_resident_id
      )

      setComplainantName("")
      setComplainantContact("")
      setComplainantAddress("")
    } else {
      setComplainantMode(
        "external"
      )

      setComplainantResidentId(
        ""
      )

      setComplainantName(
        caseData.complainant_name ??
          ""
      )

      setComplainantContact(
        caseData.complainant_contact_number ??
          ""
      )

      setComplainantAddress(
        caseData.complainant_address ??
          ""
      )
    }

    // Respondent

    if (
      caseData.respondent_resident_id
    ) {
      setRespondentMode(
        "resident"
      )

      setRespondentResidentId(
        caseData.respondent_resident_id
      )

      setRespondentName("")
      setRespondentContact("")
      setRespondentAddress("")
    } else {
      setRespondentMode(
        "external"
      )

      setRespondentResidentId(
        ""
      )

      setRespondentName(
        caseData.respondent_name ??
          ""
      )

      setRespondentContact(
        caseData.respondent_contact_number ??
          ""
      )

      setRespondentAddress(
        caseData.respondent_address ??
          ""
      )
    }
  }, [
    open,
    caseData,
  ])

  // ========================================
  // SELECTED RESIDENTS
  // ========================================

  const selectedComplainant =
    useMemo(
      () =>
        residents.find(
          (resident) =>
            resident.id ===
            complainantResidentId
        ) ?? null,
      [
        residents,
        complainantResidentId,
      ]
    )

  const selectedRespondent =
    useMemo(
      () =>
        residents.find(
          (resident) =>
            resident.id ===
            respondentResidentId
        ) ?? null,
      [
        residents,
        respondentResidentId,
      ]
    )

  // ========================================
  // SAVE
  // ========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    // ----------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------

    if (
      !complaintType.trim()
    ) {
      setFormError(
        "Complaint type is required."
      )

      return
    }

    if (!incidentDate) {
      setFormError(
        "Incident date is required."
      )

      return
    }

    if (
      incidentDate >
      today
    ) {
      setFormError(
        "Incident date cannot be in the future."
      )

      return
    }

    if (
      incidentTime &&
      incidentDate ===
        today
    ) {
      const incidentDateTime =
        new Date(
          `${incidentDate}T${incidentTime}`
        )

      if (
        !Number.isNaN(
          incidentDateTime.getTime()
        ) &&
        incidentDateTime.getTime() >
          Date.now()
      ) {
        setFormError(
          "Incident time cannot be in the future."
        )

        return
      }
    }

    if (
      !incidentDetails.trim()
    ) {
      setFormError(
        "Incident details are required."
      )

      return
    }

    // ----------------------------------------
    // COMPLAINANT VALIDATION
    // ----------------------------------------

    if (
      complainantMode ===
        "resident" &&
      !complainantResidentId
    ) {
      setFormError(
        "Please select the complainant resident."
      )

      return
    }

    if (
      complainantMode ===
        "external" &&
      !complainantName.trim()
    ) {
      setFormError(
        "Complainant name is required."
      )

      return
    }

    const cleanedComplainantContact =
      normalizePhone(
        complainantContact
      )

    if (
      complainantMode ===
        "external" &&
      cleanedComplainantContact &&
      !PH_MOBILE_PATTERN.test(
        cleanedComplainantContact
      )
    ) {
      setFormError(
        "Complainant contact number must use 09XXXXXXXXX or +639XXXXXXXXX format."
      )

      return
    }

    // ----------------------------------------
    // RESPONDENT VALIDATION
    // ----------------------------------------

    if (
      respondentMode ===
        "resident" &&
      !respondentResidentId
    ) {
      setFormError(
        "Please select the respondent resident."
      )

      return
    }

    if (
      respondentMode ===
        "external" &&
      !respondentName.trim()
    ) {
      setFormError(
        "Respondent name is required."
      )

      return
    }

    const cleanedRespondentContact =
      normalizePhone(
        respondentContact
      )

    if (
      respondentMode ===
        "external" &&
      cleanedRespondentContact &&
      !PH_MOBILE_PATTERN.test(
        cleanedRespondentContact
      )
    ) {
      setFormError(
        "Respondent contact number must use 09XXXXXXXXX or +639XXXXXXXXX format."
      )

      return
    }

    // ----------------------------------------
    // SAME PERSON VALIDATION
    // ----------------------------------------

    if (
      complainantMode ===
        "resident" &&
      respondentMode ===
        "resident" &&
      complainantResidentId ===
        respondentResidentId
    ) {
      setFormError(
        "Complainant and respondent cannot be the same resident."
      )

      return
    }

    try {
      setFormError("")

      const payload = {
        complaint_type:
          complaintType.trim(),

        incident_date:
          incidentDate,

        incident_time:
          incidentTime ||
          null,

        incident_location:
          incidentLocation.trim() ||
          null,

        incident_details:
          incidentDetails.trim(),

        priority,

        notes:
          notes.trim() ||
          null,

        // Complainant
        complainant_resident_id:
          complainantMode ===
          "resident"
            ? complainantResidentId
            : null,

        complainant_name:
          complainantMode ===
          "external"
            ? complainantName.trim()
            : null,

        complainant_contact_number:
          complainantMode ===
          "external"
            ? cleanedComplainantContact ||
              null
            : null,

        complainant_address:
          complainantMode ===
          "external"
            ? complainantAddress.trim() ||
              null
            : null,

        // Respondent
        respondent_resident_id:
          respondentMode ===
          "resident"
            ? respondentResidentId
            : null,

        respondent_name:
          respondentMode ===
          "external"
            ? respondentName.trim()
            : null,

        respondent_contact_number:
          respondentMode ===
          "external"
            ? cleanedRespondentContact ||
              null
            : null,

        respondent_address:
          respondentMode ===
          "external"
            ? respondentAddress.trim() ||
              null
            : null,
      }

      if (
        isEditMode &&
        caseData
      ) {
        await updateMutation.mutateAsync({
          id:
            caseData.id,

          ...payload,
        })
      } else {
        await createMutation.mutateAsync(
          payload
        )
      }

      onOpenChange(false)
    } catch (saveError) {
      console.error(
        "Save blotter case error:",
        saveError
      )

      if (
        saveError instanceof Error
      ) {
        setFormError(
          saveError.message
        )
      } else {
        setFormError(
          "Unable to save blotter case."
        )
      }
    }
  }

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending

  // ========================================
  // RENDER
  // ========================================

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Edit Blotter Case"
              : "New Blotter Case"}
          </DialogTitle>

          <DialogDescription>
            {isEditMode
              ? `Update ${caseData?.case_number ?? "this case"}.`
              : "Record a new barangay complaint or incident."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >
          {/* ====================================
              INCIDENT
          ==================================== */}

          <section className="space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">
                Incident Information
              </h3>

              <p className="text-xs text-muted-foreground">
                Enter the details of
                the complaint or
                incident.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* TYPE */}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="complaint-type">
                  Complaint Type
                </Label>

                <Input
                  id="complaint-type"
                  value={
                    complaintType
                  }
                  onChange={(event) =>
                    setComplaintType(
                      event.target.value
                    )
                  }
                  placeholder="Example: Noise Complaint"
                  disabled={
                    isSaving
                  }
                />
              </div>

              {/* DATE */}

              <div className="space-y-2">
                <Label htmlFor="incident-date">
                  Incident Date
                </Label>

                <Input
                  id="incident-date"
                  type="date"
                  max={today}
                  value={
                    incidentDate
                  }
                  onChange={(event) =>
                    setIncidentDate(
                      event.target.value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              {/* TIME */}

              <div className="space-y-2">
                <Label htmlFor="incident-time">
                  Incident Time
                </Label>

                <Input
                  id="incident-time"
                  type="time"
                  value={
                    incidentTime
                  }
                  onChange={(event) =>
                    setIncidentTime(
                      event.target.value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              {/* LOCATION */}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="incident-location">
                  Incident Location
                </Label>

                <Input
                  id="incident-location"
                  value={
                    incidentLocation
                  }
                  onChange={(event) =>
                    setIncidentLocation(
                      event.target.value
                    )
                  }
                  placeholder="Example: Purok 1, Rizal Street"
                  disabled={
                    isSaving
                  }
                />
              </div>

              {/* DETAILS */}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="incident-details">
                  Incident Details
                </Label>

                <textarea
                  id="incident-details"
                  rows={5}
                  value={
                    incidentDetails
                  }
                  onChange={(event) =>
                    setIncidentDetails(
                      event.target.value
                    )
                  }
                  placeholder="Describe what happened..."
                  disabled={
                    isSaving
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* PRIORITY */}

              <div className="space-y-2">
                <Label htmlFor="priority">
                  Priority
                </Label>

                <select
                  id="priority"
                  value={
                    priority
                  }
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as BlotterPriority
                    )
                  }
                  disabled={
                    isSaving
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="normal">
                    Normal
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="urgent">
                    Urgent
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* ====================================
              COMPLAINANT
          ==================================== */}

          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-5 w-5" />

              <div>
                <h3 className="font-semibold">
                  Complainant
                </h3>

                <p className="text-xs text-muted-foreground">
                  Select an existing
                  resident or record an
                  external person.
                </p>
              </div>
            </div>

            {/* MODE */}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant={
                  complainantMode ===
                  "resident"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setComplainantMode(
                    "resident"
                  )
                }
                disabled={
                  isSaving
                }
              >
                Existing Resident
              </Button>

              <Button
                type="button"
                variant={
                  complainantMode ===
                  "external"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setComplainantMode(
                    "external"
                  )
                }
                disabled={
                  isSaving
                }
              >
                External Person
              </Button>
            </div>

            {/* RESIDENT */}

            {complainantMode ===
              "resident" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="complainant-resident">
                    Resident
                  </Label>

                  <select
                    id="complainant-resident"
                    value={
                      complainantResidentId
                    }
                    onChange={(event) =>
                      setComplainantResidentId(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving ||
                      residentsLoading
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      {residentsLoading
                        ? "Loading residents..."
                        : "Select resident"}
                    </option>

                    {residents.map(
                      (
                        resident
                      ) => (
                        <option
                          key={
                            resident.id
                          }
                          value={
                            resident.id
                          }
                        >
                          {
                            resident.resident_number
                          }{" "}
                          -{" "}
                          {getResidentName(
                            resident
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {selectedComplainant && (
                  <div className="rounded-md bg-muted/40 p-3 text-sm">
                    <p className="font-medium">
                      {getResidentName(
                        selectedComplainant
                      )}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        selectedComplainant.resident_number
                      }
                    </p>

                    {selectedComplainant.contact_number && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Contact:{" "}
                        {
                          selectedComplainant.contact_number
                        }
                      </p>
                    )}

                    {getResidentAddress(
                      selectedComplainant
                    ) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Address:{" "}
                        {getResidentAddress(
                          selectedComplainant
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EXTERNAL */}

            {complainantMode ===
              "external" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="complainant-name">
                    Full Name
                  </Label>

                  <Input
                    id="complainant-name"
                    value={
                      complainantName
                    }
                    onChange={(event) =>
                      setComplainantName(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complainant-contact">
                    Contact Number
                  </Label>

                  <Input
                    id="complainant-contact"
                    type="tel"
                    inputMode="tel"
                    placeholder="09XXXXXXXXX"
                    value={
                      complainantContact
                    }
                    onChange={(event) =>
                      setComplainantContact(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving
                    }
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="complainant-address">
                    Address
                  </Label>

                  <Input
                    id="complainant-address"
                    value={
                      complainantAddress
                    }
                    onChange={(event) =>
                      setComplainantAddress(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving
                    }
                  />
                </div>
              </div>
            )}
          </section>

          {/* ====================================
              RESPONDENT
          ==================================== */}

          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-5 w-5" />

              <div>
                <h3 className="font-semibold">
                  Respondent
                </h3>

                <p className="text-xs text-muted-foreground">
                  Select an existing
                  resident or record an
                  external person.
                </p>
              </div>
            </div>

            {/* MODE */}

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant={
                  respondentMode ===
                  "resident"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setRespondentMode(
                    "resident"
                  )
                }
                disabled={
                  isSaving
                }
              >
                Existing Resident
              </Button>

              <Button
                type="button"
                variant={
                  respondentMode ===
                  "external"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setRespondentMode(
                    "external"
                  )
                }
                disabled={
                  isSaving
                }
              >
                External Person
              </Button>
            </div>

            {/* RESIDENT */}

            {respondentMode ===
              "resident" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="respondent-resident">
                    Resident
                  </Label>

                  <select
                    id="respondent-resident"
                    value={
                      respondentResidentId
                    }
                    onChange={(event) =>
                      setRespondentResidentId(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving ||
                      residentsLoading
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">
                      {residentsLoading
                        ? "Loading residents..."
                        : "Select resident"}
                    </option>

                    {residents.map(
                      (
                        resident
                      ) => (
                        <option
                          key={
                            resident.id
                          }
                          value={
                            resident.id
                          }
                        >
                          {
                            resident.resident_number
                          }{" "}
                          -{" "}
                          {getResidentName(
                            resident
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {selectedRespondent && (
                  <div className="rounded-md bg-muted/40 p-3 text-sm">
                    <p className="font-medium">
                      {getResidentName(
                        selectedRespondent
                      )}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        selectedRespondent.resident_number
                      }
                    </p>

                    {selectedRespondent.contact_number && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Contact:{" "}
                        {
                          selectedRespondent.contact_number
                        }
                      </p>
                    )}

                    {getResidentAddress(
                      selectedRespondent
                    ) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Address:{" "}
                        {getResidentAddress(
                          selectedRespondent
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* EXTERNAL */}

            {respondentMode ===
              "external" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="respondent-name">
                    Full Name
                  </Label>

                  <Input
                    id="respondent-name"
                    value={
                      respondentName
                    }
                    onChange={(event) =>
                      setRespondentName(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="respondent-contact">
                    Contact Number
                  </Label>

                  <Input
                    id="respondent-contact"
                    type="tel"
                    inputMode="tel"
                    placeholder="09XXXXXXXXX"
                    value={
                      respondentContact
                    }
                    onChange={(event) =>
                      setRespondentContact(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving
                    }
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="respondent-address">
                    Address
                  </Label>

                  <Input
                    id="respondent-address"
                    value={
                      respondentAddress
                    }
                    onChange={(event) =>
                      setRespondentAddress(
                        event.target.value
                      )
                    }
                    disabled={
                      isSaving
                    }
                  />
                </div>
              </div>
            )}
          </section>

          {/* ====================================
              NOTES
          ==================================== */}

          <div className="space-y-2">
            <Label htmlFor="blotter-notes">
              Notes
            </Label>

            <textarea
              id="blotter-notes"
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional internal notes..."
              disabled={
                isSaving
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* ERROR */}

          {formError && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {formError}
            </div>
          )}

          {/* FOOTER */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={
                isSaving
              }
              onClick={() =>
                onOpenChange(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSaving ||
                residentsLoading
              }
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Case"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}