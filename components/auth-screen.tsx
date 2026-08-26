"use client"

import { SignIn } from "@clerk/nextjs"

export function AuthScreen() {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="relative z-10 pt-12 pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">MakeItRight</h1>
      </div>
      <div className="flex items-center justify-center px-4 pb-12" style={{ minHeight: "calc(100vh - 120px)" }}>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
        />
      </div>
    </div>
  )
}
