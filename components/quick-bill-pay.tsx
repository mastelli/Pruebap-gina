"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import {
  getMonthlyBillAmount,
  getMonthlyBillProvider,
  isElectricityBill,
  isInternetBill,
  isWaterBill,
  isSubscription,
  ELECTRICITY_COMPANIES,
  INTERNET_COMPANIES,
  WATER_COMPANIES,
} from "@/lib/bill-companies"

interface Bill {
  id: number
  name: string
}

const initialBills: Bill[] = [
  { id: 1, name: "Electricity Bill" },
  { id: 2, name: "Internet Service" },
  { id: 4, name: "Water Bill" },
  { id: 3, name: "Subscriptions" },
]

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function QuickBillPay() {
  const [bills] = useState(initialBills)
  const { t } = useLanguage()
  const { transactions } = useTransactions()

  const now = new Date()
  const currentYear = `${now.getFullYear()}`
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
  const electricityAmount = getMonthlyBillAmount(transactions, currentYear, currentMonth, isElectricityBill)
  const internetAmount = getMonthlyBillAmount(transactions, currentYear, currentMonth, isInternetBill)
  const waterAmount = getMonthlyBillAmount(transactions, currentYear, currentMonth, isWaterBill)

  // Suscripciones detectadas por nombre de servicio (Netflix, Spotify, etc.)
  const subscriptionsAmount = getMonthlyBillAmount(transactions, currentYear, currentMonth, isSubscription)

  // Proveedor detectado para cada tipo de factura (p. ej. Movistar, Endesa)
  const electricityProvider = getMonthlyBillProvider(transactions, currentYear, currentMonth, ELECTRICITY_COMPANIES)
  const internetProvider = getMonthlyBillProvider(transactions, currentYear, currentMonth, INTERNET_COMPANIES)
  const waterProvider = getMonthlyBillProvider(transactions, currentYear, currentMonth, WATER_COMPANIES)

  return (
    <Card className="flex h-[390px] w-full flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t("Quick Bill Pay")}</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length > 0 ? (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t(bill.name)}</p>
                  {bill.name === "Electricity Bill" && electricityProvider && (
                    <p className="text-sm text-muted-foreground">
                      {t("Provider:")} {electricityProvider}
                    </p>
                  )}
                  {bill.name === "Internet Service" && internetProvider && (
                    <p className="text-sm text-muted-foreground">
                      {t("Provider:")} {internetProvider}
                    </p>
                  )}
                  {bill.name === "Water Bill" && waterProvider && (
                    <p className="text-sm text-muted-foreground">
                      {t("Provider:")} {waterProvider}
                    </p>
                  )}
                </div>
                {bill.name === "Electricity Bill" && electricityAmount !== 0 && (
                  <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
                    {formatEuros(electricityAmount)}
                  </span>
                )}
                {bill.name === "Internet Service" && internetAmount !== 0 && (
                  <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
                    {formatEuros(internetAmount)}
                  </span>
                )}
                {bill.name === "Water Bill" && (
                  <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
                    {formatEuros(waterAmount)}
                  </span>
                )}
                {bill.name === "Subscriptions" && (
                  <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
                    {formatEuros(subscriptionsAmount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t("No pending bills")}</p>
        )}
      </CardContent>
    </Card>
  )
}
