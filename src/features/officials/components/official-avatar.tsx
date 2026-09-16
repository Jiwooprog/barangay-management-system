import {
  useEffect,
  useMemo,
  useState,
} from "react"

import { getResidentPhotoUrl } from "@/features/residents/services/resident-photo.service"
import type { OfficialResident } from "@/features/officials/types"

interface OfficialAvatarProps {
  resident: OfficialResident | null | undefined
}

export function OfficialAvatar({
  resident,
}: OfficialAvatarProps) {
  const [photoUrl, setPhotoUrl] =
    useState<string | null>(null)

  const [imageError, setImageError] =
    useState(false)

  const initials = useMemo(() => {
    if (!resident) {
      return "?"
    }

    const first =
      resident.first_name
        ?.charAt(0)
        .toUpperCase() ?? ""

    const last =
      resident.last_name
        ?.charAt(0)
        .toUpperCase() ?? ""

    return `${first}${last}`
  }, [resident])

  useEffect(() => {
    let cancelled = false

    setImageError(false)

    const loadPhoto = async () => {
      if (!resident?.photo_url) {
        setPhotoUrl(null)
        return
      }

      try {
        const url =
          await getResidentPhotoUrl(
            resident.photo_url
          )

        if (!cancelled) {
          setPhotoUrl(url)
        }
      } catch (error) {
        console.error(
          "Unable to load official photo:",
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
  }, [resident?.photo_url])

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
      {photoUrl && !imageError ? (
        <img
          src={photoUrl}
          alt={
            resident
              ? `${resident.first_name} ${resident.last_name}`
              : "Official"
          }
          className="h-full w-full object-cover"
          onError={() =>
            setImageError(true)
          }
        />
      ) : (
        <span className="text-xs font-semibold">
          {initials}
        </span>
      )}
    </div>
  )
}