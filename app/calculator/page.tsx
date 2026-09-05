"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, LineChart, Building2, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

const sections = [
  { name: "Compound Interest", href: "/calculator/compound", icon: LineChart, desc: "Compound Interest Calculator" },
  { name: "Real Estate Assets", href: "/calculator/realestate", icon: Building2, desc: "Real Estate Calculator" },
  { name: "Stocks", href: "/calculator/stocks", icon: TrendingUp, desc: "Stock Analyzer" },
]

export default function CalculatorHub() {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Calculator className="h-6 w-6" />
        <h1 className="text-2xl font-semibold">{t("Calculator")}</h1>
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
