"use client"

import { useEffect, useState } from "react"
import { PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLanguage } from "@/lib/i18n"
import { useTransactions, getPeriodPrefix } from "@/lib/transactions"
import { storageGetItem, storageSetItem } from "@/lib/auth"
import {
  getCategoryFor,
  getAllExpenseCategories,
  INTERNAL_TRANSFER_CATEGORY,
  isInternalTransferTransaction,
  addCustomCategory,
} from "@/lib/categories"
import type { CustomCategoryDef } from "@/lib/categories"

const BUDGETS_STORAGE_KEY = "appExpenseBudgets"

type Budgets = Record<string, number>

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

const OVER_HUE_STOPS: Array<[number, number]> = [
  [1.0, 120],
  [1.1, 85],
  [1.25, 38],
  [1.4, 0],
]

function overBudgetHue(ratio: number): number {
  if (ratio <= OVER_HUE_STOPS[0][0]) return OVER_HUE_STOPS[0][1]
  for (let i = 1; i < OVER_HUE_STOPS.length; i++) {
    const [r1, h1] = OVER_HUE_STOPS[i]
    if (ratio <= r1) {
      const [r0, h0] = OVER_HUE_STOPS[i - 1]
      return h0 + ((h1 - h0) * (ratio - r0)) / (r1 - r0)
    }
  }
  return 0
}

export function ExpenseTypes({ month }: { month: string }) {
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const [budgets, setBudgets] = useState<Budgets>({})
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#66bb6a")

  useEffect(() => {
    try {
      const raw = storageGetItem(BUDGETS_STORAGE_KEY)
      if (raw) setBudgets(JSON.parse(raw) as Budgets)
    } catch {
      // almacenamiento no disponible
    }
  }, [])

  const saveBudget = (category: string, value: number) => {
    setBudgets((prev) => {
      const next = { ...prev, [category]: value }
      try {
        storageSetItem(BUDGETS_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // almacenamiento no disponible
      }
      return next
    })
  }

  const handleAddCategory = () => {
    if (!newName.trim()) return
    const cat: CustomCategoryDef = {
      key: newName.trim(),
      color: newColor,
      keywords: [],
    }
    addCustomCategory(cat)
    setBudgets((prev) => ({ ...prev, [newName.trim()]: 0 }))
    setNewName("")
    setNewColor("#66bb6a")
    setOpen(false)
  }

  const prefix = getPeriodPrefix(transactions, month)

  const allDefs = getAllExpenseCategories().filter((def) => def.key !== INTERNAL_TRANSFER_CATEGORY)
  const spentByCategory: Record<string, number> = {}
  for (const def of allDefs) spentByCategory[def.key] = 0
  for (const transaction of transactions) {
    if (transaction.amount >= 0 || !transaction.date.startsWith(prefix)) continue
    if (isInternalTransferTransaction(transaction)) continue
    spentByCategory[getCategoryFor(transaction)] += Math.abs(transaction.amount)
  }

  const sortedDefs = [...allDefs].sort((a, b) => t(a.key).localeCompare(t(b.key), "es"))

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{t("Click on a category to set its monthly budget")}</span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="mr-1.5 h-4 w-4" /> {t("Add Category")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("Add Category")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="new-cat-name">{t("Category name")}</Label>
                  <Input
                    id="new-cat-name"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="Ej: Ocio digital"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-cat-color">{t("Color")}</Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="new-cat-color"
                      type="color"
                      value={newColor}
                      onChange={(event) => setNewColor(event.target.value)}
                      className="h-10 w-10 cursor-pointer rounded border border-border"
                    />
                    <span className="text-sm text-muted-foreground">{newColor}</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button onClick={handleAddCategory}>
                  {t("Add")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-2 pb-4 md:grid-cols-2">
        {sortedDefs.map((def) => {
          const spent = spentByCategory[def.key]
          const budget = budgets[def.key] ?? 0
          const ratio = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
          return (
            <div key={def.key} className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{t(def.key)}</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder={t("Budget")}
                    className="h-8 w-28 text-right"
                    value={budget > 0 ? budget : ""}
                    onChange={(event) => saveBudget(def.key, Number(event.target.value) || 0)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("Spent")}: {formatEuros(spent)}
              </p>
              {budget > 0 && (
                <div className="w-full h-1.5 rounded-full bg-secondary">
                  <div
                    className={`h-1.5 rounded-full ${spent >= budget ? "" : "bg-primary"}`}
                    style={{
                      ...(spent >= budget
                        ? { backgroundColor: `hsl(${overBudgetHue(spent / budget)} 72% 42%)` }
                        : {}),
                      width: `${ratio}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
