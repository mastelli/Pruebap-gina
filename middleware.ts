import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server")
    const isPublicRoute = createRouteMatcher([
      "/sign-in(.*)",
      "/sign-up(.*)",
      "/api(.*)",
    ])
    const handler = clerkMiddleware(async (auth, request) => {
      if (!isPublicRoute(request)) {
        await auth.protect()
      }
    })
    return (handler as unknown as (req: NextRequest) => Promise<NextResponse>)(request)
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
