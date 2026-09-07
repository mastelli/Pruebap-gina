"use client"

import { useState, useMemo } from "react"
import { useBalanceStore } from "@/lib/balance-store"
import { computeDerived, computeRatios, fmtEuro, pct, CASHFLOW_INCOME_CATEGORIES, CASHFLOW_EXPENSE_CATEGORIES, ASSET_CURRENT_CATEGORIES, ASSET_NONCURRENT_CATEGORIES, LIABILITY_CURRENT_CATEGORIES, LIABILITY_NONCURRENT_CATEGORIES, CATEGORY_LABELS, generateId } from "@/lib/balance-engine"
import type { BalanceItem, CashFlowEntry } from "@/lib/balance-engine"
import { useTransactions, getPeriodPrefix } from "@/lib/transactions"
import { usePortfolioEurTotal, usePortfolioCash } from "@/components/portfolio-total"
import { getCategoryFor, isInternalTransferTransaction } from "@/lib/categories"
import { getIncomeBreakdown } from "@/lib/income"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, CreditCard, Activity, Target, Landmark, CircleDollarSign, PiggyBank, ShieldCheck, BarChart3, ArrowUpRight, ArrowDownRight, RefreshCcw, RefreshCw } from "lucide-react"
import { Balance2Charts } from "./balance2-charts"
import { useLanguage } from "@/lib/i18n"

