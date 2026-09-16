import { useQuery } from "@tanstack/react-query"

import { getPendingCertificateRequestCount } from "@/features/certificates/services/certificates.service"
import { supabase } from "@/lib/supabase"

export interface DashboardStats {
  residents: number
  households: number
  puroks: number
  pendingRequests: number
}

async function getDashboardStats(): Promise<DashboardStats> {
  const [
    residentsResult,
    householdsResult,
    puroksResult,
    pendingRequests,
  ] = await Promise.all([
    // Residents
    supabase
      .from("residents")
      .select("*", {
        count: "exact",
        head: true,
      })
      .is("deleted_at", null),

    // Households
    supabase
      .from("households")
      .select("*", {
        count: "exact",
        head: true,
      })
      .is("deleted_at", null),

    // Puroks
    supabase
      .from("puroks")
      .select("*", {
        count: "exact",
        head: true,
      })
      .is("deleted_at", null),

    // Pending certificate requests
    getPendingCertificateRequestCount(),
  ])

  if (residentsResult.error) {
    console.error(
      "Dashboard residents count error:",
      residentsResult.error
    )

    throw residentsResult.error
  }

  if (householdsResult.error) {
    console.error(
      "Dashboard households count error:",
      householdsResult.error
    )

    throw householdsResult.error
  }

  if (puroksResult.error) {
    console.error(
      "Dashboard puroks count error:",
      puroksResult.error
    )

    throw puroksResult.error
  }

  return {
    residents:
      residentsResult.count ?? 0,

    households:
      householdsResult.count ?? 0,

    puroks:
      puroksResult.count ?? 0,

    pendingRequests,
  }
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  })
}