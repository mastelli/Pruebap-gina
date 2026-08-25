"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useSettings } from "@/contexts/settings-context"
import { AuthScreen } from "./auth-screen"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { usePathname } from "next/navigation"
import type React from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, userId, email, name, lastName } = useAuth()
  const { settings, updateSettings } = useSettings()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")

  useEffect(() => {
    if (!userId || !email) return
    const updates: Record<string, string> = {}
    if (!settings.fullName && name) {
      updates.fullName = lastName ? `${name} ${lastName}` : name
    }
    if (!settings.email) updates.email = email
    if (Object.keys(updates).length > 0) updateSettings(updates)
  }, [userId, email, name, lastName, settings.fullName, settings.email, updateSettings])

  if (isAuthPage) {
    return <>{children}</>
  }

  if (!ready || !userId) {
    return <AuthScreen />
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <TopNav />
        <div className="container mx-auto p-6 max-w-7xl">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  )
}
