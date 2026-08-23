import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n"
import { Sidebar } from "@/components/sidebar"
import { TopNav } from "@/components/top-nav"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { SettingsProvider } from "@/contexts/settings-context"
import { TransactionsProvider } from "@/lib/transactions"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Make It Right Dashboard",
  description: "A modern, responsive financial dashboard",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <SettingsProvider>
              <TransactionsProvider>
                <TooltipProvider delayDuration={0}>
                <div className="min-h-screen flex">
                  <Sidebar />
                  <div className="flex-1">
                    <TopNav />
                    <div className="container mx-auto p-6 max-w-7xl">
                      <main className="w-full">{children}</main>
                    </div>
                  </div>
                </div>
                </TooltipProvider>
              </TransactionsProvider>
            </SettingsProvider>
          </LanguageProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

