"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { PortfolioPro } from "./portfolio-pro"
import { SavingsRate } from "./savings-rate"
import { InvestmentOverview } from "./investment-overview"
import { AnalyticsHeader } from "./analytics-header"

export function InvestmentSavingsV2() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("portfolio")

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 sm:p-8">
      <AnalyticsHeader titleKey="Savings and Investment" showActions={false} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Cartera 2.0</TabsTrigger>
          <TabsTrigger value="savings">{t("Savings Rate")}</TabsTrigger>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
        </TabsList>
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cartera definitiva 2.0</CardTitle>
              <CardDescription>
                Acciones de cualquier bolsa (NASDAQ, NYSE, XETRA, Tradegate, BME…), ETFs y fondos de inversión.
                Elige el listing exacto en el buscador y verás su precio real con P&amp;L, asignación y evolución en euros.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioPro />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="savings" className="space-y-4">
          <SavingsRate />
        </TabsContent>
        <TabsContent value="overview" className="space-y-4">
          <InvestmentOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
