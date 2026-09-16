import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react"

import { FilePlus2 } from "lucide-react"

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
} from "@/features/certificates/hooks/use-certificates"

import {
  useCreateMyCertificateRequest,
} from "@/features/resident-portal/hooks/use-resident-portal"

interface ResidentCertificateRequestDialogProps {
  open: boolean
  onOpenChange: (
    open: boolean
  ) => void
}

export function ResidentCertificateRequestDialog({
  open,
  onOpenChange,
}: ResidentCertificateRequestDialogProps) {
  const {
    data: certificateTypes = [],
    isLoading: typesLoading,
  } = useCertificateTypes()

  const createMutation =
    useCreateMyCertificateRequest()

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
    notes,
    setNotes,
  ] = useState("")

  const [
    error,
    setError,
  ] = useState("")

  // ========================================
  // RESET
  // ========================================

  useEffect(() => {
    if (!open) {
      return
    }

    setCertificateTypeId("")
    setPurpose("")
    setBusinessName("")
    setBusinessAddress("")
    setNotes("")
    setError("")
  }, [open])

  // ========================================
  // ACTIVE TYPES
  // ========================================

  const activeCertificateTypes =
    useMemo(() => {
      return certificateTypes.filter(
        (type) =>
          type.is_active &&
          !type.deleted_at
      )
    }, [certificateTypes])

  // ========================================
  // SELECTED TYPE
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
  // TYPE CHANGE
  // ========================================

  const handleTypeChange = (
    value: string
  ) => {
    setCertificateTypeId(
      value
    )

    const selected =
      certificateTypes.find(
        (type) =>
          type.id === value
      )

    if (
      selected?.code !==
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
        "Business name is required."
      )

      return
    }

    if (
      isBusinessClearance &&
      !businessAddress.trim()
    ) {
      setError(
        "Business address is required."
      )

      return
    }

    try {
      setError("")

      await createMutation.mutateAsync({
        certificate_type_id:
          certificateTypeId,

        purpose:
          purpose.trim(),

        business_name:
          isBusinessClearance
            ? businessName.trim()
            : undefined,

        business_address:
          isBusinessClearance
            ? businessAddress.trim()
            : undefined,

        notes:
          notes.trim() ||
          undefined,
      })

      onOpenChange(false)
    } catch (requestError) {
      console.error(
        "Resident certificate request error:",
        requestError
      )

      if (
        typeof requestError ===
          "object" &&
        requestError !== null &&
        "message" in requestError
      ) {
        setError(
          String(
            requestError.message
          )
        )
      } else {
        setError(
          "Unable to submit certificate request."
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Request Certificate
          </DialogTitle>

          <DialogDescription>
            Submit a barangay
            certificate request using
            your resident account.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* CERTIFICATE TYPE */}

          <div className="space-y-2">
            <Label htmlFor="resident-certificate-type">
              Certificate Type
            </Label>

            <select
              id="resident-certificate-type"
              value={
                certificateTypeId
              }
              onChange={(event) =>
                handleTypeChange(
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

              {activeCertificateTypes.map(
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

          {/* FEE */}

          {selectedCertificateType && (
            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Certificate Fee
              </p>

              <p className="mt-1 text-lg font-semibold">
                ₱
                {Number(
                  selectedCertificateType.fee ??
                    0
                ).toFixed(2)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Payment status will
                be handled by
                barangay staff.
              </p>
            </div>
          )}

          {/* PURPOSE */}

          <div className="space-y-2">
            <Label htmlFor="resident-certificate-purpose">
              Purpose
            </Label>

            <textarea
              id="resident-certificate-purpose"
              rows={4}
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

          {/* BUSINESS CLEARANCE */}

          {isBusinessClearance && (
            <section className="space-y-4 rounded-md border p-4">
              <div>
                <h3 className="font-semibold">
                  Business Information
                </h3>

                <p className="text-xs text-muted-foreground">
                  Required for
                  Barangay Business
                  Clearance.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resident-business-name">
                  Business Name
                </Label>

                <Input
                  id="resident-business-name"
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
                <Label htmlFor="resident-business-address">
                  Business Address
                </Label>

                <Input
                  id="resident-business-address"
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

          {/* NOTES */}

          <div className="space-y-2">
            <Label htmlFor="resident-request-notes">
              Additional Notes
            </Label>

            <textarea
              id="resident-request-notes"
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              placeholder="Optional notes"
              disabled={isSaving}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {/* NOTICE */}

          <div className="rounded-md border bg-muted/30 p-4">
            <p className="text-sm font-medium">
              What happens next?
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Your request will be
              submitted as Pending.
              Barangay staff will
              review the request
              before approval and
              issuance.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
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
              disabled={
                isSaving ||
                typesLoading
              }
            >
              <FilePlus2 className="mr-2 h-4 w-4" />

              {isSaving
                ? "Submitting..."
                : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}