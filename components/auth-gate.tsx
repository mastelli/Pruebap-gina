"use client"

import { SignedIn, SignedOut } from "@clerk/nextjs"
import { AuthScreen } from "./auth-screen"

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <AuthScreen />
      </SignedOut>
    </>
  )
}
