"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCards } from "@/components/analytics/overview-cards"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { RecentTransactions } from "@/components/analytics/recent-transactions"
import { SavingsRate } from "@/components/analytics/savings-rate"
import { NetWorth } from "@/components/analytics/net-worth"
import { PeriodComparison } from "@/components/analytics/period-comparison"
import { useLanguage } from "@/lib/i18n"
import { useState } from "react"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function OverviewTab() {
  const { t } = useLanguage()
  const [month, setMonth] = useState<string | undefined>(undefined)

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-1">
        {MONTHS.map((name, index) => {
          const key = String(index + 1).padStart(2, "0")
          const active = month === key
          return (
            <button
              key={key}
              onClick={() => setMonth(active ? undefined : key)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                !active
                  ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                  : "bg-primary font-medium text-primary-foreground"
              }`}
            >
              {t(name).slice(0, 3)}
            </button>
          )
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards month={month} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Summary")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Recent Transactions")}</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col">
            <RecentTransactions month={month} />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Savings Rate")}</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsRate month={month} />
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Net Worth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <NetWorth />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Period comparison")}</CardTitle>
          </CardHeader>
          <CardContent>
            <PeriodComparison month={month} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

