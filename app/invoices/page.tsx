"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { PlusCircle, Receipt, Trash2, Paperclip } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface Invoice {
  id: string
  type: string
  amount: number
  currency: string
  date: string
  fileName?: string
}

const INVOICE_TYPES = ["Electricity Bill", "Internet Bill", "Water Bill", "Other"]
const CURRENCIES = ["EUR", "USD", "GBP"]
const STORAGE_KEY = "appInvoices"
const DB_NAME = "app-invoices-files"
const STORE_NAME = "files"

const EMPTY_FORM = {
  type: "Electricity Bill",
  amount: "",
  currency: "EUR",
  date: "",
  fileName: "",
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return dbPromise
}

async function saveInvoiceFile(id: string, file: Blob): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(file, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function getInvoiceFile(id: string): Promise<Blob | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const request = tx.objectStore(STORE_NAME).get(id)
    request.onsuccess = () => resolve(request.result as Blob | undefined)
    request.onerror = () => reject(request.error)
  })
}

async function deleteInvoiceFile(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
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
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

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
      setPendingFile(null)
      setFileInputKey((key) => key + 1)
    }
  }, [isModalOpen])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    if (!isPdf) {
      toast.error(t("Only PDF files are allowed"))
      event.target.value = ""
      return
    }

    setPendingFile(file)
    setForm((prev) => ({ ...prev, fileName: file.name }))
  }

  const handleAdd = async () => {
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

    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2)}`
    if (pendingFile) {
      try {
        await saveInvoiceFile(id, pendingFile)
      } catch {
        toast.error(t("Could not save the file"))
        return
      }
    }

    setInvoices((prev) => [
      ...prev,
      {
        id,
        type: form.type,
        amount: value,
        currency: form.currency,
        date: form.date,
        fileName: pendingFile?.name,
      },
    ])
    toast.success(t("Invoice added"))
    setIsModalOpen(false)
  }

  const handleDownload = async (invoice: Invoice) => {
    try {
      const file = await getInvoiceFile(invoice.id)
      if (!file) {
        toast.error(t("File not found"))
        return
      }
      const url = URL.createObjectURL(file)
      const link = document.createElement("a")
      link.href = url
      link.download = invoice.fileName || `${invoice.type}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error(t("File not found"))
    }
  }

  const handleDelete = async (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    try {
      await deleteInvoiceFile(id)
    } catch {
      // si falla el borrado del fichero, la factura ya no aparece
    }
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
                  {invoice.fileName && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDownload(invoice)}
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="sr-only">{t("Download invoice")}</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(invoice.id)}
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
            <div className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <label htmlFor="invoice-file" className="cursor-pointer">
                  <Paperclip className="mr-2 h-4 w-4" />
                  {form.fileName || t("Import file (.pdf)")}
                </label>
              </Button>
              <input
                key={fileInputKey}
                id="invoice-file"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground">{t("File required in .pdf format")}</p>
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
