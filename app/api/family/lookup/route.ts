import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

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
  const secretKey = process.env.CLERK_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json({ found: false, error: "Missing CLERK_SECRET_KEY" })
  }

  try {
    const res = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(normalizedEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json({ found: false, error: `Clerk API ${res.status}: ${body}` })
    }

    const data = await res.json()
    const users = data?.data ?? []

    if (users.length === 0) {
      return NextResponse.json({ found: false, error: "No users matched" })
    }

    const matched = users[0]

    if (matched.id === currentUserId) {
      return NextResponse.json({ found: false, reason: "self" })
    }

    const matchedEmail =
      matched.email_addresses?.find(
        (ea: any) => ea.email_address?.toLowerCase() === normalizedEmail,
      ) ?? matched.email_addresses?.[0]

    return NextResponse.json({
      found: true,
      userId: matched.id,
      email: matchedEmail?.email_address ?? normalizedEmail,
      name: [matched.first_name, matched.last_name].filter(Boolean).join(" ") || null,
    })
  } catch (error) {
    return NextResponse.json({ found: false, error: String(error) })
  }
}
