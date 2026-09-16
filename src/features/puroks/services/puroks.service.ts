import { supabase } from "@/lib/supabase"

import type {
  CreatePurokInput,
  Purok,
  UpdatePurokInput,
} from "@/features/puroks/types"

export async function getPuroks(): Promise<Purok[]> {
  const { data, error } = await supabase
    .from("puroks")
    .select("*")
    .is("deleted_at", null)
    .order("name", { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createPurok(
  input: CreatePurokInput
): Promise<Purok> {
  const { data, error } = await supabase
    .from("puroks")
    .insert({
      name: input.name.trim(),
      code: input.code?.trim() || null,
      description: input.description?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function updatePurok(
  id: string,
  input: UpdatePurokInput
): Promise<Purok> {
  const { data, error } = await supabase
    .from("puroks")
    .update({
      ...input,
      name: input.name?.trim(),
      code:
        input.code !== undefined
          ? input.code.trim() || null
          : undefined,
      description:
        input.description !== undefined
          ? input.description.trim() || null
          : undefined,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function setPurokStatus(
  id: string,
  isActive: boolean
): Promise<Purok> {
  const { data, error } = await supabase
    .from("puroks")
    .update({
      is_active: isActive,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}