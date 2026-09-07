"use client"

import Link from "next/link"
import { useState } from "react"
import type React from "react"
import { LineChart, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { useSettings } from "@/contexts/settings-context"
import { LanguageSwitcher } from "@/components/language-switcher"
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
  const { t } = useLanguage()
  return (
    <Link
      href="/help"
      className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
    >
      {t("here")}
    </Link>
  )
}

export function BoldLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
    >
      {children}
    </Link>
  )
}

function MobileNavItem({ label, href, onClick, children }: { label: string; href: string; onClick: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div className="flex items-center justify-between">
        <a href={href} onClick={onClick} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          {label}
        </a>
        <button onClick={() => setOpen(!open)} className="p-1 text-muted-foreground hover:text-foreground">
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-border pl-3">{children}</div>}
    </div>
  )
}

export function LegalPage({
  title,
  updated,
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
            <Link href="/inicio" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t("Dashboard")}
            </Link>
            <div className="group relative">
              <Link href="/analytics" className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t("Analytics")}
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </Link>
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="w-48 space-y-1.5 rounded-xl border border-border bg-background p-3 shadow-lg">
                  <Link href="/analytics/income" className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{t("Revenue")}</Link>
                  <Link href="/analytics/expenses" className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{t("Expenses")}</Link>
                  <Link href="/analytics/savings" className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{t("Debt")}</Link>
                  <Link href="/analytics/balance2" className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{t("Balance 2")}</Link>
                </div>
              </div>
            </div>
            <Link href="/investment" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t("Savings and Investment")}
            </Link>
            <div className="group relative">
              <Link href="/calculator" className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t("Financial Calculators")}
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </Link>
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="w-48 space-y-1.5 rounded-xl border border-border bg-background p-3 shadow-lg">
                  <Link href="/calculator/compound" className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{t("Compound Interest")}</Link>
                  <Link href="/calculator/realestate" className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{t("Real Estate Assets")}</Link>
                  <Link href="/calculator/stocks" className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">{t("Stocks")}</Link>
                </div>
              </div>
            </div>
            <Link href="/chat" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t("AI chat")}
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {signedIn ? (
              <>
                <Button size="sm" asChild>
                  <Link href="/inicio">{t("Go to app")}</Link>
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
              <a href="/inicio" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {t("Dashboard")}
              </a>
              <MobileNavItem label={t("Analytics")} href="/analytics" onClick={() => setMobileOpen(false)}>
                <a href="/analytics/income" onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{t("Revenue")}</a>
                <a href="/analytics/expenses" onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{t("Expenses")}</a>
                <a href="/analytics/savings" onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{t("Debt")}</a>
                <a href="/analytics/balance2" onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{t("Balance 2")}</a>
              </MobileNavItem>
              <a href="/investment" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {t("Savings and Investment")}
              </a>
              <MobileNavItem label={t("Financial Calculators")} href="/calculator" onClick={() => setMobileOpen(false)}>
                <a href="/calculator/compound" onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{t("Compound Interest")}</a>
                <a href="/calculator/realestate" onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{t("Real Estate Assets")}</a>
                <a href="/calculator/stocks" onClick={() => setMobileOpen(false)} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">{t("Stocks")}</a>
              </MobileNavItem>
              <a href="/chat" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {t("AI chat")}
              </a>
              <div className="flex gap-3 pt-2">
                {signedIn ? (
                  <>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/inicio">{t("Go to app")}</Link>
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t(title)}</h1>
        {updated && <p className="mt-3 text-sm text-muted-foreground">{t("Last updated")}: {updated}</p>}
        <div className="mt-10 space-y-10">{children}</div>
      </main>

      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MakeItRight. {t("All rights reserved.")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/aviso-legal" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Legal Notice")}</Link>
              <Link href="/privacidad" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Privacy Policy")}</Link>
              <Link href="/terminos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Terms of Service")}</Link>
              <Link href="/cookies" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Cookie Policy")}</Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}