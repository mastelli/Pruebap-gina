"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Receipt, Trash2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface Invoice {
  id: string
  type: string
  amount: number
  currency: string
  date: string
}

const INVOICE_TYPES = ["Electricity Bill", "Internet Bill", "Water Bill", "Other"]
const CURRENCIES = ["EUR", "USD", "GBP"]
const STORAGE_KEY = "appInvoices"

const EMPTY_FORM = {
  type: "Electricity Bill",
  amount: "",
  currency: "EUR",
  date: "",
}

function loadInvoices(): Invoice[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function sortByDateDesc(invoices: Invoice[]): Invoice[] {
  return [...invoices].sort((a, b) => b.date.localeCompare(a.date))
}

export default function InvoicesPage() {
  const { t } = useLanguage()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    setInvoices(loadInvoices())
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
    } catch {
      // almacenamiento no disponible
    }
  }, [invoices])

  useEffect(() => {
    if (isModalOpen) {
      setForm(EMPTY_FORM)
    }
  }, [isModalOpen])

  const handleAdd = () => {
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

    setInvoices((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: form.type,
        amount: value,
        currency: form.currency,
        date: form.date,
      },
    ])
    toast.success(t("Invoice added"))
    setIsModalOpen(false)
  }

  const formatAmount = (amount: number, currency: string) =>
    amount.toLocaleString("es-ES", { style: "currency", currency })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t("Invoices")}</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> {t("Add Invoice")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" /> {t("Invoices")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {sortByDateDesc(invoices).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t(invoice.type)}</p>
                  <p className="text-xs text-muted-foreground">{invoice.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{invoice.currency}</Badge>
                  <span className="text-sm font-medium tabular-nums text-red-600 dark:text-red-400">
                    -{formatAmount(invoice.amount, invoice.currency)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{t("Delete")}</span>
                  </Button>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("No invoices yet")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Add Invoice")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-type">{t("Invoice type")}</Label>
              <Select value={form.type} onValueChange={(value) => setForm((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger id="invoice-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {INVOICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-amount">{t("Amount")}</Label>
              <Input
                id="invoice-amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-currency">{t("Currency")}</Label>
              <Select value={form.currency} onValueChange={(value) => setForm((prev) => ({ ...prev, currency: value }))}>
                <SelectTrigger id="invoice-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-date">{t("Payment date")}</Label>
              <Input
                id="invoice-date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleAdd}>{t("Add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
