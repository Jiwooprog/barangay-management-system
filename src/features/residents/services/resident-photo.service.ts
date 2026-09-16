import { supabase } from "@/lib/supabase"

const BUCKET = "resident-photos"

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

const MAX_FILE_SIZE = 5 * 1024 * 1024

export function validateResidentPhoto(
  file: File
) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Only JPG, PNG, and WEBP images are allowed."
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Photo must not exceed 5 MB."
    )
  }
}

function getExtension(file: File) {
  const extension =
    file.name.split(".").pop()?.toLowerCase()

  if (extension) {
    return extension
  }

  if (file.type === "image/png") {
    return "png"
  }

  if (file.type === "image/webp") {
    return "webp"
  }

  return "jpg"
}

export async function uploadResidentPhoto(
  residentId: string,
  file: File
): Promise<string> {
  validateResidentPhoto(file)

  const extension = getExtension(file)

  const path =
    `${residentId}/profile.${extension}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    console.error(
      "Resident photo upload error:",
      error
    )

    throw error
  }

  return path
}

export async function getResidentPhotoUrl(
  path: string
): Promise<string> {
  const { data, error } =
    await supabase.storage
      .from(BUCKET)
      .createSignedUrl(
        path,
        60 * 60
      )

  if (error) {
    throw error
  }

  return data.signedUrl
}

export async function deleteResidentPhoto(
  path: string
): Promise<void> {
  const { error } =
    await supabase.storage
      .from(BUCKET)
      .remove([path])

  if (error) {
    throw error
  }
}

export async function updateResidentPhoto(
  residentId: string,
  photoPath: string | null
): Promise<void> {
  const { error } = await supabase
    .from("residents")
    .update({
      photo_url: photoPath,
    })
    .eq("id", residentId)

  if (error) {
    console.error(
      "Update resident photo error:",
      error
    )

    throw error
  }
}