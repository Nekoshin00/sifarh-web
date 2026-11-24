import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

let client: SupabaseClient<Database> | undefined

export function getSupabaseClient() {
  const url = import.meta.env.SUPABASE_URL
  const publishableKey = import.meta.env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) {
    throw new Error(
      "No se encontró SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY en la configuración."
    )
  }

  client ??= createClient<Database>(url, publishableKey)
  return client
}
