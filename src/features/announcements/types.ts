export type AnnouncementAudience =
  | "all"
  | "residents"
  | "staff"
  | "purok"

export type AnnouncementStatus =
  | "draft"
  | "published"

export interface AnnouncementPurok {
  id: string
  name: string
  code: string | null
}

export interface Announcement {
  id: string

  title: string
  content: string

  audience: AnnouncementAudience

  purok_id: string | null

  status: AnnouncementStatus

  is_pinned: boolean

  publish_at: string | null
  expires_at: string | null

  created_by: string | null

  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at: string | null

  puroks?:
    | AnnouncementPurok
    | null
}

export interface AnnouncementFormInput {
  title: string
  content: string

  audience: AnnouncementAudience

  purok_id:
    | string
    | null

  status: AnnouncementStatus

  is_pinned: boolean

  publish_at?: string
  expires_at?: string
}