"use client"

import { DateRangePicker } from "@/components/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function AnalyticsHeader() {
  const { t } = useLanguage()

  const handleExportData = () => {
    console.log("Exporting data...")
  }

  return (
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
  )
}
