import { supabase } from "@/lib/supabase"

import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementFormInput,
  AnnouncementStatus,
} from "@/features/announcements/types"

// ========================================
// TYPES
// ========================================

export interface AnnouncementListFilters {
  search: string

  status:
    | AnnouncementStatus
    | "all"

  audience:
    | AnnouncementAudience
    | "any"

  page: number
  pageSize: number
}

export interface AnnouncementListResult {
  data: Announcement[]
  count: number
}

// ========================================
// HELPERS
// ========================================

function cleanOptional(
  value?: string
) {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}

// ========================================
// GET ALL ANNOUNCEMENTS
//
// Kept for compatibility with any module
// that still requires the complete list.
// ========================================

export async function getAnnouncements(): Promise<
  Announcement[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .select(`
      *,
      puroks:puroks!announcements_purok_id_fkey (
        id,
        name,
        code
      )
    `)
    .is(
      "deleted_at",
      null
    )
    .order(
      "is_pinned",
      {
        ascending: false,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )

  if (error) {
    console.error(
      "Announcements query error:",
      error
    )

    throw error
  }

  return (
    data ?? []
  ) as Announcement[]
}

// ========================================
// GET PAGINATED ANNOUNCEMENTS
// ========================================

export async function getPaginatedAnnouncements(
  filters:
    AnnouncementListFilters
): Promise<AnnouncementListResult> {
  const page =
    Math.max(
      filters.page,
      1
    )

  const pageSize =
    Math.max(
      filters.pageSize,
      1
    )

  const from =
    (page - 1) *
    pageSize

  const to =
    from +
    pageSize -
    1

  const search =
    filters.search
      .trim()
      .replace(
        /[,%()"]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )

  const normalizedSearch =
    search.toLowerCase()

  // ======================================
  // FIND MATCHING PUROKS
  // ======================================

  let purokIds:
    string[] = []

  if (search) {
    const {
      data:
        purokData,
      error:
        purokError,
    } =
      await supabase
        .from("puroks")
        .select("id")
        .is(
          "deleted_at",
          null
        )
        .or(
          [
            `name.ilike.%${search}%`,
            `code.ilike.%${search}%`,
          ].join(",")
        )

    if (purokError) {
      console.error(
        "Announcement purok search error:",
        purokError
      )

      throw purokError
    }

    purokIds =
      (
        purokData ??
        []
      ).map(
        (
          item
        ) =>
          item.id
      )
  }

  // ======================================
  // BASE QUERY
  // ======================================

  let query =
    supabase
      .from(
        "announcements"
      )
      .select(
        `
          *,
          puroks:puroks!announcements_purok_id_fkey (
            id,
            name,
            code
          )
        `,
        {
          count:
            "exact",
        }
      )
      .is(
        "deleted_at",
        null
      )

  // ======================================
  // SEARCH
  // ======================================

  if (search) {
    const conditions = [
      `title.ilike.%${search}%`,
      `content.ilike.%${search}%`,
    ]

    // Match the audience labels that the
    // old client-side search displayed.

    if (
      "everyone".includes(
        normalizedSearch
      ) ||
      normalizedSearch.includes(
        "everyone"
      )
    ) {
      conditions.push(
        "audience.eq.all"
      )
    }

    if (
      "residents".includes(
        normalizedSearch
      ) ||
      normalizedSearch.includes(
        "resident"
      )
    ) {
      conditions.push(
        "audience.eq.residents"
      )
    }

    if (
      "barangay staff".includes(
        normalizedSearch
      ) ||
      normalizedSearch.includes(
        "staff"
      )
    ) {
      conditions.push(
        "audience.eq.staff"
      )
    }

    if (
      "specific purok".includes(
        normalizedSearch
      ) ||
      normalizedSearch.includes(
        "purok"
      )
    ) {
      conditions.push(
        "audience.eq.purok"
      )
    }

    if (
      purokIds.length >
      0
    ) {
      conditions.push(
        `purok_id.in.(${purokIds.join(
          ","
        )})`
      )
    }

    query =
      query.or(
        conditions.join(
          ","
        )
      )
  }

  // ======================================
  // PUBLICATION STATUS FILTER
  // ======================================

  if (
    filters.status !==
    "all"
  ) {
    query =
      query.eq(
        "status",
        filters.status
      )
  }

  // ======================================
  // AUDIENCE FILTER
  // ======================================

  if (
    filters.audience !==
    "any"
  ) {
    query =
      query.eq(
        "audience",
        filters.audience
      )
  }

  // ======================================
  // SORT + PAGINATION
  //
  // Preserve original ordering:
  // pinned first, newest first.
  // ======================================

  const {
    data,
    error,
    count,
  } =
    await query
      .order(
        "is_pinned",
        {
          ascending:
            false,
        }
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        }
      )
      .range(
        from,
        to
      )

  if (error) {
    console.error(
      "Paginated announcements query error:",
      error
    )

    throw error
  }

  return {
    data:
      (
        data ??
        []
      ) as Announcement[],

    count:
      count ?? 0,
  }
}

// ========================================
// CREATE
// ========================================

export async function createAnnouncement(
  input:
    AnnouncementFormInput
): Promise<Announcement> {
  const {
    data:
      userData,
    error:
      userError,
  } =
    await supabase.auth
      .getUser()

  if (userError) {
    throw userError
  }

  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .insert({
      title:
        input.title.trim(),

      content:
        input.content.trim(),

      audience:
        input.audience,

      purok_id:
        input.audience ===
        "purok"
          ? input.purok_id
          : null,

      status:
        input.status,

      is_pinned:
        input.is_pinned,

      publish_at:
        cleanOptional(
          input.publish_at
        ),

      expires_at:
        cleanOptional(
          input.expires_at
        ),

      created_by:
        userData.user
          ?.id ??
        null,

      is_active:
        true,
    })
    .select(`
      *,
      puroks:puroks!announcements_purok_id_fkey (
        id,
        name,
        code
      )
    `)
    .single()

  if (error) {
    console.error(
      "Create announcement error:",
      error
    )

    throw error
  }

  return data as Announcement
}

// ========================================
// UPDATE
// ========================================

export async function updateAnnouncement(
  id: string,
  input:
    AnnouncementFormInput
): Promise<Announcement> {
  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .update({
      title:
        input.title.trim(),

      content:
        input.content.trim(),

      audience:
        input.audience,

      purok_id:
        input.audience ===
        "purok"
          ? input.purok_id
          : null,

      status:
        input.status,

      is_pinned:
        input.is_pinned,

      publish_at:
        cleanOptional(
          input.publish_at
        ),

      expires_at:
        cleanOptional(
          input.expires_at
        ),
    })
    .eq(
      "id",
      id
    )
    .select(`
      *,
      puroks:puroks!announcements_purok_id_fkey (
        id,
        name,
        code
      )
    `)
    .single()

  if (error) {
    console.error(
      "Update announcement error:",
      error
    )

    throw error
  }

  return data as Announcement
}

// ========================================
// ACTIVE / INACTIVE
// ========================================

export async function setAnnouncementStatus(
  id: string,
  isActive: boolean
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("announcements")
    .update({
      is_active:
        isActive,
    })
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Announcement status error:",
      error
    )

    throw error
  }
}

// ========================================
// PUBLISH
// ========================================

export async function publishAnnouncement(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("announcements")
    .update({
      status:
        "published",

      publish_at:
        new Date()
          .toISOString(),
    })
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Publish announcement error:",
      error
    )

    throw error
  }
}

// ========================================
// UNPUBLISH
// ========================================

export async function unpublishAnnouncement(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("announcements")
    .update({
      status:
        "draft",
    })
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Unpublish announcement error:",
      error
    )

    throw error
  }
}

// ========================================
// PIN / UNPIN
// ========================================

export async function setAnnouncementPinned(
  id: string,
  isPinned: boolean
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("announcements")
    .update({
      is_pinned:
        isPinned,
    })
    .eq(
      "id",
      id
    )

  if (error) {
    console.error(
      "Announcement pin error:",
      error
    )

    throw error
  }
}