function KPICard({ title, value, subtitle, icon: Icon, trend }: { title: string; value: string; subtitle?: string; icon: React.ElementType; trend?: { value: string; positive: boolean } }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.positive ? <ArrowUpRight className="h-3 w-3 text-green-500" /> : <ArrowDownRight className="h-3 w-3 text-red-500" />}
            <span className={`text-xs ${trend.positive ? "text-green-500" : "text-red-500"}`}>{trend.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddItemForm({ type, onAdd, onClose }: { type: "asset" | "liability"; onAdd: (item: Omit<BalanceItem, "id">) => void; onClose: () => void }) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [assetType, setAssetType] = useState<"current" | "noncurrent">("current")
  const [value, setValue] = useState("")
  const [notes, setNotes] = useState("")

  const categories = type === "asset"
    ? (assetType === "current" ? ASSET_CURRENT_CATEGORIES : ASSET_NONCURRENT_CATEGORIES)
    : (assetType === "current" ? LIABILITY_CURRENT_CATEGORIES : LIABILITY_NONCURRENT_CATEGORIES)

  const handleSubmit = () => {
    if (!name || !category || !value) return
    onAdd({
      name,
      category,
      value: parseFloat(value),
      type: assetType,
      notes,
      valuationDate: new Date().toISOString().slice(0, 10),
    })
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Cuenta bancaria" />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select value={assetType} onValueChange={(v) => { setAssetType(v as "current" | "noncurrent"); setCategory("") }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Corriente (corto plazo)</SelectItem>
            <SelectItem value="noncurrent">No corriente (largo plazo)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Categoría</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Valor (€)</Label>
        <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
      </div>
      <div>
        <Label>Notas (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detalles adicionales..." />
      </div>
      <Button onClick={handleSubmit} className="w-full">Guardar</Button>
    </div>
  )
}

function AddCashFlowForm({ onAdd, onClose }: { onAdd: (entry: Omit<CashFlowEntry, "id">) => void; onClose: () => void }) {
  const [type, setType] = useState<"income" | "expense">("income")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")

  const categories = type === "income" ? CASHFLOW_INCOME_CATEGORIES : CASHFLOW_EXPENSE_CATEGORIES

  const handleSubmit = () => {
    if (!category || !amount) return
    onAdd({
      type,
      category,
      amount: parseFloat(amount),
      date: new Date().toISOString().slice(0, 10),
      notes,
    })
    onClose()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo</Label>
        <Select value={type} onValueChange={(v) => { setType(v as "income" | "expense"); setCategory("") }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Ingreso</SelectItem>
            <SelectItem value="expense">Gasto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Categoría</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Importe (€)</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </div>
      <div>
        <Label>Notas (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detalles..." />
      </div>
      <Button onClick={handleSubmit} className="w-full">Guardar</Button>
    </div>
  )
}

export function Balance2Dashboard() {
  const { snapshot, addAsset, removeAsset, addLiability, removeLiability, addCashFlow, removeCashFlow, saveSnapshot, resetToDemo } = useBalanceStore()
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [showAddLiability, setShowAddLiability] = useState(false)
  const [showAddCashFlow, setShowAddCashFlow] = useState(false)
  const { t } = useLanguage()

  const { transactions, checkingBalance } = useTransactions()
  const portfolioTotal = usePortfolioEurTotal()
  const portfolioCash = usePortfolioCash()

  const autoData = useMemo(() => {
    const cash = (checkingBalance ?? 0) + portfolioCash
    const investments = portfolioTotal.total ?? 0

    const latestPeriod = getPeriodPrefix(transactions, new Date().getMonth() + 1)
    const incomeBreakdown = getIncomeBreakdown(transactions, latestPeriod)
    const salary = incomeBreakdown.salary

    const currentMonth = new Date().toISOString().slice(0, 7)
    const monthExpenses = transactions
      .filter((t) => {
        if (t.amount >= 0) return false
        if (isInternalTransferTransaction(t)) return false
        return t.date.startsWith(currentMonth)
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const autoAssets: BalanceItem[] = []
    if (cash > 0) {
      autoAssets.push({ id: "auto-cash", name: "Efectivo y cuentas", category: "Checking Account", value: cash, type: "current", notes: "Sincronizado desde Análisis" })
    }
    if (investments > 0) {
      autoAssets.push({ id: "auto-investments", name: "Inversiones", category: "Stocks/ETFs", value: investments, type: "current", notes: "Sincronizado desde Análisis" })
    }

    const autoCashFlow: CashFlowEntry[] = []
    if (salary > 0) {
      autoCashFlow.push({ id: "auto-salary", type: "income", category: "Salary", amount: salary, date: new Date().toISOString().slice(0, 10), notes: "Sincronizado desde Análisis" })
    }
    if (monthExpenses > 0) {
      autoCashFlow.push({ id: "auto-expenses", type: "expense", category: "Other Expenses", amount: monthExpenses, date: new Date().toISOString().slice(0, 10), notes: "Sincronizado desde Análisis" })
    }

    return { cash, investments, salary, monthExpenses, autoAssets, autoCashFlow }
  }, [checkingBalance, portfolioCash, portfolioTotal.total, transactions])

  const allAssets = useMemo(() => [...autoData.autoAssets, ...(snapshot?.assets ?? [])], [autoData.autoAssets, snapshot?.assets])
  const allCashFlow = useMemo(() => [...autoData.autoCashFlow, ...(snapshot?.cashFlow ?? [])], [autoData.autoCashFlow, snapshot?.cashFlow])

  if (!snapshot) return null

  const d = computeDerived(allAssets, snapshot.liabilities, allCashFlow, snapshot.essentialMonthlyExpenses)
  const ratios = computeRatios(d)

  const healthColor = (h: "good" | "warning" | "critical") => h === "good" ? "text-green-500" : h === "warning" ? "text-yellow-500" : "text-red-500"
  const healthBg = (h: "good" | "warning" | "critical") => h === "good" ? "bg-green-500" : h === "warning" ? "bg-yellow-500" : "bg-red-500"
  const healthBadge = (h: "good" | "warning" | "critical") => h === "good" ? "bg-green-500/10 text-green-500" : h === "warning" ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"

  const assetCurrent = allAssets.filter((a) => a.type === "current")
  const assetNonCurrent = allAssets.filter((a) => a.type === "noncurrent")
  const liabCurrent = snapshot.liabilities.filter((l) => l.type === "current")
  const liabNonCurrent = snapshot.liabilities.filter((l) => l.type === "noncurrent")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Balance")}</h1>
          <p className="text-muted-foreground">{t("Personal financial balance")}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
            <RefreshCw className="h-3 w-3" />
            {t("Synced from Analytics")}
          </div>
          <Button variant="outline" size="sm" onClick={saveSnapshot}><BarChart3 className="h-4 w-4 mr-1" />{t("Save Snapshot")}</Button>
          <Button variant="outline" size="sm" onClick={resetToDemo}><RefreshCcw className="h-4 w-4 mr-1" />{t("Reset Demo")}</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title={t("Net Worth")} value={fmtEuro(d.netWorth)} icon={Landmark} />
        <KPICard title={t("Total Assets")} value={fmtEuro(d.totalAssets)} icon={Wallet} />
        <KPICard title={t("Total Liabilities")} value={fmtEuro(d.totalLiabilities)} icon={CreditCard} />
        <KPICard title={t("Monthly Cash Flow")} value={fmtEuro(d.monthlyCashFlow)} icon={CircleDollarSign} trend={d.monthlyCashFlow >= 0 ? { value: "+ este mes", positive: true } : { value: "- este mes", positive: false }} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title={t("Current Assets")} value={fmtEuro(d.currentAssets)} icon={PiggyBank} />
        <KPICard title={t("Non-current Assets")} value={fmtEuro(d.nonCurrentAssets)} icon={TrendingUp} />
        <KPICard title={t("Current Liabilities")} value={fmtEuro(d.currentLiabilities)} icon={Activity} />
        <KPICard title={t("Non-current Liabilities")} value={fmtEuro(d.nonCurrentLiabilities)} icon={TrendingDown} />
      </div>

      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="balance">{t("Balance")}</TabsTrigger>
          <TabsTrigger value="assets">{t("Assets")}</TabsTrigger>
          <TabsTrigger value="liabilities">{t("Liabilities")}</TabsTrigger>
          <TabsTrigger value="ratios">{t("Ratios")}</TabsTrigger>
          <TabsTrigger value="cashflow">{t("Cash Flow")}</TabsTrigger>
          <TabsTrigger value="charts">{t("Charts")}</TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>{t("Balance Visual")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-green-600">{t("ACTIVOS")}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>{t("Current Assets")}</span><span className="font-mono">{fmtEuro(d.currentAssets)}</span></div>
                    <div className="flex justify-between text-sm"><span>{t("Non-current Assets")}</span><span className="font-mono">{fmtEuro(d.nonCurrentAssets)}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold"><span>{t("TOTAL ASSETS")}</span><span className="font-mono">{fmtEuro(d.totalAssets)}</span></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-600">{t("PASIVOS + PATRIMONIO")}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>{t("Current Liabilities")}</span><span className="font-mono">{fmtEuro(d.currentLiabilities)}</span></div>
                    <div className="flex justify-between text-sm"><span>{t("Non-current Liabilities")}</span><span className="font-mono">{fmtEuro(d.nonCurrentLiabilities)}</span></div>
                    <div className="flex justify-between text-sm"><span>{t("Net Worth")} (A - P)</span><span className="font-mono">{fmtEuro(d.netWorth)}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold"><span>{t("TOTAL PASIVOS + PATRIMONIO")}</span><span className="font-mono">{fmtEuro(d.totalLiabilities + d.netWorth)}</span></div>
                  </div>
                </div>
              </div>
              {Math.abs(d.totalAssets - (d.totalLiabilities + d.netWorth)) > 0.01 && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
                  ⚠ {t("Discrepancy detected")}: {fmtEuro(Math.abs(d.totalAssets - (d.totalLiabilities + d.netWorth)))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />{t("Financial Health")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {ratios.map((r) => (
                  <div key={r.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">{r.formattedValue}</span>
                        <Badge className={healthBadge(r.health)}>{r.health === "good" ? "OK" : r.health === "warning" ? "!" : "!!"}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />{t("Emergency Fund")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6">
                  <p className="text-4xl font-bold">{d.emergencyFundMonths.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t("months of essential expenses covered")}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>{t("Liquid Assets")}</span><span className="font-mono">{fmtEuro(d.currentAssets)}</span></div>
                  <div className="flex justify-between text-sm"><span>{t("Essential Monthly Expenses")}</span><span className="font-mono">{fmtEuro(d.essentialMonthlyExpenses)}</span></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {d.emergencyFundMonths >= 6 ? "✓ Tu liquidez cubre más de 6 meses de gastos esenciales." : d.emergencyFundMonths >= 3 ? "Tu liquidez cubre entre 3 y 6 meses. Considera aumentar tu fondo de emergencia." : "Tu liquidez es inferior a 3 meses de gastos. Se recomienda construir un fondo de emergencia."}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{t("Assets")}</h3>
            <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("Add Asset")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{t("Add Asset")}</DialogTitle></DialogHeader><AddItemForm type="asset" onAdd={addAsset} onClose={() => setShowAddAsset(false)} /></DialogContent>
            </Dialog>
          </div>
          {[{ title: t("Current Assets"), items: assetCurrent }, { title: t("Non-current Assets"), items: assetNonCurrent }].map(({ title, items }) => (
            <Card key={title}>
              <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
              <CardContent>
                {items.length === 0 ? <p className="text-sm text-muted-foreground">{t("No items")}</p> : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{item.name}</p>
                            {item.id.startsWith("auto-") && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{t("Synced")}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[item.category] || item.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">{fmtEuro(item.value)}</span>
                          {!item.id.startsWith("auto-") && <Button variant="ghost" size="sm" onClick={() => removeAsset(item.id)}><Trash2 className="h-3 w-3" /></Button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{t("Liabilities")}</h3>
            <Dialog open={showAddLiability} onOpenChange={setShowAddLiability}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("Add Liability")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{t("Add Liability")}</DialogTitle></DialogHeader><AddItemForm type="liability" onAdd={addLiability} onClose={() => setShowAddLiability(false)} /></DialogContent>
            </Dialog>
          </div>
          {[{ title: t("Current Liabilities"), items: liabCurrent }, { title: t("Non-current Liabilities"), items: liabNonCurrent }].map(({ title, items }) => (
            <Card key={title}>
              <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
              <CardContent>
                {items.length === 0 ? <p className="text-sm text-muted-foreground">{t("No items")}</p> : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[item.category] || item.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">{fmtEuro(item.value)}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeLiability(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ratios" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {ratios.map((r) => (
              <Card key={r.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{r.label}</span>
                    <span className="text-xl font-bold">{r.formattedValue}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full ${healthBg(r.health)}`} style={{ width: `${Math.min(Math.max(r.value / (r.label.includes("Endeudamiento") || r.label.includes("Deuda") ? 1 : 3) * 100, 5), 100)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">{t("Cash Flow")}</h3>
            <Dialog open={showAddCashFlow} onOpenChange={setShowAddCashFlow}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />{t("Add Entry")}</Button></DialogTrigger>
              <DialogContent><DialogHeader><DialogTitle>{t("Add Cash Flow Entry")}</DialogTitle></DialogHeader><AddCashFlowForm onAdd={addCashFlow} onClose={() => setShowAddCashFlow(false)} /></DialogContent>
            </Dialog>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("Total Income")}</p><p className="text-2xl font-bold text-green-500">{fmtEuro(allCashFlow.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0))}</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("Total Expenses")}</p><p className="text-2xl font-bold text-red-500">{fmtEuro(allCashFlow.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0))}</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">{t("Net Cash Flow")}</p><p className={`text-2xl font-bold ${d.monthlyCashFlow >= 0 ? "text-green-500" : "text-red-500"}`}>{fmtEuro(d.monthlyCashFlow)}</p></CardContent></Card>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base text-green-600">{t("Incomes")}</CardTitle></CardHeader>
              <CardContent>
                {allCashFlow.filter((e) => e.type === "income").length === 0 ? <p className="text-sm text-muted-foreground">{t("No entries")}</p> : (
                  <div className="space-y-2">
                    {allCashFlow.filter((e) => e.type === "income").map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{CATEGORY_LABELS[e.category] || e.category}</span>
                          {e.id.startsWith("auto-") && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{t("Synced")}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-green-500">{fmtEuro(e.amount)}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeCashFlow(e.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base text-red-600">{t("Expenses")}</CardTitle></CardHeader>
              <CardContent>
                {allCashFlow.filter((e) => e.type === "expense").length === 0 ? <p className="text-sm text-muted-foreground">{t("No entries")}</p> : (
                  <div className="space-y-2">
                    {allCashFlow.filter((e) => e.type === "expense").map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{CATEGORY_LABELS[e.category] || e.category}</span>
                          {e.id.startsWith("auto-") && <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">{t("Synced")}</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-red-500">{fmtEuro(e.amount)}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeCashFlow(e.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <Balance2Charts snapshot={{ ...snapshot, assets: allAssets, cashFlow: allCashFlow }} derived={d} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
