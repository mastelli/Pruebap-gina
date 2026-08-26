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

  try {
    const result = await clerkGet("/users", { query: normalizedEmail, limit: "20" })

    if (!result.ok) {
      return NextResponse.json({ found: false, error: `Clerk API ${result.status}` })
    }

    const users = result.data?.data ?? []
    const matched = users.find((u: any) => extractEmail(u)?.toLowerCase() === normalizedEmail)

    if (!matched) return NextResponse.json({ found: false })
    if (matched.id === currentUserId) return NextResponse.json({ found: false, reason: "self" })

    return NextResponse.json({
      found: true,
      userId: matched.id,
      email: extractEmail(matched) ?? normalizedEmail,
      name: [matched.first_name, matched.last_name].filter(Boolean).join(" ") || null,
    })
  } catch (error) {
    return NextResponse.json({ found: false, error: String(error) })
  }
}

/* POST /api/family/lookup  { action: "lookup"|"invite", email, familyId, familyName } */
export async function POST(req: NextRequest) {
  const { userId: currentUserId } = await auth()
  if (!currentUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { action, email, familyId, familyName } = body as {
    action?: string
    email?: string
    familyId?: string
    familyName?: string
  }

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 })
  if (!CLERK_SECRET) return NextResponse.json({ error: "Missing CLERK_SECRET_KEY" }, { status: 500 })

  const normalizedEmail = email.toLowerCase().trim()

  // Step 1: Try to find existing user
  try {
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
  } catch {
    // Clerk failed, fall through to pending
  }

  // Step 2: User not found — try to create invitation (may fail in test mode)
  let inviteUrl: string | null = null
  try {
    const inviteResult = await clerkPost("/invitations", {
      email_address: normalizedEmail,
      redirect_url: `${req.nextUrl.origin}/sign-in`,
      ignore_existing: true,
      public_metadata: { invitedToFamily: familyId ?? "", invitedBy: currentUserId },
    })

    if (inviteResult.ok && inviteResult.data?.url) {
      inviteUrl = inviteResult.data.url
    }
  } catch {
    // Invitation failed, that's fine — we'll add as pending
  }

  return NextResponse.json({
    status: "not_found",
    email: normalizedEmail,
    inviteUrl,
    familyId: familyId ?? null,
    familyName: familyName ?? null,
  })
}
