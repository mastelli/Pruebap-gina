"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BarChart2,
  Wallet,
  Receipt,
  CreditCard,
  MessagesSquare,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  PiggyBank,
  Calculator,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useLanguage } from "@/lib/i18n"

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  children?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/inicio", icon: Home },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart2,
    children: [
      { name: "Revenue", href: "/analytics/income" },
      { name: "Expenses", href: "/analytics/expenses" },
      { name: "Debt", href: "/analytics/savings" },
    ],
  },
  { name: "Savings and Investment", href: "/investment", icon: PiggyBank },
  { name: "Transactions", href: "/transactions", icon: Wallet },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Payments", href: "/payments", icon: CreditCard },
  {
    name: "Calculator",
    href: "/calculator",
    icon: Calculator,
    children: [
      { name: "Compound Interest", href: "/calculator/compound" },
      { name: "Real Estate Assets", href: "/calculator/realestate" },
      { name: "Stocks", href: "/calculator/stocks" },
      { name: "Bonds", href: "/calculator/bonds" },
    ],
  },
  { name: "Chat", href: "/chat", icon: MessagesSquare },
]

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { t } = useLanguage()

  const isParentActive = (item: NavItem) =>
    pathname === item.href || (item.children?.some((c) => pathname === c.href) ?? false)

  const NavItem = ({ item, isBottom = false }) => (
    <div>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isParentActive(item)
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
              isCollapsed && "justify-center px-2",
            )}
          >
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{t(item.name)}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {t(item.name)}
          </TooltipContent>
        )}
      </Tooltip>
      {!isCollapsed && item.children && (
        <div className="ml-4 space-y-1 border-l border-border pl-3 pt-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "block rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === child.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
              )}
            >
              {t(child.name)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <TooltipProvider>
      <>
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div
          className={cn(
            // En movil es un cajon deslizante; en escritorio queda fijo
            // arriba para que la marca siga visible al hacer scroll
            "fixed inset-y-0 z-20 flex flex-col bg-sidebar transition-all duration-300 ease-in-out",
            "lg:sticky lg:top-0 lg:bottom-auto lg:h-screen lg:self-start",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="border-b border-border">
            <div
              className={cn(
                "flex min-h-16 items-center gap-2 px-4 py-2",
                isCollapsed && "flex-col justify-center px-2",
              )}
            >
              <Link href="/" className="flex items-center justify-center font-semibold">
                <span className={cn("leading-tight", isCollapsed ? "text-center text-xs" : "text-lg")}>
                  Make It Right
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 shrink-0", !isCollapsed && "ml-auto")}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
                <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} Sidebar</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
          <div className="border-t border-border p-2">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => (
                <NavItem key={item.name} item={item} isBottom />
              ))}
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  )
}

