"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, LayoutDashboard, TrendingUp, Receipt, PiggyBank } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

const sections = [
  { name: "Overview", href: "/analytics/overview", icon: LayoutDashboard, desc: "Dashboard Overview" },
  { name: "Revenue", href: "/analytics/income", icon: TrendingUp, desc: "Income Breakdown" },
  { name: "Expenses", href: "/analytics/expenses", icon: Receipt, desc: "Expense Movements" },
  { name: "Debt", href: "/analytics/savings", icon: PiggyBank, desc: "Savings and Investment" },
]

export default function AnalyticsHub() {
  const { t } = useLanguage()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center gap-3">
        <BarChart2 className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">{t("Analytics")}</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="block">
            <Card className="h-full transition-colors hover:bg-secondary">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <s.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{t(s.name)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t(s.desc)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
