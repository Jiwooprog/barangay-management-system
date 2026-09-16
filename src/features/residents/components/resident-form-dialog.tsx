import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useQueryClient } from "@tanstack/react-query"

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

import { useHouseholds } from "@/features/households/hooks/use-households"
import { usePuroks } from "@/features/puroks/hooks/use-puroks"

import {
  useCreateResident,
  useUpdateResident,
} from "@/features/residents/hooks/use-residents"

import {
  deleteResidentPhoto,
  getResidentPhotoUrl,
  uploadResidentPhoto,
  validateResidentPhoto,
} from "@/features/residents/services/resident-photo.service"

import {
  updateResidentPhoto,
} from "@/features/residents/services/residents.service"

import type {
  Resident,
  ResidentFormInput,
} from "@/features/residents/types"

interface ResidentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resident?: Resident | null
}

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const now = new Date()

  const year =
    now.getFullYear()

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0")

  const day =
    String(
      now.getDate()
    ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function ResidentFormDialog({
  open,
  onOpenChange,
  resident,
}: ResidentFormDialogProps) {
  const queryClient = useQueryClient()

  const createMutation = useCreateResident()
  const updateMutation = useUpdateResident()

  const {
    data: puroks = [],
    isLoading: puroksLoading,
  } = usePuroks()

  const {
    data: households = [],
    isLoading: householdsLoading,
  } = useHouseholds()

  // =========================
  // PHOTO STATE
  // =========================

  const [photoFile, setPhotoFile] =
    useState<File | null>(null)

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null)

  const [photoLoading, setPhotoLoading] =
    useState(false)

  // =========================
  // PERSONAL INFORMATION
  // =========================

  const [
    residentNumber,
    setResidentNumber,
  ] = useState("")

  const [
    firstName,
    setFirstName,
  ] = useState("")

  const [
    middleName,
    setMiddleName,
  ] = useState("")

  const [
    lastName,
    setLastName,
  ] = useState("")

  const [
    suffix,
    setSuffix,
  ] = useState("")

  const [
    birthday,
    setBirthday,
  ] = useState("")

  const [
    gender,
    setGender,
  ] = useState<Resident["gender"]>(
    "male"
  )

  const [
    civilStatus,
    setCivilStatus,
  ] = useState("single")

  const [
    birthplace,
    setBirthplace,
  ] = useState("")

  const [
    nationality,
    setNationality,
  ] = useState("Filipino")

  const [
    religion,
    setReligion,
  ] = useState("")

  // =========================
  // EMPLOYMENT / EDUCATION
  // =========================

  const [
    occupation,
    setOccupation,
  ] = useState("")

  const [
    educationalAttainment,
    setEducationalAttainment,
  ] = useState("")

  // =========================
  // CONTACT INFORMATION
  // =========================

  const [
    email,
    setEmail,
  ] = useState("")

  const [
    contactNumber,
    setContactNumber,
  ] = useState("")

  // =========================
  // ADDRESS
  // =========================

  const [
    houseNumber,
    setHouseNumber,
  ] = useState("")

  const [
    street,
    setStreet,
  ] = useState("")

  const [
    purokId,
    setPurokId,
  ] = useState("")

  const [
    householdId,
    setHouseholdId,
  ] = useState("")

  // =========================
  // BARANGAY INFORMATION
  // =========================

  const [
    isVoter,
    setIsVoter,
  ] = useState(false)

  const [
    precinctNumber,
    setPrecinctNumber,
  ] = useState("")

  const [
    is4Ps,
    setIs4Ps,
  ] = useState(false)

  const [
    isPwd,
    setIsPwd,
  ] = useState(false)

  const [
    pwdIdNumber,
    setPwdIdNumber,
  ] = useState("")

  const [
    isSeniorCitizen,
    setIsSeniorCitizen,
  ] = useState(false)

  const [
    seniorCitizenIdNumber,
    setSeniorCitizenIdNumber,
  ] = useState("")

  const [
    isSoloParent,
    setIsSoloParent,
  ] = useState(false)

  const [
    soloParentIdNumber,
    setSoloParentIdNumber,
  ] = useState("")

  const [
    isIndigenousPeople,
    setIsIndigenousPeople,
  ] = useState(false)

  // =========================
  // RESIDENCY
  // =========================

  const [
    residencyStatus,
    setResidencyStatus,
  ] =
    useState<
      Resident["residency_status"]
    >("active")

  const [
    residencyStartDate,
    setResidencyStartDate,
  ] = useState("")

  // =========================
  // EMERGENCY CONTACT
  // =========================

  const [
    emergencyContactName,
    setEmergencyContactName,
  ] = useState("")

  const [
    emergencyContactNumber,
    setEmergencyContactNumber,
  ] = useState("")

  const [
    emergencyContactRelationship,
    setEmergencyContactRelationship,
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
    Boolean(resident)

  const today =
    getTodayDateValue()

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

  // =========================
  // LOAD / RESET FORM
  // =========================

  useEffect(() => {
    setPhotoFile(null)

    if (resident) {
      setResidentNumber(
        resident.resident_number
      )

      setFirstName(
        resident.first_name
      )

      setMiddleName(
        resident.middle_name ?? ""
      )

      setLastName(
        resident.last_name
      )

      setSuffix(
        resident.suffix ?? ""
      )

      setBirthday(
        resident.birthday
      )

      setGender(
        resident.gender
      )

      setCivilStatus(
        resident.civil_status ??
          "single"
      )

      setBirthplace(
        resident.birthplace ?? ""
      )

      setNationality(
        resident.nationality ??
          "Filipino"
      )

      setReligion(
        resident.religion ?? ""
      )

      setOccupation(
        resident.occupation ?? ""
      )

      setEducationalAttainment(
        resident.educational_attainment ??
          ""
      )

      setEmail(
        resident.email ?? ""
      )

      setContactNumber(
        resident.contact_number ?? ""
      )

      setHouseNumber(
        resident.house_number ?? ""
      )

      setStreet(
        resident.street ?? ""
      )

      setPurokId(
        resident.purok_id
      )

      setHouseholdId(
        resident.household_id ?? ""
      )

      setIsVoter(
        resident.is_voter
      )

      setPrecinctNumber(
        resident.precinct_number ?? ""
      )

      setIs4Ps(
        resident.is_4ps
      )

      setIsPwd(
        resident.is_pwd
      )

      setPwdIdNumber(
        resident.pwd_id_number ?? ""
      )

      setIsSeniorCitizen(
        resident.is_senior_citizen
      )

      setSeniorCitizenIdNumber(
        resident
          .senior_citizen_id_number ??
          ""
      )

      setIsSoloParent(
        resident.is_solo_parent
      )

      setSoloParentIdNumber(
        resident
          .solo_parent_id_number ??
          ""
      )

      setIsIndigenousPeople(
        resident
          .is_indigenous_people
      )

      setResidencyStatus(
        resident.residency_status
      )

      setResidencyStartDate(
        resident
          .residency_start_date ??
          ""
      )

      setEmergencyContactName(
        resident
          .emergency_contact_name ??
          ""
      )

      setEmergencyContactNumber(
        resident
          .emergency_contact_number ??
          ""
      )

      setEmergencyContactRelationship(
        resident
          .emergency_contact_relationship ??
          ""
      )

      setNotes(
        resident.notes ?? ""
      )
    } else {
      setResidentNumber("")
      setFirstName("")
      setMiddleName("")
      setLastName("")
      setSuffix("")

      setBirthday("")
      setGender("male")
      setCivilStatus("single")

      setBirthplace("")
      setNationality("Filipino")
      setReligion("")

      setOccupation("")
      setEducationalAttainment("")

      setEmail("")
      setContactNumber("")

      setHouseNumber("")
      setStreet("")

      setPurokId("")
      setHouseholdId("")

      setIsVoter(false)
      setPrecinctNumber("")

      setIs4Ps(false)

      setIsPwd(false)
      setPwdIdNumber("")

      setIsSeniorCitizen(false)
      setSeniorCitizenIdNumber("")

      setIsSoloParent(false)
      setSoloParentIdNumber("")

      setIsIndigenousPeople(false)

      setResidencyStatus("active")
      setResidencyStartDate("")

      setEmergencyContactName("")
      setEmergencyContactNumber("")
      setEmergencyContactRelationship("")

      setNotes("")
    }

    setError("")
  }, [
    resident,
    open,
  ])

  // =========================
  // LOAD EXISTING PHOTO
  // =========================

  useEffect(() => {
    let cancelled = false

    let objectUrl:
      | string
      | null = null

    const loadPhoto =
      async () => {
        if (!open) {
          return
        }

        if (photoFile) {
          objectUrl =
            URL.createObjectURL(
              photoFile
            )

          if (!cancelled) {
            setPhotoPreview(
              objectUrl
            )
          }

          return
        }

        if (resident?.photo_url) {
          try {
            const signedUrl =
              await getResidentPhotoUrl(
                resident.photo_url
              )

            if (!cancelled) {
              setPhotoPreview(
                signedUrl
              )
            }
          } catch (photoError) {
            console.error(
              "Unable to load resident photo:",
              photoError
            )

            if (!cancelled) {
              setPhotoPreview(null)
            }
          }

          return
        }

        setPhotoPreview(null)
      }

    void loadPhoto()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        )
      }
    }
  }, [
    resident?.photo_url,
    photoFile,
    open,
  ])

  // =========================
  // FILTER PUROKS
  // =========================

  const availablePuroks =
    useMemo(
      () =>
        puroks.filter(
          (purok) =>
            purok.is_active ||
            purok.id === purokId
        ),
      [
        puroks,
        purokId,
      ]
    )

  // =========================
  // FILTER HOUSEHOLDS
  // =========================

  const availableHouseholds =
    useMemo(
      () =>
        households.filter(
          (household) =>
            household.purok_id ===
              purokId &&
            (
              household.is_active ||
              household.id ===
                householdId
            )
        ),
      [
        households,
        purokId,
        householdId,
      ]
    )

  // =========================
  // PUROK CHANGE
  // =========================

  const handlePurokChange = (
    newPurokId: string
  ) => {
    setPurokId(
      newPurokId
    )

    const selectedHousehold =
      households.find(
        (household) =>
          household.id ===
          householdId
      )

    if (
      selectedHousehold &&
      selectedHousehold.purok_id !==
        newPurokId
    ) {
      setHouseholdId("")
    }
  }

  // =========================
  // PHOTO CHANGE
  // =========================

  const handlePhotoChange = (
    event:
      ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      setPhotoFile(null)
      return
    }

    try {
      validateResidentPhoto(
        file
      )

      setPhotoFile(
        file
      )

      setError("")
    } catch (photoError) {
      setPhotoFile(null)

      setError(
        photoError instanceof Error
          ? photoError.message
          : "Invalid photo."
      )

      event.target.value = ""
    }
  }

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (
      !residentNumber.trim()
    ) {
      setError(
        "Resident number is required."
      )

      return
    }

    if (
      !firstName.trim()
    ) {
      setError(
        "First name is required."
      )

      return
    }

    if (
      !lastName.trim()
    ) {
      setError(
        "Last name is required."
      )

      return
    }

    if (!birthday) {
      setError(
        "Birthday is required."
      )

      return
    }

    if (
      birthday > today
    ) {
      setError(
        "Birthday cannot be in the future."
      )

      return
    }

    if (!purokId) {
      setError(
        "Please select a purok."
      )

      return
    }

    const cleanedEmail =
      email.trim()

    if (
      cleanedEmail &&
      !EMAIL_PATTERN.test(
        cleanedEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      )

      return
    }

    const cleanedContact =
      normalizePhone(
        contactNumber
      )

    if (
      cleanedContact &&
      !PH_MOBILE_PATTERN.test(
        cleanedContact
      )
    ) {
      setError(
        "Contact number must use 09XXXXXXXXX or +639XXXXXXXXX format."
      )

      return
    }

    if (
      isVoter &&
      !precinctNumber.trim()
    ) {
      setError(
        "Precinct number is required for a registered voter."
      )

      return
    }

    if (
      isPwd &&
      !pwdIdNumber.trim()
    ) {
      setError(
        "PWD ID number is required when PWD is selected."
      )

      return
    }

    if (
      isSeniorCitizen &&
      !seniorCitizenIdNumber.trim()
    ) {
      setError(
        "Senior Citizen ID number is required when Senior Citizen is selected."
      )

      return
    }

    if (
      isSoloParent &&
      !soloParentIdNumber.trim()
    ) {
      setError(
        "Solo Parent ID number is required when Solo Parent is selected."
      )

      return
    }

    if (
      residencyStartDate &&
      residencyStartDate > today
    ) {
      setError(
        "Residency start date cannot be in the future."
      )

      return
    }

    const hasEmergencyInfo =
      Boolean(
        emergencyContactName.trim() ||
          emergencyContactNumber.trim() ||
          emergencyContactRelationship.trim()
      )

    if (
      hasEmergencyInfo &&
      (
        !emergencyContactName.trim() ||
        !emergencyContactNumber.trim() ||
        !emergencyContactRelationship.trim()
      )
    ) {
      setError(
        "Complete the emergency contact name, number, and relationship."
      )

      return
    }

    const cleanedEmergencyNumber =
      normalizePhone(
        emergencyContactNumber
      )

    if (
      cleanedEmergencyNumber &&
      !PH_MOBILE_PATTERN.test(
        cleanedEmergencyNumber
      )
    ) {
      setError(
        "Emergency contact number must use 09XXXXXXXXX or +639XXXXXXXXX format."
      )

      return
    }

    setError("")

    const input:
      ResidentFormInput = {
      resident_number:
        residentNumber.trim(),

      first_name:
        firstName.trim(),

      middle_name:
        middleName.trim(),

      last_name:
        lastName.trim(),

      suffix:
        suffix.trim(),

      birthday,

      gender,

      civil_status:
        civilStatus,

      birthplace:
        birthplace.trim(),

      nationality:
        nationality.trim(),

      religion:
        religion.trim(),

      occupation:
        occupation.trim(),

      educational_attainment:
        educationalAttainment.trim(),

      email:
        cleanedEmail,

      contact_number:
        cleanedContact,

      house_number:
        houseNumber.trim(),

      street:
        street.trim(),

      purok_id:
        purokId,

      household_id:
        householdId || null,

      is_voter:
        isVoter,

      precinct_number:
        isVoter
          ? precinctNumber.trim()
          : "",

      is_4ps:
        is4Ps,

      is_pwd:
        isPwd,

      pwd_id_number:
        isPwd
          ? pwdIdNumber.trim()
          : "",

      is_senior_citizen:
        isSeniorCitizen,

      senior_citizen_id_number:
        isSeniorCitizen
          ? seniorCitizenIdNumber.trim()
          : "",

      is_solo_parent:
        isSoloParent,

      solo_parent_id_number:
        isSoloParent
          ? soloParentIdNumber.trim()
          : "",

      is_indigenous_people:
        isIndigenousPeople,

      residency_status:
        residencyStatus,

      residency_start_date:
        residencyStartDate,

      emergency_contact_name:
        emergencyContactName.trim(),

      emergency_contact_number:
        cleanedEmergencyNumber,

      emergency_contact_relationship:
        emergencyContactRelationship.trim(),

      notes:
        notes.trim(),
    }

    try {
      let savedResident:
        Resident

      if (resident) {
        savedResident =
          await updateMutation.mutateAsync(
            {
              id: resident.id,
              input,
            }
          )
      } else {
        savedResident =
          await createMutation.mutateAsync(
            input
          )
      }

      // =========================
      // UPLOAD PHOTO
      // =========================

      if (photoFile) {
        setPhotoLoading(true)

        const oldPhotoPath =
          resident?.photo_url

        const newPhotoPath =
          await uploadResidentPhoto(
            savedResident.id,
            photoFile
          )

        await updateResidentPhoto(
          savedResident.id,
          newPhotoPath
        )

        // Delete previous photo if
        // extension/path changed.
        if (
          oldPhotoPath &&
          oldPhotoPath !==
            newPhotoPath
        ) {
          try {
            await deleteResidentPhoto(
              oldPhotoPath
            )
          } catch (
            deleteError
          ) {
            console.error(
              "Unable to delete old resident photo:",
              deleteError
            )
          }
        }

        await queryClient.invalidateQueries(
          {
            queryKey: [
              "residents",
            ],
          }
        )
      }

      onOpenChange(false)
    } catch (saveError) {
      console.error(
        "Resident save error:",
        saveError
      )

      if (
        typeof saveError ===
          "object" &&
        saveError !== null &&
        "message" in saveError
      ) {
        setError(
          String(
            saveError.message
          )
        )
      } else {
        setError(
          "Unable to save resident."
        )
      }
    } finally {
      setPhotoLoading(false)
    }
  }

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    photoLoading

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Resident"
              : "Add Resident"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the resident information."
              : "Register a new barangay resident."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >
          {/* =====================
              PHOTO
          ====================== */}

          <section className="space-y-4">
            <h3 className="font-semibold">
              Resident Photo
            </h3>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {photoPreview ? (
                  <img
                    src={
                      photoPreview
                    }
                    alt="Resident preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-xs text-muted-foreground">
                    No Photo
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <Label htmlFor="resident-photo">
                  Upload Photo
                </Label>

                <Input
                  id="resident-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handlePhotoChange
                  }
                  disabled={
                    isSaving
                  }
                />

                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WEBP.
                  Maximum 5 MB.
                </p>
              </div>
            </div>
          </section>

          {/* =====================
              PERSONAL INFORMATION
          ====================== */}

          <section className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">
              Personal Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resident-number">
                  Resident Number
                </Label>

                <Input
                  id="resident-number"
                  placeholder="RES-0005"
                  value={
                    residentNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setResidentNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="first-name">
                  First Name
                </Label>

                <Input
                  id="first-name"
                  value={
                    firstName
                  }
                  onChange={(
                    event
                  ) =>
                    setFirstName(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middle-name">
                  Middle Name
                </Label>

                <Input
                  id="middle-name"
                  value={
                    middleName
                  }
                  onChange={(
                    event
                  ) =>
                    setMiddleName(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name">
                  Last Name
                </Label>

                <Input
                  id="last-name"
                  value={
                    lastName
                  }
                  onChange={(
                    event
                  ) =>
                    setLastName(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suffix">
                  Suffix
                </Label>

                <Input
                  id="suffix"
                  placeholder="Jr., Sr., III"
                  value={
                    suffix
                  }
                  onChange={(
                    event
                  ) =>
                    setSuffix(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">
                  Birthday
                </Label>

                <Input
                  id="birthday"
                  type="date"
                  max={today}
                  value={
                    birthday
                  }
                  onChange={(
                    event
                  ) =>
                    setBirthday(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender
                </Label>

                <select
                  id="gender"
                  value={
                    gender
                  }
                  onChange={(
                    event
                  ) =>
                    setGender(
                      event.target
                        .value as Resident["gender"]
                    )
                  }
                  disabled={
                    isSaving
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="male">
                    Male
                  </option>

                  <option value="female">
                    Female
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="civil-status">
                  Civil Status
                </Label>

                <select
                  id="civil-status"
                  value={
                    civilStatus
                  }
                  onChange={(
                    event
                  ) =>
                    setCivilStatus(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="single">
                    Single
                  </option>

                  <option value="married">
                    Married
                  </option>

                  <option value="widowed">
                    Widowed
                  </option>

                  <option value="separated">
                    Separated
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthplace">
                  Birthplace
                </Label>

                <Input
                  id="birthplace"
                  value={
                    birthplace
                  }
                  onChange={(
                    event
                  ) =>
                    setBirthplace(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">
                  Nationality
                </Label>

                <Input
                  id="nationality"
                  value={
                    nationality
                  }
                  onChange={(
                    event
                  ) =>
                    setNationality(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="religion">
                  Religion
                </Label>

                <Input
                  id="religion"
                  value={
                    religion
                  }
                  onChange={(
                    event
                  ) =>
                    setReligion(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>
            </div>
          </section>

          {/* =====================
              CONTACT & ADDRESS
          ====================== */}

          <section className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">
              Contact & Address
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-number">
                  Contact Number
                </Label>

                <Input
                  id="contact-number"
                  placeholder="09XXXXXXXXX"
                  value={
                    contactNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setContactNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="house-number">
                  House Number
                </Label>

                <Input
                  id="house-number"
                  value={
                    houseNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setHouseNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">
                  Street
                </Label>

                <Input
                  id="street"
                  value={
                    street
                  }
                  onChange={(
                    event
                  ) =>
                    setStreet(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resident-purok">
                  Purok
                </Label>

                <select
                  id="resident-purok"
                  value={
                    purokId
                  }
                  onChange={(
                    event
                  ) =>
                    handlePurokChange(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving ||
                    puroksLoading
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">
                    {puroksLoading
                      ? "Loading puroks..."
                      : "Select purok"}
                  </option>

                  {availablePuroks.map(
                    (purok) => (
                      <option
                        key={
                          purok.id
                        }
                        value={
                          purok.id
                        }
                      >
                        {purok.name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resident-household">
                  Household
                </Label>

                <select
                  id="resident-household"
                  value={
                    householdId
                  }
                  onChange={(
                    event
                  ) =>
                    setHouseholdId(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving ||
                    householdsLoading ||
                    !purokId
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">
                    {householdsLoading
                      ? "Loading households..."
                      : "No household"}
                  </option>

                  {availableHouseholds.map(
                    (
                      household
                    ) => (
                      <option
                        key={
                          household.id
                        }
                        value={
                          household.id
                        }
                      >
                        {
                          household.household_number
                        }
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* =====================
              BARANGAY INFO
          ====================== */}

          <section className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">
              Barangay Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    isVoter
                  }
                  onChange={(
                    event
                  ) =>
                    setIsVoter(
                      event.target
                        .checked
                    )
                  }
                  disabled={
                    isSaving
                  }
                />

                Registered Voter
              </label>

              {isVoter && (
                <Input
                  placeholder="Precinct Number"
                  value={
                    precinctNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setPrecinctNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    is4Ps
                  }
                  onChange={(
                    event
                  ) =>
                    setIs4Ps(
                      event.target
                        .checked
                    )
                  }
                  disabled={
                    isSaving
                  }
                />

                4Ps Beneficiary
              </label>

              <div />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    isPwd
                  }
                  onChange={(
                    event
                  ) =>
                    setIsPwd(
                      event.target
                        .checked
                    )
                  }
                  disabled={
                    isSaving
                  }
                />

                PWD
              </label>

              {isPwd && (
                <Input
                  placeholder="PWD ID Number"
                  value={
                    pwdIdNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setPwdIdNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    isSeniorCitizen
                  }
                  onChange={(
                    event
                  ) =>
                    setIsSeniorCitizen(
                      event.target
                        .checked
                    )
                  }
                  disabled={
                    isSaving
                  }
                />

                Senior Citizen
              </label>

              {isSeniorCitizen && (
                <Input
                  placeholder="Senior Citizen ID"
                  value={
                    seniorCitizenIdNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setSeniorCitizenIdNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    isSoloParent
                  }
                  onChange={(
                    event
                  ) =>
                    setIsSoloParent(
                      event.target
                        .checked
                    )
                  }
                  disabled={
                    isSaving
                  }
                />

                Solo Parent
              </label>

              {isSoloParent && (
                <Input
                  placeholder="Solo Parent ID"
                  value={
                    soloParentIdNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setSoloParentIdNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    isIndigenousPeople
                  }
                  onChange={(
                    event
                  ) =>
                    setIsIndigenousPeople(
                      event.target
                        .checked
                    )
                  }
                  disabled={
                    isSaving
                  }
                />

                Indigenous People
              </label>
            </div>
          </section>

          {/* =====================
              OTHER INFO
          ====================== */}

          <section className="space-y-4 border-t pt-5">
            <h3 className="font-semibold">
              Other Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="occupation">
                  Occupation
                </Label>

                <Input
                  id="occupation"
                  value={
                    occupation
                  }
                  onChange={(
                    event
                  ) =>
                    setOccupation(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">
                  Educational
                  Attainment
                </Label>

                <Input
                  id="education"
                  value={
                    educationalAttainment
                  }
                  onChange={(
                    event
                  ) =>
                    setEducationalAttainment(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residency-status">
                  Residency Status
                </Label>

                <select
                  id="residency-status"
                  value={
                    residencyStatus
                  }
                  onChange={(
                    event
                  ) =>
                    setResidencyStatus(
                      event.target
                        .value as Resident["residency_status"]
                    )
                  }
                  disabled={
                    isSaving
                  }
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="transferred">
                    Transferred
                  </option>

                  <option value="deceased">
                    Deceased
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="residency-start">
                  Residency Start
                  Date
                </Label>

                <Input
                  id="residency-start"
                  type="date"
                  max={today}
                  value={
                    residencyStartDate
                  }
                  onChange={(
                    event
                  ) =>
                    setResidencyStartDate(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-name">
                  Emergency Contact
                  Name
                </Label>

                <Input
                  id="emergency-name"
                  value={
                    emergencyContactName
                  }
                  onChange={(
                    event
                  ) =>
                    setEmergencyContactName(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-number">
                  Emergency Contact
                  Number
                </Label>

                <Input
                  id="emergency-number"
                  value={
                    emergencyContactNumber
                  }
                  onChange={(
                    event
                  ) =>
                    setEmergencyContactNumber(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="emergency-relationship">
                  Emergency Contact
                  Relationship
                </Label>

                <Input
                  id="emergency-relationship"
                  value={
                    emergencyContactRelationship
                  }
                  onChange={(
                    event
                  ) =>
                    setEmergencyContactRelationship(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="resident-notes">
                  Notes
                </Label>

                <textarea
                  id="resident-notes"
                  rows={3}
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSaving
                  }
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>
            </div>
          </section>

          {/* ERROR */}

          {error && (
            <div
              ref={errorRef}
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive"
            >
              {error}
            </div>
          )}

          {/* BUTTONS */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onOpenChange(
                  false
                )
              }
              disabled={
                isSaving
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSaving
              }
            >
              {isSaving
                ? photoLoading
                  ? "Uploading Photo..."
                  : "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Resident"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}