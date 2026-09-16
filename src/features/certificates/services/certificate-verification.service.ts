import { supabase } from "@/lib/supabase"

import type {
  CertificateVerification,
} from "@/features/certificates/types"

export async function verifyCertificate(
  token: string
): Promise<CertificateVerification | null> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "verify_certificate",
    {
      p_token: token,
    }
  )

  if (error) {
    console.error(
      "Certificate verification error:",
      error
    )

    throw error
  }

  if (
    !data ||
    data.length === 0
  ) {
    return null
  }

  return data[0] as CertificateVerification
}