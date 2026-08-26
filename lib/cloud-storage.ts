import { getSupabaseClient } from "./supabase"
import { getAuthUserId } from "./auth"

const TABLE = "user_data"

function getClient() {
  return getSupabaseClient()
}

function getUserId(): string | null {
  return getAuthUserId()
}

export async function cloudGet(key: string): Promise<unknown | null> {
  try {
    const uid = getUserId()
    if (!uid) return null
    const db = getClient()
    const { data, error } = await db
      .from(TABLE)
      .select("value")
      .eq("user_id", uid)
      .eq("key", key)
      .maybeSingle()
    if (error) {
      console.error("[cloud] GET failed:", error.message)
      return null
    }
    return data?.value ?? null
  } catch (e) {
    console.error("[cloud] GET error:", e)
    return null
  }
}

export async function cloudSet(key: string, value: unknown): Promise<void> {
  try {
    const uid = getUserId()
    if (!uid) return
    const db = getClient()
    const { error } = await db
      .from(TABLE)
      .upsert({ user_id: uid, key, value }, { onConflict: "user_id,key" })
    if (error) {
      console.error("[cloud] SET failed:", error.message)
    }
  } catch (e) {
    console.error("[cloud] SET error:", e)
  }
}

export async function cloudGetAll(): Promise<Record<string, unknown>> {
  try {
    const uid = getUserId()
    if (!uid) return {}
    const db = getClient()
    const { data, error } = await db
      .from(TABLE)
      .select("key, value")
      .eq("user_id", uid)
    if (error) {
      console.error("[cloud] GET_ALL failed:", error.message)
      return {}
    }
    const result: Record<string, unknown> = {}
    for (const row of data ?? []) result[row.key] = row.value
    return result
  } catch (e) {
    console.error("[cloud] GET_ALL error:", e)
    return {}
  }
}

export async function cloudSetBatch(items: { key: string; value: unknown }[]): Promise<void> {
  try {
    const uid = getUserId()
    if (!uid) return
    if (items.length === 0) return
    const db = getClient()
    const rows = items.map((item) => ({
      user_id: uid,
      key: item.key,
      value: item.value,
    }))
    const { error } = await db
      .from(TABLE)
      .upsert(rows, { onConflict: "user_id,key" })
    if (error) {
      console.error("[cloud] SET_BATCH failed:", error.message)
    }
  } catch (e) {
    console.error("[cloud] SET_BATCH error:", e)
  }
}
