"use client"

import { AccountsOverview } from "@/components/accounts-overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { QuickBillPay } from "@/components/quick-bill-pay"
import { BusinessMetrics } from "@/components/business-metrics"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-1 flex">
          <AccountsOverview />
        </div>
        <div className="lg:col-span-1 flex">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1 flex">
          <QuickBillPay />
        </div>
      </div>

      <BusinessMetrics />
    </div>
  )
}
