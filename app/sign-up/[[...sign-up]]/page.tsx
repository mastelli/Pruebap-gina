"use client"

import { useState, FormEvent } from "react"
import { useSignUp, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LineChart, Lock, ArrowLeft, Cake, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const { t } = useLanguage()
  const { signUp, errors, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [code, setCode] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)

    if (fetchStatus === "fetching" || !signUp) return

    const { error } = await signUp.password({
      emailAddress: email,
      password,
      unsafeMetadata: { birthDate },
    })

    if (error) {
      const msg = error.message || error.toString()
      setSubmitError(msg)
      return
    }

    const sendResult = await signUp.verifications.sendEmailCode()
    if (sendResult.error) {
      setSubmitError(sendResult.error.message || sendResult.error.toString())
    }
  }

  const handleResend = async () => {
    if (!signUp) return
    const result = await signUp.verifications.sendEmailCode()
    if (result.error) {
      setSubmitError(result.error.message || result.error.toString())
    }
  }

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    if (!signUp) return

    const result = await signUp.verifications.verifyEmailCode({ code })
    if (result.error) {
      setSubmitError(result.error.message || result.error.toString())
      return
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return
          const url = decorateUrl("/inicio")
          if (url.startsWith("http")) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })
    }
  }

  if (signUp?.status === "complete" || isSignedIn) {
    return null
  }

  const awaitingVerification =
    signUp?.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% -10%, hsl(var(--primary) / 0.08), transparent 60%)",
        }}
      />

      <header className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/welcome" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LineChart className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">MakeItRight</span>
        </Link>
        <Link
          href="/welcome"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Back")}
        </Link>
      </header>

      <div className="relative flex flex-col items-center justify-center px-4 pb-16 pt-8">
        <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
          {!signUp ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : awaitingVerification ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{t("Verify account")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("Enter the code we sent to")} {signUp.emailAddress}
              </p>
              <form onSubmit={handleVerify} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t("Verification code")}</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                  {(errors.fields.code || submitError) && (
                    <p className="text-sm text-destructive">
                      {errors.fields.code?.message ?? submitError}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={fetchStatus === "fetching"}>
                  {fetchStatus === "fetching" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {t("Verify")}
                </Button>
              </form>
              <Button variant="ghost" className="mt-2 w-full" onClick={handleResend}>
                {t("I need a new code")}
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{t("Create account")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("Choose an email and password for the new account")}
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email address")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  {errors.fields.emailAddress && (
                    <p className="text-sm text-destructive">
                      {errors.fields.emailAddress.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("Password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  {errors.fields.password && (
                    <p className="text-sm text-destructive">{errors.fields.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="flex items-center gap-1.5">
                    <Cake className="h-4 w-4" />
                    {t("Date of Birth")}
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {t("You must be at least 18 years old")}
                  </p>
                </div>
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                <Button type="submit" className="w-full" disabled={fetchStatus === "fetching"}>
                  {fetchStatus === "fetching" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {t("Create account")}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {t("Already have an account? Sign in")}{" "}
                <Link href="/sign-in" className="font-medium text-primary hover:underline">
                  {t("Sign in")}
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          {t("End-to-end encrypted")}
        </p>

        <div id="clerk-captcha" />
      </div>
    </div>
  )
}