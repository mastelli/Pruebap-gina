"use client"

import { useEffect, useState } from "react"
import { ClerkProvider as RealClerkProvider, useAuth as useClerkAuth, useClerk, useUser } from "@clerk/nextjs"
import { AuthProvider } from "@/lib/auth"
import type React from "react"

const hasValidKeys =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("TU_CLAVE")

function ClerkAuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useClerkAuth()
  const { user } = useUser()
  const { signOut } = useClerk()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(isLoaded)
  }, [isLoaded])

  const email = isSignedIn
    ? (user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null)
    : null
  const name = isSignedIn ? (user?.firstName ?? null) : null
  const userId = isSignedIn ? (user?.id ?? null) : null

  return (
    <AuthProvider value={{ email, name, ready, userId, logout: () => { signOut({ redirectUrl: "/sign-in" }) } }}>
      {children}
    </AuthProvider>
  )
}

function FallbackAuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  return (
    <AuthProvider value={{ email: null, name: null, ready, userId: null, logout: () => {} }}>
      {children}
    </AuthProvider>
  )
}

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  if (!hasValidKeys) {
    return <FallbackAuthProvider>{children}</FallbackAuthProvider>
  }
  return (
    <RealClerkProvider>
      <ClerkAuthProvider>{children}</ClerkAuthProvider>
    </RealClerkProvider>
  )
}
