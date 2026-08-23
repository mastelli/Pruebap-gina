"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { OverviewTab } from "@/components/analytics/overview-tab"
import { MetricTab } from "@/components/analytics/metric-tab"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export default function AnalyticsPage() {
  const handleExportData = () => {
    // Implement export functionality here
    console.log("Exporting data...")
  }
  const { t } = useLanguage()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("Analytics")}</h2>
        <div className="flex items-center space-x-2">
          <DateRangePicker />
          <Button onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t("Export Data")}
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="income">{t("Revenue")}</TabsTrigger>
          <TabsTrigger value="expenses">{t("Expenses")}</TabsTrigger>
          <TabsTrigger value="savings">{t("Savings/Investment")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="income" className="space-y-4">
          <MetricTab titleKey="Revenue" />
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <MetricTab titleKey="Expenses" />
        </TabsContent>
        <TabsContent value="savings" className="space-y-4">
          <MetricTab titleKey="Savings/Investment" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

