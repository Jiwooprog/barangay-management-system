export interface Purok {
  id: string
  name: string
  code: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreatePurokInput {
  name: string
  code?: string
  description?: string
}

export interface UpdatePurokInput {
  name?: string
  code?: string
  description?: string
  is_active?: boolean
}