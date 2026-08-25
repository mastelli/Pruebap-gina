"use client"

import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAE4D8] dark:bg-background p-4">
      <SignUp />
    </div>
  )
}
