"use client"

import { useState, useEffect } from "react"

const hasValidKeys =
  typeof process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "string" &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("TU_CLAVE")

function LocalAuthScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [error, setError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [accounts, setAccounts] = useState<Record<string, unknown>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem("appAccounts")
      if (raw) setAccounts(JSON.parse(raw))
    } catch {}
  }, [])

  async function hash(text: string): Promise<string> {
    const data = new TextEncoder().encode(text)
    const buf = await crypto.subtle.digest("SHA-256", data)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  function randomSalt(): string {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const normalized = email.trim().toLowerCase()

    if (isSignUp) {
      if (!fullName.trim()) { setError("Enter your full name"); return }
      if (!birthDate) { setError("Enter your birth date"); return }
      const year = parseInt(birthDate.split("-")[0], 10)
      const age = new Date().getFullYear() - year
      if (age < 0 || age > 120) { setError("Enter a valid age"); return }
      if (password.length < 4) { setError("Password must be at least 4 characters"); return }
      if (accounts[normalized]) { setError("This account already exists"); return }

      const salt = randomSalt()
      const hashVal = await hash(`${salt}:${password}`)
      const newAccounts = {
        ...accounts,
        [normalized]: { salt, hash: hashVal, fullName: fullName.trim(), birthDate },
      }
      localStorage.setItem("appAccounts", JSON.stringify(newAccounts))
      localStorage.setItem("appSession", JSON.stringify({ email: normalized, loggedInAt: Date.now() }))
      window.location.reload()
    } else {
      const account = accounts[normalized] as { salt: string; hash: string } | undefined
      if (!account) { setError("Account not found"); return }
      const hashVal = await hash(`${account.salt}:${password}`)
      if (hashVal !== account.hash) { setError("Incorrect password"); return }
      localStorage.setItem("appSession", JSON.stringify({ email: normalized, loggedInAt: Date.now() }))
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAE4D8] dark:bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-md">
        <h1 className="text-xl font-bold text-center mb-1">AhorroApp</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>
        <button
          onClick={() => { setIsSignUp(!isSignUp); setError("") }}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:underline"
        >
          {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}

function ClerkSignIn() {
  const { SignIn } = require("@clerk/nextjs")
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAE4D8] dark:bg-background p-4">
      <SignIn
        appearance={{ elements: { rootBox: "mx-auto", card: "shadow-lg" } }}
        routing="hash"
      />
    </div>
  )
}

export function AuthScreen() {
  if (!hasValidKeys) return <LocalAuthScreen />
  return <ClerkSignIn />
}
