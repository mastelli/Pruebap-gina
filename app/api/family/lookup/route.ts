import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

const CLERK_SECRET = process.env.CLERK_SECRET_KEY
const CLERK_BASE = "https://api.clerk.com/v1"

async function clerkGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${CLERK_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${CLERK_SECRET}`, "Content-Type": "application/json" },
  })
  return { ok: res.ok, status: res.status, data: await res.json() }
}

async function clerkPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${CLERK_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CLERK_SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return { ok: res.ok, status: res.status, data: await res.json() }
}

function extractEmail(user: any): string | null {
  const emails = user.email_addresses ?? user.emailAddresses ?? []
  for (const ea of emails) {
    const addr = typeof ea === "string" ? ea : ea?.email_address ?? ea?.emailAddress
    if (addr) return addr
  }
  return null
}

/* GET /api/family/lookup?email=xxx */
export async function GET(req: NextRequest) {
  const { userId: currentUserId } = await auth()
  if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const email = req.nextUrl.searchParams.get("email")
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  if (!CLERK_SECRET) return NextResponse.json({ found: false, error: "Missing CLERK_SECRET_KEY" })

  const normalizedEmail = email.toLowerCase().trim()

  // Use query param for flexible search (partial match across emails)
  const result = await clerkGet("/users", { query: normalizedEmail, limit: "20" })

  if (!result.ok) {
    return NextResponse.json({ found: false, error: `Clerk API ${result.status}` })
  }

  const users = result.data?.data ?? []

  // Find exact email match
  const matched = users.find((u: any) => {
    const addr = extractEmail(u)
    return addr?.toLowerCase() === normalizedEmail
  })

  if (!matched) {
    return NextResponse.json({ found: false })
  }

  if (matched.id === currentUserId) {
    return NextResponse.json({ found: false, reason: "self" })
  }

  return NextResponse.json({
    found: true,
    userId: matched.id,
    email: extractEmail(matched) ?? normalizedEmail,
    name: [matched.first_name, matched.last_name].filter(Boolean).join(" ") || null,
  })
}

/* POST /api/family/lookup  { email: "xxx", familyId: "xxx", familyName: "xxx" } */
export async function POST(req: NextRequest) {
  const { userId: currentUserId } = await auth()
  if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { email, familyId, familyName } = body as { email?: string; familyId?: string; familyName?: string }

  if (!email || !familyId || !familyName) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  if (!CLERK_SECRET) return NextResponse.json({ error: "Missing CLERK_SECRET_KEY" }, { status: 500 })

  const normalizedEmail = email.toLowerCase().trim()

  // Check if user already exists
  const lookup = await clerkGet("/users", { query: normalizedEmail, limit: "20" })
  if (lookup.ok) {
    const users = lookup.data?.data ?? []
    const matched = users.find((u: any) => extractEmail(u)?.toLowerCase() === normalizedEmail)
    if (matched && matched.id !== currentUserId) {
      return NextResponse.json({
        status: "found",
        userId: matched.id,
        email: extractEmail(matched) ?? normalizedEmail,
        name: [matched.first_name, matched.last_name].filter(Boolean).join(" ") || null,
      })
    }
    if (matched && matched.id === currentUserId) {
      return NextResponse.json({ status: "self" })
    }
  }

  // User not found — send invitation
  const inviteResult = await clerkPost("/invitations", {
    email_address: normalizedEmail,
    redirect_url: `${req.nextUrl.origin}/sign-in`,
    ignore_existing: true,
    public_metadata: { invitedToFamily: familyId, invitedBy: currentUserId },
  })

  if (!inviteResult.ok) {
    const errMsg = inviteResult.data?.errors?.[0]?.message ?? "Failed to send invitation"
    return NextResponse.json({ status: "invite_error", error: errMsg })
  }

  return NextResponse.json({
    status: "invited",
    email: normalizedEmail,
    invitationId: inviteResult.data?.id,
  })
}
