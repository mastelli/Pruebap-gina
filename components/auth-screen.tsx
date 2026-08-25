"use client"

import { SignIn } from "@clerk/nextjs"

export function AuthScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#EAE4D8] dark:bg-background p-4">
      <h1 className="text-3xl font-bold tracking-tight mt-8">MakeItRight</h1>
      <div className="flex-1 flex items-center justify-center w-full">
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
