"use client"

import { useState } from "react"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n"
import { PortfolioPro } from "./portfolio-pro"
import { AnalyticsHeader } from "./analytics-header"
import { BrokerConnectDialog } from "./broker-connect-dialog"

export function InvestmentSavingsV2() {
  const { t } = useLanguage()
  const [showBrokers, setShowBrokers] = useState(false)

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <AnalyticsHeader titleKey="Savings and Investment" showActions={false} />
        <Button size="sm" onClick={() => setShowBrokers(true)}>
          <Link2 className="mr-2 h-4 w-4" />
          {t("Conectar bróker")}
        </Button>
      </div>

      <PortfolioPro />

      <BrokerConnectDialog open={showBrokers} onOpenChange={setShowBrokers} />
    </div>
  )
}
