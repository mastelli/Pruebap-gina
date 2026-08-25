import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const hasValidKeys =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("TU_CLAVE") &&
  typeof process.env.CLERK_SECRET_KEY === "string" &&
  !process.env.CLERK_SECRET_KEY.includes("TU_CLAVE")

let clerkHandler: ((req: NextRequest) => Promise<NextResponse>) | null = null

async function getClerkHandler() {
  if (clerkHandler) return clerkHandler
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server")
  const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
  ])
  const middleware = clerkMiddleware(async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect()
    }
  })
  clerkHandler = middleware as unknown as (req: NextRequest) => Promise<NextResponse>
  return clerkHandler
}

export async function middleware(request: NextRequest) {
  if (!hasValidKeys) return NextResponse.next()
  const handler = await getClerkHandler()
  return handler(request)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
