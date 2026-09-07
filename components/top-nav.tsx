"use client"
import { ThemeToggle } from "./theme-toggle"
import { LanguageToggle } from "./language-toggle"
import Link from "next/link"
import { LineChart } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { useLanguage } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"

export function TopNav() {
  const { settings } = useSettings()
  const { t } = useLanguage()
  const { email, name, logout, userId } = useAuth()

  const displayName = name ?? settings.fullName
  const displayEmail = email ?? ""

  return (
    <header className="sticky top-0 z-40 border-b bg-sidebar">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LineChart className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">MakeItRight</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
          {userId ? (
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
                    <p className="text-xs leading-none text-muted-foreground">{displayEmail}</p>
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
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/sign-in">{t("Sign in")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

