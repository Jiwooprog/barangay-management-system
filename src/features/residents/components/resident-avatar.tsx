import { useEffect, useMemo, useState } from "react"

import { getResidentPhotoUrl } from "@/features/residents/services/resident-photo.service"
import type { Resident } from "@/features/residents/types"

interface ResidentAvatarProps {
  resident: Resident
}

export function ResidentAvatar({
  resident,
}: ResidentAvatarProps) {
  const [photoUrl, setPhotoUrl] =
    useState<string | null>(null)

  const initials = useMemo(() => {
    const first =
      resident.first_name
        ?.charAt(0)
        .toUpperCase() ?? ""

    const last =
      resident.last_name
        ?.charAt(0)
        .toUpperCase() ?? ""

    return `${first}${last}`
  }, [
    resident.first_name,
    resident.last_name,
  ])

  useEffect(() => {
    let cancelled = false

    const loadPhoto = async () => {
      if (!resident.photo_url) {
        setPhotoUrl(null)
        return
      }

      try {
        const signedUrl =
          await getResidentPhotoUrl(
            resident.photo_url
          )

        if (!cancelled) {
          setPhotoUrl(signedUrl)
        }
      } catch (error) {
        console.error(
          "Unable to load resident photo:",
          error
        )

        if (!cancelled) {
          setPhotoUrl(null)
        }
      }
    }

    void loadPhoto()

    return () => {
      cancelled = true
    }
  }, [resident.photo_url])

  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border bg-muted">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${resident.first_name} ${resident.last_name}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold">
          {initials || "—"}
        </span>
      )}
    </div>
  )
}