"use client"

import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-12 pb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">MakeItRight</h1>
      </div>
      <div className="flex items-center justify-center px-4">
        <SignUp />
      </div>
    </div>
  )
}
