"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Upload, PlusCircle } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { parseBankMovements } from "@/lib/bank-import"
import { useTransactions } from "@/lib/transactions"
import { AddTransactionModal } from "@/components/add-transaction-modal"

export function AnalyticsHeader({ titleKey = "Analytics" }: { titleKey?: string }) {
  const { t } = useLanguage()
  const { addBankMovements, setCheckingBalance } = useTransactions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">{t(titleKey)}</h2>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          {t("Add manual transaction")}
        </Button>
        <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          {t("Import data")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".43,.txt,.csv,text/plain,text/csv"
          className="hidden"
          onChange={handleFileChange}
          title={t("Import data")}
        />
      </div>
      <AddTransactionModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />
    </div>
  )
}