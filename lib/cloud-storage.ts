const API = "/api/storage"

export async function cloudGet(key: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${API}?key=${encodeURIComponent(key)}`)
    if (!res.ok) {
      console.error("[cloud] GET failed:", res.status, await res.text())
      return null
    }
    const data = await res.json()
    return data.value ?? null
  } catch (e) {
    console.error("[cloud] GET error:", e)
    return null
  }
}

export async function cloudSet(key: string, value: unknown): Promise<void> {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })
    if (!res.ok) {
      console.error("[cloud] SET failed:", res.status, await res.text())
    }
  } catch (e) {
    console.error("[cloud] SET error:", e)
  }
}

export async function cloudGetAll(): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${API}?key=all`)
    if (!res.ok) {
      console.error("[cloud] GET_ALL failed:", res.status, await res.text())
      return {}
    }
    return await res.json()
  } catch (e) {
    console.error("[cloud] GET_ALL error:", e)
    return {}
  }
}

export async function cloudSetBatch(items: { key: string; value: unknown }[]): Promise<void> {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
    if (!res.ok) {
      console.error("[cloud] SET_BATCH failed:", res.status, await res.text())
    }
  } catch (e) {
    console.error("[cloud] SET_BATCH error:", e)
  }
}
