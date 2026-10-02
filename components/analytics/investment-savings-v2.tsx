"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, PiggyBank, BarChart3 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { PortfolioPanel } from "./portfolio-panel"
import { SavingsRate } from "./savings-rate"
import { InvestmentOverview } from "./investment-overview"
import { AnalyticsHeader } from "./analytics-header"

export function InvestmentSavingsV2() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("portfolio")

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 sm:p-8">
      <AnalyticsHeader titleKey="Savings and Investment" showActions={true} />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rastreo completo</div>
            <p className="text-xs text-muted-foreground">Acciones, ETFs y compras manuales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Savings Rate")}</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Control de ahorro</div>
            <p className="text-xs text-muted-foreground">Ahorro mensual y objetivo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visión general</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Métricas clave</div>
            <p className="text-xs text-muted-foreground">Rentabilidad y evolución</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Cartera</TabsTrigger>
          <TabsTrigger value="savings">{t("Savings Rate")}</TabsTrigger>
          <TabsTrigger value="overview">Visión general</TabsTrigger>
        </TabsList>
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cartera de Inversiones 2.0</CardTitle>
              <CardDescription>
                Seguimiento profesional con búsqueda inteligente de tickers, selección de bolsa y cotizaciones en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioPanel />
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
