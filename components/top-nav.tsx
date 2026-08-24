"use client"
import { ThemeToggle } from "./theme-toggle"
import { LanguageToggle } from "./language-toggle"
import { Notifications } from "./notifications"
import Link from "next/link"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"

export function TopNav() {
  const { settings } = useSettings()
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 border-b bg-[#C1B6A3] dark:bg-background">
      <div className="container flex h-16 items-center justify-end px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Notifications />
          <ThemeToggle />
          <LanguageToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={settings.avatar} alt={settings.fullName} />
                  <AvatarFallback>
                    {settings.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{settings.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{settings.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">{t("Profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">{t("Settings")}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>{t("Log out")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

