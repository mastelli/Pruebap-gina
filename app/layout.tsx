import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n"
import { ClerkProvider } from "@/components/clerk-provider"
import { AppShell } from "@/components/app-shell"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SettingsProvider } from "@/contexts/settings-context"
import { TransactionsProvider } from "@/lib/transactions"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Make It Right Dashboard",
  description: "A modern, responsive financial dashboard",
  generator: 'v0.app',
  other: {
    "google-adsense-account": "ca-pub-5760615250143839",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider>
              <SettingsProvider>
                <TransactionsProvider>
                  <TooltipProvider delayDuration={0}>
                    <AppShell>{children}</AppShell>
                  </TooltipProvider>
                </TransactionsProvider>
              </SettingsProvider>
            </LanguageProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}