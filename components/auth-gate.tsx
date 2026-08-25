"use client"

import { useState, useEffect } from "react"
import { AuthScreen } from "./auth-screen"

const hasValidKeys =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("TU_CLAVE")

function hasLocalSession(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem("appSession")
    if (!raw) return false
    const session = JSON.parse(raw)
    return typeof session?.email === "string" && session.email.length > 0
  } catch {
    return false
  }
}

function LocalAuthGate({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    setIsLoggedIn(hasLocalSession())
    const handler = () => setIsLoggedIn(hasLocalSession())
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  if (isLoggedIn === null) return null
  if (!isLoggedIn) return <AuthScreen />
  return <>{children}</>
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  if (!hasValidKeys) return <LocalAuthGate>{children}</LocalAuthGate>

  const { SignedIn, SignedOut } = require("@clerk/nextjs")
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <AuthScreen />
      </SignedOut>
    </>
  )
}
