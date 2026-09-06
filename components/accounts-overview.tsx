"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, PlusCircle } from "lucide-react"
import { AddTransactionModal } from "./add-transaction-modal"
import { useLanguage } from "@/lib/i18n"
import { parseBankMovements } from "@/lib/bank-import"
import { useTransactions } from "@/lib/transactions"
import { isInternalTransferTransaction } from "@/lib/categories"

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function AccountsOverview() {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()
  const { addBankMovements, setCheckingBalance, transactions } = useTransactions()

  const now = new Date()
  const currentYear = `${now.getFullYear()}`
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
  const monthsElapsed = now.getMonth() + 1

  const monthlyIncome = transactions
    .filter(
      (transaction) =>
        transaction.amount > 0 &&
        transaction.date.startsWith(currentYear) &&
        transaction.date.slice(5, 7) === currentMonth,
    )
    .filter((transaction) => !isInternalTransferTransaction(transaction))
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const monthlyExpenses = transactions
    .filter(
      (transaction) =>
        transaction.amount < 0 &&
        transaction.date.startsWith(currentYear) &&
        transaction.date.slice(5, 7) === currentMonth,
    )
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

  const yearlyIncome = transactions
    .filter((transaction) => transaction.amount > 0 && transaction.date.startsWith(currentYear))
    .filter((transaction) => !isInternalTransferTransaction(transaction))
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  const yearlyExpenses = transactions
    .filter((transaction) => transaction.amount < 0 && transaction.date.startsWith(currentYear))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

  const monthlyIncomeAverage = yearlyIncome / monthsElapsed
  const monthlyExpenseAverage = yearlyExpenses / monthsElapsed

  // De momento sin deteccion: se mostrara 0,00 EUR hasta definir como detectar ahorro/inversion
  const savingsAmount = 0

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const movements = parseBankMovements(content)

      if (movements.length === 0) {
        toast.error(t("No expenses found in the file"))
        return
      }

      // El saldo posterior de la primera línea del archivo es el saldo actual de Corriente
      const firstBalance = movements.find((movement) => typeof movement.balance === "number")?.balance
      if (typeof firstBalance === "number") {
        setCheckingBalance(firstBalance)
      }

      const addedTransactions = addBankMovements(movements)
      if (addedTransactions.length > 0) {
        toast.success(`${addedTransactions.length} ${t("movements imported")}`)
      }
    } catch {
      toast.error(t("Error reading the file"))
    } finally {
      event.target.value = ""
    }
  }

  return (
    <Card className="flex h-[390px] w-full flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t("Accounts Overview")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">{t("Total Income")}</span>
            <span className="font-medium tabular-nums text-green-600 dark:text-green-400">
              {formatEuros(monthlyIncome)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t("Average Income")}</span>
            <span className="text-sm font-medium tabular-nums">{formatEuros(monthlyIncomeAverage)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">{t("Total Expenses")}</span>
            <span className="font-medium tabular-nums text-red-600 dark:text-red-400">
              {formatEuros(monthlyExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t("Average Expenses")}</span>
            <span className="text-sm font-medium tabular-nums">{formatEuros(monthlyExpenseAverage)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">{t("Savings/Investment")}</span>
            <span className="font-medium tabular-nums">{formatEuros(savingsAmount)}</span>
          </div>
        </div>
        <div className="mt-auto space-y-2 pt-6">
          <Button className="w-full h-10" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> {t("Add bank statement")}
          </Button>
          <Button variant="outline" className="w-full h-10" onClick={() => setIsAddTransactionModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> {t("Add manual transaction")}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".43,.txt,.csv,text/plain,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
      <AddTransactionModal isOpen={isAddTransactionModalOpen} onClose={() => setIsAddTransactionModalOpen(false)} />
    </Card>
  )
}
