import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

const PREFERENCE_KEY = "notification_preferences"
const preferenceFields = ["email", "accountActivity", "newFeatures", "marketing"] as const

type PreferenceField = (typeof preferenceFields)[number]
type NotificationPreferences = Record<PreferenceField, boolean>

function isNotificationPreferences(value: unknown): value is NotificationPreferences {
  if (!value || typeof value !== "object") return false
  return preferenceFields.every((field) => typeof (value as Record<string, unknown>)[field] === "boolean")
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let preferences: unknown
  try {
    preferences = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!isNotificationPreferences(preferences)) {
    return NextResponse.json({ error: "Invalid notification preferences" }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db.from("user_data").upsert(
    {
      user_id: userId,
      key: PREFERENCE_KEY,
      value: { ...preferences, updatedAt: new Date().toISOString() },
    },
    { onConflict: "user_id,key" },
  )

  if (error) return NextResponse.json({ error: "Unable to save notification preferences" }, { status: 500 })

  return NextResponse.json({ ok: true })
}
