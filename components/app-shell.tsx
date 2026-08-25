"use client"

import { useAuth } from "@/lib/auth"
import { AuthScreen } from "./auth-screen"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { usePathname } from "next/navigation"
import type React from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, userId } = useAuth()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")

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
