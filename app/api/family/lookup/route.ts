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

  try {
    const response = await clerkClient.users.getUserList({
      emailAddress: [email.toLowerCase().trim()],
    })

    const users = response.data ?? response
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ found: false })
    }

    const user = users[0]
    if (user.id === currentUserId) {
      return NextResponse.json({ found: false, reason: "self" })
    }

    return NextResponse.json({
      found: true,
      userId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress ?? email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
    })
  } catch (error) {
    console.error("[family/lookup] Clerk error:", error)
    return NextResponse.json({ found: false })
  }
}
