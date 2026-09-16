export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"

export interface ActivityLog {
  id: string
  user_id: string | null
  actor_email: string | null

  action: ActivityAction

  module: string
  entity_type: string

  entity_id: string | null
  entity_label: string | null

  description: string

  changed_fields: string[]

  created_at: string
}

export interface ActivityLogFilters {
  search: string

  module:
    | "ALL"
    | string

  action:
    | "ALL"
    | ActivityAction

  page: number
  pageSize: number
}

export interface ActivityLogsResult {
  data: ActivityLog[]
  count: number
}