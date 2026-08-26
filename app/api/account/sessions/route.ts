import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const CLERK_API_URL = "https://api.clerk.com/v1/sessions"
const CLERK_SECRET = process.env.CLERK_SECRET_KEY

type ClerkActivity = {
  browser_name?: string
  browserName?: string
  city?: string
  country?: string
  device_type?: string
  deviceType?: string
  ip_address?: string
  ipAddress?: string
  is_mobile?: boolean
  isMobile?: boolean
}

type ClerkSession = {
  id?: string
  status?: string
  created_at?: number
  createdAt?: number
  last_active_at?: number
  lastActiveAt?: number
  latest_activity?: ClerkActivity | null
  latestActivity?: ClerkActivity | null
}

function timestamp(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function sessionSummary(session: ClerkSession) {
  const activity = session.latest_activity ?? session.latestActivity ?? {}

  return {
    id: session.id ?? "",
    status: session.status ?? "unknown",
    createdAt: timestamp(session.created_at ?? session.createdAt),
    lastActiveAt: timestamp(session.last_active_at ?? session.lastActiveAt),
    browserName: activity.browser_name ?? activity.browserName ?? null,
    city: activity.city ?? null,
    country: activity.country ?? null,
    deviceType: activity.device_type ?? activity.deviceType ?? null,
    ipAddress: activity.ip_address ?? activity.ipAddress ?? null,
    isMobile: activity.is_mobile ?? activity.isMobile ?? false,
  }
}

async function getSessions(params: Record<string, string>) {
  const url = new URL(CLERK_API_URL)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CLERK_SECRET}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) throw new Error(`Clerk API ${response.status}`)

  const body = await response.json()
  return Array.isArray(body?.data) ? (body.data as ClerkSession[]) : []
}

export async function GET() {
  const { userId, sessionId } = await auth()

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!CLERK_SECRET) return NextResponse.json({ error: "Server configuration error" }, { status: 500 })

  try {
    const [recentSessions, activeSessions] = await Promise.all([
      getSessions({ user_id: userId, limit: "10" }),
      getSessions({ user_id: userId, status: "active", limit: "500" }),
    ])

    const history = recentSessions
      .filter((session) => session.status !== "pending")
      .sort((a, b) => (b.created_at ?? b.createdAt ?? 0) - (a.created_at ?? a.createdAt ?? 0))
      .slice(0, 3)
      .map(sessionSummary)

    return NextResponse.json(
      {
        history,
        activeSessions: activeSessions.map(sessionSummary),
        currentSessionId: sessionId ?? null,
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Unable to retrieve Clerk sessions", error)
    return NextResponse.json({ error: "Unable to retrieve sessions" }, { status: 502 })
  }
}
