"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useSettings } from "@/contexts/settings-context"
import { useUser } from "@clerk/nextjs"
import { AuthScreen } from "./auth-screen"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { usePathname } from "next/navigation"
import { isPublicPath } from "@/lib/public-routes"
import type React from "react"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, userId } = useAuth()
  const { user } = useUser()
  const { settings, updateSettings } = useSettings()
  const pathname = usePathname()

  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")
  const isPublic = isPublicPath(pathname)

  useEffect(() => {
    if (!userId || !user) return
    const updates: Record<string, string> = {}
    const name = user.firstName ?? null
    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress ??
      null
    const lastName = user.lastName ?? null
    if (!settings.fullName && name) {
      updates.fullName = lastName ? `${name} ${lastName}` : name
    }
    if (!settings.email && email) updates.email = email
    const birthDate = (user.unsafeMetadata?.birthDate as string | undefined) ?? ""
    if (birthDate && !settings.birthDate) updates.birthDate = birthDate
    if (Object.keys(updates).length > 0) updateSettings(updates)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user, settings.fullName, settings.email, settings.birthDate, updateSettings])

  if (isAuthPage) {
    return <>{children}</>
  }

  // Rutas públicas: no exigimos sesión
  if (isPublic) {
    // Páginas independientes (welcome y legales): sin sidebar ni cabecera de la app
    const standalonePublic = ["/welcome", "/aviso-legal", "/privacidad", "/terminos", "/cookies"]
    if (standalonePublic.some((p) => pathname === p)) {
      return <div className="min-h-screen">{children}</div>
    }
    // Resto de rutas públicas (calculadoras): se mantiene la cabecera y el sidebar
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

  if (!ready) {
    return null
  }

  if (!userId) {
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
