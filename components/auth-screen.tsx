"use client"

import { SignIn } from "@clerk/nextjs"

export function AuthScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAE4D8] dark:bg-background p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
        routing="hash"
      />
    </div>
  )
}
