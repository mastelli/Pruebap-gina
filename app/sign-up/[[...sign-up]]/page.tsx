"use client"

import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { LineChart, Lock, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
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
          Volver
        </Link>
      </header>

      <div className="relative flex flex-col items-center justify-center px-4 pb-16 pt-8">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-md",
              card: "rounded-xl border border-border bg-card shadow-lg",
              headerTitle: "text-2xl font-bold tracking-tight",
              formButtonPrimary:
                "rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium",
              socialButtonsBlockButton: "border border-input rounded-md",
            },
          }}
        />
        <p className="mt-6 max-w-md px-4 text-center text-xs leading-relaxed text-muted-foreground">
          Al registrarse en la página, el usuario declara y acepta que es mayor de 18 años y que
          cumple con los requisitos legales necesarios para utilizar el servicio.
        </p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Conexión cifrada de extremo a extremo
        </p>
      </div>
    </div>
  )
}