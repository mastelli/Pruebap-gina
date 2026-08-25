"use client"

import { useAuth } from "@/lib/auth"
import { AuthScreen } from "./auth-screen"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, userId } = useAuth()

  if (!ready) return null
  if (!userId) return <AuthScreen />
  return <>{children}</>
}
