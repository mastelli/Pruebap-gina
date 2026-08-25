import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

// GET /api/storage?key=xxx — read one key
// GET /api/storage?key=all — read all keys for the user
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const db = getSupabaseAdmin()
  const key = req.nextUrl.searchParams.get("key")

  if (key === "all") {
    const { data, error } = await db
      .from("user_data")
      .select("key, value")
      .eq("user_id", userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const result: Record<string, unknown> = {}
    for (const row of data ?? []) result[row.key] = row.value
    return NextResponse.json(result)
  }

  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

  const { data, error } = await db
    .from("user_data")
    .select("value")
    .eq("user_id", userId)
    .eq("key", key)
    .single()
  if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ value: data?.value ?? null })
}

// POST /api/storage — upsert { key, value } or batch { items: [{ key, value }] }
export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const db = getSupabaseAdmin()
  const body = await req.json()

  if (body.items && Array.isArray(body.items)) {
    const rows = body.items.map((item: { key: string; value: unknown }) => ({
      user_id: userId,
      key: item.key,
      value: item.value,
    }))
    const { error } = await db
      .from("user_data")
      .upsert(rows, { onConflict: "user_id,key" })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (!body.key) return NextResponse.json({ error: "key required" }, { status: 400 })

  const { error } = await db
    .from("user_data")
    .upsert({ user_id: userId, key: body.key, value: body.value }, { onConflict: "user_id,key" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// DELETE /api/storage?key=xxx — delete one key
export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const db = getSupabaseAdmin()
  const key = req.nextUrl.searchParams.get("key")
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 })

  const { error } = await db
    .from("user_data")
    .delete()
    .eq("user_id", userId)
    .eq("key", key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
