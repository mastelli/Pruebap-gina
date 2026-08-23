"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Upload, PlusCircle } from "lucide-react"
import { AddTransactionModal } from "./add-transaction-modal"
import { useLanguage } from "@/lib/i18n"
import { parseBankMovements } from "@/lib/bank-import"
import { useTransactions } from "@/lib/transactions"

const accounts = [
  { name: "Checking" },
  { name: "Savings/Investment" },
]

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export function AccountsOverview() {
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()
  const { addBankMovements, checkingBalance, setCheckingBalance } = useTransactions()

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

      addBankMovements(movements)

      toast.success(`${movements.length} ${t("movements imported")}`)
    } catch {
      toast.error(t("Error reading the file"))
    } finally {
      event.target.value = ""
    }
  }

  return (
    <Card className="h-full w-full min-h-[420px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("Accounts Overview")}</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="space-y-2">
          {accounts.map((account) => (
            <div key={account.name} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t(account.name)}</span>
              {account.name === "Checking" && checkingBalance !== null && (
                <span className="text-sm font-medium tabular-nums">{formatEuros(checkingBalance)}</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-auto space-y-2 pt-6">
          <Button size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> {t("Add bank statement")}
          </Button>
          <Button size="sm" variant="outline" className="w-full" onClick={() => setIsAddTransactionModalOpen(true)}>
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
