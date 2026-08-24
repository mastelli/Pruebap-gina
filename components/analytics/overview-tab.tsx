"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCards } from "@/components/analytics/overview-cards"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { RecentTransactions } from "@/components/analytics/recent-transactions"
import { AccountGrowth } from "@/components/analytics/account-growth"
import { TopProducts } from "@/components/analytics/top-products"
import { UserActivity } from "@/components/analytics/user-activity"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/i18n"

export function OverviewTab() {
  const [comparisonPeriod, setComparisonPeriod] = useState("previous_month")
  const { t } = useLanguage()

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">{t("Dashboard Overview")}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t("Compare to:")}</span>
          <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("Select period")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous_month">{t("Previous Month")}</SelectItem>
              <SelectItem value="previous_quarter">{t("Previous Quarter")}</SelectItem>
              <SelectItem value="previous_year">{t("Previous Year")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Monthly Remainder")}</CardTitle>
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
            <CardTitle className="text-xl font-semibold">{t("Account Growth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountGrowth comparisonPeriod={comparisonPeriod} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("Top Products")}</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProducts />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{t("User Activity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivity />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

