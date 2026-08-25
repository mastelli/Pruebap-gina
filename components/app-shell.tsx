"use client"

import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { AuthGate } from "@/components/auth-gate"
import type React from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1">
          <TopNav />
          <div className="container mx-auto p-6 max-w-7xl">
            <main className="w-full">{children}</main>
          </div>
        </div>
      </div>
    </AuthGate>
  )
}
