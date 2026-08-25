"use client"

import { useAuth } from "@/lib/auth"
import { AuthScreen } from "./auth-screen"
import { usePathname } from "next/navigation"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, userId } = useAuth()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")

  if (isAuthPage) return <>{children}</>
  if (!ready) return null
  if (!userId) return <AuthScreen />
  return <>{children}</>
}
