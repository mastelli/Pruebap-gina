const API = "/api/storage"

export async function cloudGet(key: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${API}?key=${encodeURIComponent(key)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.value ?? null
  } catch {
    return null
  }
}

export async function cloudSet(key: string, value: unknown): Promise<void> {
  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    })
  } catch {}
}

export async function cloudGetAll(): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${API}?key=all`)
    if (!res.ok) return {}
    return await res.json()
  } catch {
    return {}
  }
}

export async function cloudSetBatch(items: { key: string; value: unknown }[]): Promise<void> {
  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
  } catch {}
}
