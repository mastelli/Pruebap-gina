"use client"

import { SignUp } from "@clerk/nextjs"

const hasValidKeys =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("TU_CLAVE")

export default function SignUpPage() {
  if (!hasValidKeys) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EAE4D8] dark:bg-background p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Clerk no configurado</h1>
          <p className="text-muted-foreground">
            Edita <code className="bg-muted px-1 rounded">.env.local</code> con tus claves de Clerk.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAE4D8] dark:bg-background p-4">
      <SignUp />
    </div>
  )
}
