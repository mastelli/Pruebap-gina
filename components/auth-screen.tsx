"use client"

import { SignIn } from "@clerk/nextjs"

export function AuthScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#EAE4D8] dark:bg-background p-4">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">MakeItRight</h1>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  )
}
