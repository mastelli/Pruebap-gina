"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewCards } from "@/components/analytics/overview-cards"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { RecentTransactions } from "@/components/analytics/recent-transactions"
import { AccountGrowth } from "@/components/analytics/account-growth"
import { TopProducts } from "@/components/analytics/top-products"
import { UserActivity } from "@/components/analytics/user-activity"
import { useLanguage } from "@/lib/i18n"

export function OverviewTab() {
  const { t } = useLanguage()

  return (
    <>
      <h3 className="mb-4 text-2xl font-semibold">{t("Dashboard Overview")}</h3>
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
            <CardTitle className="text-xl font-semibold">{t("Account Growth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountGrowth />
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

