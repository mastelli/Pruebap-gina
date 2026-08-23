"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, BankMovementInput } from "@/lib/transactions"

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

const EMPTY_FORM = {
  type: "expense" as "expense" | "income",
  amount: "",
  date: "",
  concept: "",
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { t } = useLanguage()
  const { addBankMovements, updateCheckingBalance } = useTransactions()

  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM)
    }
  }, [isOpen])

  const handleSubmit = () => {
    const normalized = form.amount.trim().replace(",", ".")
    const value = Number.parseFloat(normalized)

    if (!normalized || Number.isNaN(value) || value <= 0) {
      toast.error(t("Please enter a valid amount"))
      return
    }
    if (!form.date) {
      toast.error(t("Please select a date"))
      return
    }

    const movement: BankMovementInput = {
      date: form.date,
      concept: form.concept.trim() || "Sin concepto",
      amount: form.type === "expense" ? -value : value,
    }

    const added = addBankMovements([movement])
    if (added > 0) {
      // El gasto resta del saldo de Corriente; el ingreso suma
      updateCheckingBalance(movement.amount)
      toast.success(t("Transaction added"))
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Add manual transaction")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-type">{t("Type")}</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm((prev) => ({ ...prev, type: value as "expense" | "income" }))}
            >
              <SelectTrigger id="transaction-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">{t("Expense")}</SelectItem>
                <SelectItem value="income">{t("Income")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-amount">{t("Amount")}</Label>
            <Input
              id="transaction-amount"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-date">{t("Date")}</Label>
            <Input
              id="transaction-date"
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction-concept">{t("Concept")}</Label>
            <Input
              id="transaction-concept"
              type="text"
              placeholder={t("Sin concepto")}
              value={form.concept}
              onChange={(event) => setForm((prev) => ({ ...prev, concept: event.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button onClick={handleSubmit}>{t("Add")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
