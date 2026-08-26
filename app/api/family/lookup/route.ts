import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

export async function GET(req: NextRequest) {
  const { userId: currentUserId } = await auth()
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = req.nextUrl.searchParams.get("email")
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const response = await clerkClient.users.getUserList({
      emailAddress: [normalizedEmail],
      limit: 10,
    })

    const users = response.data ?? []

    const matched = users.find((u) =>
      u.emailAddresses?.some(
        (ea) => ea.emailAddress?.toLowerCase() === normalizedEmail,
      ),
    )

    if (!matched) {
      return NextResponse.json({ found: false })
    }

    if (matched.id === currentUserId) {
      return NextResponse.json({ found: false, reason: "self" })
    }

    const matchedEmail = matched.emailAddresses?.find(
      (ea) => ea.emailAddress?.toLowerCase() === normalizedEmail,
    )

    return NextResponse.json({
      found: true,
      userId: matched.id,
      email: matchedEmail?.emailAddress ?? normalizedEmail,
      name: [matched.firstName, matched.lastName].filter(Boolean).join(" ") || null,
    })
  } catch (error) {
    console.error("[family/lookup] Clerk error:", error)
    return NextResponse.json({ found: false, error: String(error) })
  }
}
