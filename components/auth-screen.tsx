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
  const [nameValue, setNameValue] = useState("")
  const [surnameValue, setSurnameValue] = useState("")
  const [ageValue, setAgeValue] = useState("")
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")
  const [confirmValue, setConfirmValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (mode === "register" && passwordValue !== confirmValue) {
      setError("Passwords do not match")
      return
    }
    setBusy(true)
    setError(null)
    const result =
      mode === "login"
        ? await login(emailValue, passwordValue)
        : await register(emailValue, passwordValue, {
            name: nameValue,
            surname: surnameValue,
            age: Number(ageValue),
          })
    if (result) setError(result)
    setBusy(false)
  }

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login")
    setError(null)
    setPasswordValue("")
    setConfirmValue("")
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
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="auth-name">{t("First name")}</Label>
                    <Input
                      id="auth-name"
                      required
                      value={nameValue}
                      onChange={(event) => setNameValue(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-surname">{t("Surname")}</Label>
                    <Input
                      id="auth-surname"
                      required
                      value={surnameValue}
                      onChange={(event) => setSurnameValue(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-age">{t("Age")}</Label>
                  <Input
                    id="auth-age"
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={ageValue}
                    onChange={(event) => setAgeValue(event.target.value)}
                  />
                </div>
              </>
            )}
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
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="auth-confirm">{t("Confirm password")}</Label>
                <Input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmValue}
                  onChange={(event) => setConfirmValue(event.target.value)}
                />
              </div>
            )}
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
