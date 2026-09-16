import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

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
  useCertificateTypes,
  useCreateCertificateRequest,
} from "@/features/certificates/hooks/use-certificates"

import type {
  CertificatePaymentStatus,
  CreateCertificateRequestInput,
} from "@/features/certificates/types"

import { useResidents } from "@/features/residents/hooks/use-residents"

interface CertificateRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getResidentName(
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

export function CertificateRequestDialog({
  open,
  onOpenChange,
}: CertificateRequestDialogProps) {
  const {
    data: residents = [],
    isLoading: residentsLoading,
  } = useResidents()

  const {
    data: certificateTypes = [],
    isLoading: typesLoading,
  } = useCertificateTypes()

  const createMutation =
    useCreateCertificateRequest()

  const [
    residentId,
    setResidentId,
  ] = useState("")

  const [
    certificateTypeId,
    setCertificateTypeId,
  ] = useState("")

  const [
    purpose,
    setPurpose,
  ] = useState("")

  const [
    businessName,
    setBusinessName,
  ] = useState("")

  const [
    businessAddress,
    setBusinessAddress,
  ] = useState("")

  const [
    paymentStatus,
    setPaymentStatus,
  ] =
    useState<CertificatePaymentStatus>(
      "unpaid"
    )

  const [
    amount,
    setAmount,
  ] = useState("0")

  const [
    paymentReference,
    setPaymentReference,
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

  // ========================================
  // RESET FORM
  // ========================================

  useEffect(() => {
    if (!open) {
      return
    }

    setResidentId("")
    setCertificateTypeId("")
    setPurpose("")

    setBusinessName("")
    setBusinessAddress("")

    setPaymentStatus("unpaid")
    setAmount("0")
    setPaymentReference("")

    setNotes("")
    setError("")
  }, [open])

  // ========================================
  // ACTIVE RESIDENTS
  // ========================================

  const availableResidents =
    useMemo(() => {
      return residents
        .filter(
          (resident) =>
            resident.is_active &&
            resident.residency_status ===
              "active"
        )
        .sort((a, b) => {
          const lastNameCompare =
            a.last_name.localeCompare(
              b.last_name
            )

          if (
            lastNameCompare !== 0
          ) {
            return lastNameCompare
          }

          return a.first_name.localeCompare(
            b.first_name
          )
        })
    }, [residents])

  // ========================================
  // ACTIVE CERTIFICATE TYPES
  // ========================================

  const availableCertificateTypes =
    useMemo(() => {
      return certificateTypes.filter(
        (type) =>
          type.is_active
      )
    }, [certificateTypes])

  // ========================================
  // SELECTED CERTIFICATE TYPE
  // ========================================

  const selectedCertificateType =
    useMemo(() => {
      return (
        certificateTypes.find(
          (type) =>
            type.id ===
            certificateTypeId
        ) ?? null
      )
    }, [
      certificateTypes,
      certificateTypeId,
    ])

  const isBusinessClearance =
    selectedCertificateType?.code ===
    "BUSINESS_CLEARANCE"

  // ========================================
  // CERTIFICATE TYPE CHANGE
  // ========================================

  const handleCertificateTypeChange = (
    typeId: string
  ) => {
    setCertificateTypeId(typeId)

    const selectedType =
      certificateTypes.find(
        (type) =>
          type.id === typeId
      )

    const fee =
      Number(
        selectedType?.fee ?? 0
      )

    setAmount(
      String(fee)
    )

    if (fee <= 0) {
      setPaymentStatus(
        "waived"
      )
    } else {
      setPaymentStatus(
        "unpaid"
      )
    }

    setPaymentReference("")

    if (
      selectedType?.code !==
      "BUSINESS_CLEARANCE"
    ) {
      setBusinessName("")
      setBusinessAddress("")
    }
  }

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!residentId) {
      setError(
        "Please select a resident."
      )

      return
    }

    if (!certificateTypeId) {
      setError(
        "Please select a certificate type."
      )

      return
    }

    if (!purpose.trim()) {
      setError(
        "Purpose is required."
      )

      return
    }

    if (
      isBusinessClearance &&
      !businessName.trim()
    ) {
      setError(
        "Business name is required for a Barangay Business Clearance."
      )

      return
    }

    if (
      isBusinessClearance &&
      !businessAddress.trim()
    ) {
      setError(
        "Business address is required for a Barangay Business Clearance."
      )

      return
    }

    const amountValue =
      amount.trim()

    const numericAmount =
      Number(amountValue)

    if (
      !amountValue ||
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount < 0
    ) {
      setError(
        "Amount must be a valid number that is 0 or greater."
      )

      return
    }

    setError("")

    const input:
      CreateCertificateRequestInput = {
      resident_id:
        residentId,

      certificate_type_id:
        certificateTypeId,

      purpose:
        purpose.trim(),

      business_name:
        isBusinessClearance
          ? businessName.trim()
          : "",

      business_address:
        isBusinessClearance
          ? businessAddress.trim()
          : "",

      payment_status:
        paymentStatus,

      amount:
        numericAmount,

      payment_reference:
        paymentReference.trim(),

      notes:
        notes.trim(),
    }

    try {
      await createMutation.mutateAsync(
        input
      )

      onOpenChange(false)
    } catch (saveError) {
      console.error(
        "Certificate request save error:",
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
          "Unable to create certificate request."
        )
      }
    }
  }

  const isSaving =
    createMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            New Certificate Request
          </DialogTitle>

          <DialogDescription>
            Create a certificate
            request for a barangay
            resident.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* =========================
              RESIDENT
          ========================= */}

          <div className="space-y-2">
            <Label htmlFor="certificate-resident">
              Resident
            </Label>

            <select
              id="certificate-resident"
              value={residentId}
              onChange={(event) =>
                setResidentId(
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

              {availableResidents.map(
                (resident) => (
                  <option
                    key={resident.id}
                    value={resident.id}
                  >
                    {getResidentName(
                      resident.first_name,
                      resident.middle_name,
                      resident.last_name,
                      resident.suffix
                    )}{" "}
                    (
                    {
                      resident.resident_number
                    }
                    )
                  </option>
                )
              )}
            </select>

            {!residentsLoading &&
              availableResidents.length ===
                0 && (
                <p className="text-xs text-muted-foreground">
                  No active
                  residents are
                  available.
                </p>
              )}
          </div>

          {/* =========================
              CERTIFICATE TYPE
          ========================= */}

          <div className="space-y-2">
            <Label htmlFor="certificate-type">
              Certificate Type
            </Label>

            <select
              id="certificate-type"
              value={
                certificateTypeId
              }
              onChange={(event) =>
                handleCertificateTypeChange(
                  event.target.value
                )
              }
              disabled={
                isSaving ||
                typesLoading
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">
                {typesLoading
                  ? "Loading certificate types..."
                  : "Select certificate type"}
              </option>

              {availableCertificateTypes.map(
                (type) => (
                  <option
                    key={type.id}
                    value={type.id}
                  >
                    {type.name}
                  </option>
                )
              )}
            </select>

            {selectedCertificateType
              ?.description && (
              <p className="text-xs text-muted-foreground">
                {
                  selectedCertificateType.description
                }
              </p>
            )}
          </div>

          {/* =========================
              PURPOSE
          ========================= */}

          <div className="space-y-2">
            <Label htmlFor="certificate-purpose">
              Purpose
            </Label>

            <textarea
              id="certificate-purpose"
              rows={3}
              value={purpose}
              onChange={(event) =>
                setPurpose(
                  event.target.value
                )
              }
              placeholder="Example: Employment requirement"
              disabled={isSaving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* =========================
              BUSINESS CLEARANCE
          ========================= */}

          {isBusinessClearance && (
            <section className="space-y-4 rounded-md border p-4">
              <div>
                <h3 className="font-semibold">
                  Business Information
                </h3>

                <p className="text-xs text-muted-foreground">
                  Required for Barangay
                  Business Clearance.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-name">
                  Business Name
                </Label>

                <Input
                  id="business-name"
                  value={
                    businessName
                  }
                  onChange={(event) =>
                    setBusinessName(
                      event.target.value
                    )
                  }
                  placeholder="Business name"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-address">
                  Business Address
                </Label>

                <Input
                  id="business-address"
                  value={
                    businessAddress
                  }
                  onChange={(event) =>
                    setBusinessAddress(
                      event.target.value
                    )
                  }
                  placeholder="Business address"
                  disabled={isSaving}
                />
              </div>
            </section>
          )}

          {/* =========================
              PAYMENT
          ========================= */}

          <section className="space-y-4 border-t pt-5">
            <div>
              <h3 className="font-semibold">
                Payment Information
              </h3>

              <p className="text-xs text-muted-foreground">
                Record the applicable
                certificate fee and
                payment status.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-status">
                  Payment Status
                </Label>

                <select
                  id="payment-status"
                  value={
                    paymentStatus
                  }
                  onChange={(event) =>
                    setPaymentStatus(
                      event.target
                        .value as CertificatePaymentStatus
                    )
                  }
                  disabled={isSaving}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="unpaid">
                    Unpaid
                  </option>

                  <option value="paid">
                    Paid
                  </option>

                  <option value="waived">
                    Waived
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate-amount">
                  Amount
                </Label>

                <Input
                  id="certificate-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="payment-reference">
                  Payment Reference
                </Label>

                <Input
                  id="payment-reference"
                  value={
                    paymentReference
                  }
                  onChange={(event) =>
                    setPaymentReference(
                      event.target.value
                    )
                  }
                  placeholder="Optional receipt / reference number"
                  disabled={isSaving}
                />
              </div>
            </div>
          </section>

          {/* =========================
              NOTES
          ========================= */}

          <div className="space-y-2">
            <Label htmlFor="certificate-notes">
              Notes
            </Label>

            <textarea
              id="certificate-notes"
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional internal notes"
              disabled={isSaving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

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
              disabled={isSaving}
              onClick={() =>
                onOpenChange(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? "Creating..."
                : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}