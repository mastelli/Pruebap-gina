"use client"

import { useEffect, useState } from "react"
import { ClerkProvider as RealClerkProvider, useAuth as useClerkAuth, useClerk, useUser } from "@clerk/nextjs"
import { AuthProvider } from "@/lib/auth"
import type React from "react"

function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useClerkAuth()
  const { user } = useUser()
  const { signOut } = useClerk()

  const email = isSignedIn
    ? (user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null)
    : null
  const name = isSignedIn ? (user?.firstName ?? null) : null
  const lastName = isSignedIn ? (user?.lastName ?? null) : null
  const userId = isSignedIn ? (user?.id ?? null) : null

  const logout = async () => {
    try {
      const userId = user?.id
      if (userId) {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.endsWith(`::${userId}`)) keysToRemove.push(key)
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k))
      }
    } catch {}
    await signOut({ redirectUrl: "/sign-in" })
  }

  return (
    <AuthProvider value={{ email, name, lastName, ready: isLoaded, userId, logout }}>
      {children}
    </AuthProvider>
  )
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <RealClerkProvider>
      <ClerkAuthProvider>{children}</ClerkAuthProvider>
    </RealClerkProvider>
  )
}
