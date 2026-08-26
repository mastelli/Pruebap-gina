import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabaseClient } from "@/lib/supabase"

const TABLE = "user_data"

interface FamilyRequest {
  id: string
  familyId: string
  familyName: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  toUserEmail: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  respondedAt?: string
}

function requestsKey(userId: string) {
  return `familyRequests::${userId}`
}

function generateId() {
  return `freq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function readRequests(userId: string): Promise<FamilyRequest[]> {
  const db = getSupabaseClient()
  const { data } = await db
    .from(TABLE)
    .select("value")
    .eq("user_id", userId)
    .eq("key", requestsKey(userId))
    .maybeSingle()
  if (!data?.value) return []
  const val = data.value
  if (typeof val === "string") return JSON.parse(val)
  if (Array.isArray(val)) return val
  return []
}

async function writeRequests(userId: string, requests: FamilyRequest[]) {
  const db = getSupabaseClient()
  await db
    .from(TABLE)
    .upsert(
      { user_id: userId, key: requestsKey(userId), value: requests },
      { onConflict: "user_id,key" },
    )
}

/* GET /api/family/request?action=list — get current user's pending requests */
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const action = req.nextUrl.searchParams.get("action")

  if (action === "list") {
    const requests = await readRequests(userId)
    const pending = requests.filter((r) => r.status === "pending")
    return NextResponse.json({ requests: pending })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}

/* POST /api/family/request — send a family join request */
export async function POST(req: NextRequest) {
  const { userId: fromUserId } = await auth()
  if (!fromUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { action, familyId, familyName, toUserId, toUserEmail } = body as {
    action?: string
    familyId?: string
    familyName?: string
    toUserId?: string
    toUserEmail?: string
  }

  if (action !== "send") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  if (!familyId || !familyName || !toUserId || !toUserEmail) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // Check for duplicate pending request
  const existing = await readRequests(toUserId)
  const alreadyPending = existing.find(
    (r) => r.familyId === familyId && r.fromUserId === fromUserId && r.status === "pending",
  )
  if (alreadyPending) {
    return NextResponse.json({ ok: true, message: "Already sent" })
  }

  // Get sender's name from Clerk
  let fromName = "Someone"
  try {
    const { clerkClient } = await import("@clerk/nextjs/server")
    const sender = await clerkClient.users.getUser(fromUserId)
    fromName = [sender.firstName, sender.lastName].filter(Boolean).join(" ") || sender.emailAddresses?.[0]?.emailAddress || "Someone"
  } catch {
    // fallback
  }

  const request: FamilyRequest = {
    id: generateId(),
    familyId,
    familyName,
    fromUserId,
    fromUserName: fromName,
    toUserId,
    toUserEmail: toUserEmail.toLowerCase().trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  existing.push(request)
  await writeRequests(toUserId, existing)

  return NextResponse.json({ ok: true, requestId: request.id })
}

/* PATCH /api/family/request — accept or reject */
export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { requestId, response } = body as { requestId?: string; response?: string }

  if (!requestId || (response !== "accepted" && response !== "rejected")) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 })
  }

  const requests = await readRequests(userId)
  const idx = requests.findIndex((r) => r.id === requestId)
  if (idx === -1) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  requests[idx].status = response as "accepted" | "rejected"
  requests[idx].respondedAt = new Date().toISOString()
  await writeRequests(userId, requests)

  // If accepted → add user to the family's members list
  if (response === "accepted") {
    const req_ = requests[idx]
    const membersKey = `familyMembers::${req_.familyId}`
    const db = getSupabaseClient()

    // Read current family members (stored under the family admin's data)
    const { data } = await db
      .from(TABLE)
      .select("value")
      .eq("key", membersKey)
      .maybeSingle()

    let members: any[] = []
    if (data?.value) {
      members = typeof data.value === "string" ? JSON.parse(data.value) : data.value
    }

    // Check not already a member
    if (!members.some((m: any) => m.userId === userId)) {
      // Get user info from Clerk for the member entry
      let displayName = req_.toUserEmail.split("@")[0]
      let email = req_.toUserEmail
      try {
        const { clerkClient } = await import("@clerk/nextjs/server")
        const user = await clerkClient.users.getUser(userId)
        displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || displayName
        email = user.emailAddresses?.[0]?.emailAddress ?? email
      } catch {
        // fallback
      }

      members.push({
        userId,
        email,
        displayName,
        role: "member",
        addedAt: new Date().toISOString(),
        status: "active",
      })

      await db
        .from(TABLE)
        .upsert(
          { user_id: req_.fromUserId, key: membersKey, value: members },
          { onConflict: "user_id,key" },
        )
    }

    // Also store the family under the new member's data so they can access it
    const familyUnitKey = `familyUnit::${req_.familyId}`
    const { data: familyData } = await db
      .from(TABLE)
      .select("value")
      .eq("user_id", req_.fromUserId)
      .eq("key", familyUnitKey)
      .maybeSingle()

    if (familyData?.value) {
      await db
        .from(TABLE)
        .upsert(
          { user_id: userId, key: familyUnitKey, value: familyData.value },
          { onConflict: "user_id,key" },
        )
      // Also store the family ID reference
      await db
        .from(TABLE)
        .upsert(
          { user_id: userId, key: "userFamilyId", value: JSON.stringify(req_.familyId) },
          { onConflict: "user_id,key" },
        )
    }
  }

  return NextResponse.json({ ok: true })
}
