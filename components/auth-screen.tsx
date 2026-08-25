"use client"

import { SignIn } from "@clerk/nextjs"

export function AuthScreen() {
  return (
    <div className="min-h-screen bg-[#EAE4D8] dark:bg-background relative">
      <div className="absolute top-0 left-0 right-0 p-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">MakeItRight</h1>
      </div>
      <div className="flex items-center justify-center min-h-screen p-4">
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
