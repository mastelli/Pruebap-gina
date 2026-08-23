"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

const initialBills = [
  { id: 1, name: "Electricity Bill", dueDate: "2023-07-15" },
  { id: 2, name: "Internet Service", dueDate: "2023-07-18" },
  { id: 3, name: "Credit Card Payment", dueDate: "2023-07-25" },
  { id: 4, name: "Water Bill", dueDate: "2023-07-30" },
]

export function QuickBillPay() {
  const [bills] = useState(initialBills)
  const { t } = useLanguage()

  return (
    <Card className="h-full w-full">
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
                  <p className="text-sm text-muted-foreground">
                    {t("Due:")} {bill.dueDate}
                  </p>
                </div>
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
