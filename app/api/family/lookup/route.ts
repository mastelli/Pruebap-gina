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
    let found = false
    let matchedUser: (typeof response.data)[number] | null = null

    const response = await clerkClient.users.getUserList({ limit: 100 })
    const users = response.data ?? []

    for (const user of users) {
      const emails = (user as any).emailAddresses ?? (user as any).email_addresses ?? []
      for (const ea of emails) {
        const addr = typeof ea === "string" ? ea : ea?.emailAddress ?? ea?.email_address ?? ""
        if (addr.toLowerCase() === normalizedEmail) {
          matchedUser = user
          found = true
          break
        }
      }
      if (found) break
    }

    if (!found || !matchedUser) {
      return NextResponse.json({ found: false, debug: { totalUsers: users.length } })
    }

    if (matchedUser.id === currentUserId) {
      return NextResponse.json({ found: false, reason: "self" })
    }

    const emails = (matchedUser as any).emailAddresses ?? (matchedUser as any).email_addresses ?? []
    const matchedEmail = emails[0]
    const emailAddress = typeof matchedEmail === "string"
      ? matchedEmail
      : matchedEmail?.emailAddress ?? matchedEmail?.email_address ?? normalizedEmail

    const name = [matchedUser.firstName, matchedUser.lastName].filter(Boolean).join(" ") || null

    return NextResponse.json({
      found: true,
      userId: matchedUser.id,
      email: emailAddress,
      name,
    })
  } catch (error) {
    console.error("[family/lookup] Clerk error:", error)
    return NextResponse.json({ found: false, error: String(error) })
  }
}
