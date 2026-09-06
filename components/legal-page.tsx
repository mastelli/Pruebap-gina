"use client"

import Link from "next/link"
import { useState } from "react"
import type React from "react"
import { LineChart, Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"

export function ContactLink() {
  return (
    <Link
      href="/help"
      className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
    >
      aquí
    </Link>
  )
}

export function LegalPage({
  title,
  updated = "6 de septiembre de 2026",
  children,
}: {
  title: string
  updated?: string
  children: React.ReactNode
}) {
  const { t } = useLanguage()
  const { ready, userId, name, email, logout } = useAuth()
  const { settings } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const signedIn = ready && Boolean(userId)
  const displayName = name ?? settings.fullName

  const navLinks = [
    { label: "Producto", href: "/#features" },
    { label: "Características", href: "/#features" },
    { label: "Análisis", href: "/analytics" },
    { label: "Blog", href: "/#features" },
  ]

  return (
    <div className="isolate min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LineChart className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">MakeItRight</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {signedIn ? (
              <>
                <Button size="sm" asChild>
                  <Link href="/inicio">Ir a la app</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <UserAvatar name={displayName || "?"} className="h-8 w-8 text-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">{t("Profile")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">{t("Settings")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout() }}>{t("Log out")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/sign-in">{t("Sign in")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">{t("Create account")}</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="rounded-md p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {label}
                </a>
              ))}
              <div className="flex gap-3 pt-2">
                {signedIn ? (
                  <>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/inicio">Ir a la app</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 shrink-0 rounded-full">
                          <UserAvatar name={displayName || "?"} className="h-8 w-8 text-xs" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/settings">{t("Profile")}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings">{t("Settings")}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout() }}>{t("Log out")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/sign-in">{t("Sign in")}</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/sign-up">{t("Create account")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última actualización: {updated}</p>
        <div className="mt-10 space-y-10">{children}</div>
      </main>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MakeItRight. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/aviso-legal" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Aviso Legal</Link>
              <Link href="/privacidad" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Política de Privacidad</Link>
              <Link href="/terminos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Términos de Servicio</Link>
              <Link href="/cookies" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Política de Cookies</Link>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                Español
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}