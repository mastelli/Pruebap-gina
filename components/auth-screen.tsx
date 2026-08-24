"use client"

import { useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useLanguage } from "@/lib/i18n"

// Pantalla de inicio de sesion y registro; mientras no haya sesion
// valida no se muestra ninguna parte de la aplicacion
export function AuthScreen() {
  const { login, register } = useAuth()
  const { t } = useLanguage()

  const [mode, setMode] = useState<"login" | "register">("login")
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result =
      mode === "login"
        ? await login(emailValue, passwordValue)
        : await register(emailValue, passwordValue)
    if (result) setError(result)
    setBusy(false)
  }

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setError(null)
    setPasswordValue("")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAE4D8] px-4 dark:bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Wallet className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-semibold">
            {mode === "login" ? t("Sign in") : t("Create account")}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? t("Enter your email and password to access your data")
              : t("Choose an email and password for the new account")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email">{t("Email")}</Label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={emailValue}
                onChange={(event) => setEmailValue(event.target.value)}
                placeholder="tu@correo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">{t("Password")}</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
              />
            </div>
            {error && <p className="text-sm font-medium text-red-600">{t(error)}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "…" : mode === "login" ? t("Sign in") : t("Create account")}
            </Button>
          </form>
          <button
            type="button"
            onClick={switchMode}
            className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {mode === "login" ? t("Don't have an account? Create one") : t("Already have an account? Sign in")}
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
