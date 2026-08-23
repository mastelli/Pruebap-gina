"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"
import { useTransactions } from "@/lib/transactions"
import { getMonthlyBillAmount, isElectricityBill, isInternetBill, isWaterBill } from "@/lib/bill-companies"

interface Bill {
  id: number
  name: string
  dueDate?: string
}

const initialBills: Bill[] = [
  { id: 1, name: "Electricity Bill", dueDate: "2023-07-15" },
  { id: 2, name: "Internet Service", dueDate: "2023-07-18" },
  { id: 4, name: "Water Bill", dueDate: "2023-07-30" },
  { id: 3, name: "Card Payments" },
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

  // Gastos del mes excluyendo las facturas ya desglosadas (luz, agua e internet)
  const cardPaymentsAmount = transactions
    .filter(
      (transaction) =>
        transaction.date.startsWith(`${currentYear}-${currentMonth}`) &&
        transaction.amount < 0 &&
        !isElectricityBill(transaction.name) &&
        !isInternetBill(transaction.name) &&
        !isWaterBill(transaction.name),
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0)

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
                  {bill.dueDate && (
                    <p className="text-sm text-muted-foreground">
                      {t("Due:")} {bill.dueDate}
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
                {bill.name === "Water Bill" && waterAmount !== 0 && (
                  <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
                    {formatEuros(waterAmount)}
                  </span>
                )}
                {bill.name === "Card Payments" && cardPaymentsAmount !== 0 && (
                  <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
                    {formatEuros(cardPaymentsAmount)}
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
