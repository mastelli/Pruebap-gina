"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCards } from "@/components/analytics/overview-cards"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { RecentTransactions } from "@/components/analytics/recent-transactions"
import { IncomeMonthBreakdown } from "@/components/analytics/income-month-breakdown"
import { ExpenseMonthBreakdown } from "@/components/analytics/expense-month-breakdown"
import { CumulativeBalanceChart } from "@/components/analytics/cumulative-balance-chart"
import { useLanguage } from "@/lib/i18n"

export function OverviewTab() {
  const { t } = useLanguage()

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards />
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Recent Transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Monthly Income")}</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeMonthBreakdown />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Monthly Expenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseMonthBreakdown />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Balance Evolution")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CumulativeBalanceChart />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

