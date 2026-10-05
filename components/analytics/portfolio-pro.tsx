"use client"

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Pencil, Plus, Trash2, RefreshCw, Search, Upload, Wallet, Download, ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight } from "lucide-react"
import { applyTransactions, parsePortfolioCsv } from "@/lib/portfolio-csv"
import { InvestmentTips } from "@/components/analytics/investment-tips"
import { FinanceNews } from "@/components/analytics/finance-news"
import { useLanguage } from "@/lib/i18n"
import { storageGetItem, storageSetItem } from "@/lib/auth"
import { exchangeFromSymbol } from "@/lib/exchanges"

// force-redeploy-v2
const STORAGE_KEY = "appPortfolioProV1"
const LEGACY_KEY = "appManualStocks"
const REFRESH_MS = 30 * 1000

type Kind = "stock" | "etf" | "fund" | "other"

interface Purchase {
  id: string
  qty: number
  price: number
  date: string
  orderId?: string
}

interface Position {
  id: string
  symbol: string
  name: string
  exchange: string
  kind: Kind
  currency: string
  purchases: Purchase[]
  isin?: string
  seenOrderIds?: string[]
}

interface SearchHit {
  symbol: string
  name: string
  exchange?: string
  type?: string
  currency?: string
}

interface Quote {
  price?: number
  previousClose?: number | null
  currency?: string
  symbol?: string
  longName?: string
  exchange?: string
}

const KIND_LABEL: Record<Kind, string> = {
  stock: "Acción",
  etf: "ETF",
  fund: "Fondo",
  other: "Otro",
}

function kindFromYahoo(quoteType?: string): Kind {
  const v = (quoteType ?? "").toUpperCase()
  if (v === "ETF") return "etf"
  if (v === "MUTUALFUND") return "fund"
  if (v === "EQUITY") return "stock"
  return "other"
}

function fmtNum(value: number, decimals = 2): string {
  return value.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtMoney(value: number, currency = "EUR"): string {
  const formatted = fmtNum(value, 2)
  if (currency === "EUR") return `${formatted} €`
  return `${formatted} ${currency}`
}

function priceDecimals(price: number): number {
  return Math.abs(price) < 1 ? 4 : 2
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

export function PortfolioPro() {
  const { t } = useLanguage()
  const [positions, setPositions] = useState<Position[]>([])
  const [quotes, setQuotes] = useState<Record<string, Quote>>({})
  const [fx, setFx] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [quoteError, setQuoteError] = useState(false)

  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SearchHit | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [mSymbol, setMSymbol] = useState("")
  const [mName, setMName] = useState("")
  const [mIsin, setMIsin] = useState("")
  const [mExchange, setMExchange] = useState("")
  const [mCurrency, setMCurrency] = useState("EUR")
  const [mKind, setMKind] = useState<Kind>("stock")
  const [buyQty, setBuyQty] = useState("")
  const [buyPrice, setBuyPrice] = useState("")
  const [buyDate, setBuyDate] = useState(todayISO())
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [topUpFor, setTopUpFor] = useState<Position | null>(null)
  const [editBuyFor, setEditBuyFor] = useState<{ posId: string; buyId: string } | null>(null)
  const [eBuyQty, setEBuyQty] = useState("")
  const [eBuyPrice, setEBuyPrice] = useState("")
  const [eBuyDate, setEBuyDate] = useState(todayISO())
  const [editFor, setEditFor] = useState<Position | null>(null)
  const [eSymbol, setESymbol] = useState("")
  const [eName, setEName] = useState("")
  const [eIsin, setEIsin] = useState("")
  const [eExchange, setEExchange] = useState("")
  const [eCurrency, setECurrency] = useState("EUR")
  const [eKind, setEKind] = useState<Kind>("stock")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterText, setFilterText] = useState("")
  const [filterKind, setFilterKind] = useState<"all" | Kind>("all")
  const [sortBy, setSortBy] = useState<"value" | "pnl" | "name">("value")

  useEffect(() => {
    try {
      const raw = storageGetItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setPositions(parsed as Position[])
      }
    } catch {
      // sin almacenamiento
    }
  }, [])

  useEffect(() => {
    try {
      storageSetItem(STORAGE_KEY, JSON.stringify(positions))
    } catch {
      // sin almacenamiento
    }
  }, [positions])

  const refresh = useCallback(async () => {
    if (positions.length === 0) return
    setLoading(true)
    setQuoteError(false)
    try {
      const currencies = [...new Set(positions.map((p) => p.currency).filter((c) => c && c !== "EUR"))]
      const res = await fetch("/api/portfolio-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: positions.map((p) => ({ name: p.symbol, symbol: p.symbol, exchange: p.exchange, isin: p.isin })),
          currencies,
        }),
      })
      if (!res.ok) {
        setQuoteError(true)
        return
      }
      const json = await res.json()
      const results = (json?.results ?? {}) as Record<string, Quote | null>
      const next: Record<string, Quote> = {}
      for (const p of positions) {
        const key = p.symbol.trim().toUpperCase()
        const isinKey = p.isin ? p.isin.trim().toUpperCase() : ""
        const q = results[key] ?? (isinKey ? results[isinKey] : null) ?? results[p.symbol] ?? null
        if (q) next[p.id] = q
      }
      setQuotes(next)
      setFx((json?.fx ?? {}) as Record<string, number>)
      setLastUpdated(Date.now())
    } catch {
      setQuoteError(true)
    } finally {
      setLoading(false)
    }
  }, [positions])

  useEffect(() => {
    void refresh()
    const id = setInterval(() => {
      if (document.hidden) return
      void refresh()
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [refresh])

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (!query || query.trim().length < 1) {
      setHits([])
      return
    }
    searchTimer.current = setTimeout(async () => {
      try {
        setSearching(true)
        const res = await fetch(`/api/ticker-search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const json = await res.json()
          setHits(Array.isArray(json?.results) ? json.results : [])
        }
      } catch {
        // sin resultados
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [query])

  const toEur = useCallback(
    (amount: number, currency?: string) => {
      const cur = (currency ?? "EUR").toUpperCase()
      if (!cur || cur === "EUR") return amount
      return amount * (fx[cur] ?? 1)
    },
    [fx],
  )

  const rows = useMemo(() => {
    return positions.map((p) => {
      const qty = p.purchases.reduce((s, x) => s + x.qty, 0)
      const invested = p.purchases.reduce((s, x) => s + x.qty * x.price, 0)
      const avg = qty > 0 ? invested / qty : 0
      const q = quotes[p.id]
      const price = q?.price
      const prev = q?.previousClose ?? null
      const value = price !== undefined ? price * qty : null
      const pnl = price !== undefined ? (price - avg) * qty : null
      const pnlPct = pnl !== null && invested > 0 ? (pnl / invested) * 100 : null
      const dayAbs = price !== undefined && prev !== null && prev !== undefined ? (price - prev) * qty : null
      const dayPct = price !== undefined && prev !== null && prev !== undefined && prev !== 0 ? ((price - prev) / prev) * 100 : null
      const cur = (q?.currency ?? p.currency ?? "EUR").toUpperCase()
      // Si no hay nombre guardado (o es el propio simbolo/ISIN), usar el
      // nombre real que devuelve la cotizacion en vez de dejar el ISIN
      const storedName = (p.name ?? "").trim()
      const nameMissing =
        storedName === "" ||
        storedName.toUpperCase() === p.symbol.trim().toUpperCase() ||
        /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(storedName.toUpperCase())
      const displayName = nameMissing && q?.longName ? q.longName : storedName || p.symbol
      return { p, qty, invested, avg, price, prev, value, pnl, pnlPct, dayAbs, dayPct, cur, displayName }
    })
  }, [positions, quotes])

  const totals = useMemo(() => {
    let investedEur = 0
    let valueEur = 0
    let dayEur = 0
    for (const r of rows) {
      investedEur += toEur(r.invested, r.p.cur)
      if (r.value !== null) valueEur += toEur(r.value, r.cur)
      if (r.dayAbs !== null) dayEur += toEur(r.dayAbs, r.cur)
    }
    const pnlEur = valueEur - investedEur
    return { investedEur, valueEur, pnlEur, pnlPct: investedEur > 0 ? (pnlEur / investedEur) * 100 : null, dayEur }
  }, [rows, toEur])

  const byKind = useMemo(() => {
    const acc: Record<Kind, number> = { stock: 0, etf: 0, fund: 0, other: 0 }
    for (const r of rows) {
      if (r.value !== null) acc[r.p.kind] += toEur(r.value, r.cur)
    }
    return acc
  }, [rows, toEur])

  const visible = useMemo(() => {
    const q = filterText.trim().toLowerCase()
    const list = rows.filter((r) => {
      if (filterKind !== "all" && r.p.kind !== filterKind) return false
      if (!q) return true
      return r.p.symbol.toLowerCase().includes(q) || r.p.name.toLowerCase().includes(q)
    })
    return [...list].sort((a, b) => {
      if (sortBy === "name") return a.p.symbol.localeCompare(b.p.symbol)
      if (sortBy === "pnl") return (b.pnlPct ?? -Infinity) - (a.pnlPct ?? -Infinity)
      const av = a.value !== null ? toEur(a.value, a.cur) : 0
      const bv = b.value !== null ? toEur(b.value, b.cur) : 0
      return bv - av
    })
  }, [rows, filterText, filterKind, sortBy, toEur])

  const resetBuyForm = () => {
    setQuery("")
    setHits([])
    setSelected(null)
    setManualMode(false)
    setMSymbol("")
    setMName("")
    setMIsin("")
    setMExchange("")
    setMCurrency("EUR")
    setMKind("stock")
    setBuyQty("")
    setBuyPrice("")
    setBuyDate(todayISO())
  }

  const addPosition = () => {
    const qty = Number.parseFloat(buyQty)
    const price = Number.parseFloat(buyPrice)
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0 || !buyDate) return
    const base = manualMode
      ? { symbol: mSymbol.trim().toUpperCase(), name: mName.trim() || mSymbol.trim().toUpperCase(), exchange: mExchange.trim(), kind: mKind, currency: mCurrency.toUpperCase() }
      : selected
        ? { symbol: selected.symbol.trim(), name: selected.name, exchange: selected.exchange ?? "", kind: kindFromYahoo(selected.type), currency: (selected.currency ?? "EUR").toUpperCase() }
        : null
    if (!base || !base.symbol) return
    const isin = manualMode ? mIsin.trim().toUpperCase() || undefined : undefined
    const purchase: Purchase = { id: uid("buy"), qty, price, date: buyDate }
    const same = positions.find((p) => p.symbol.toUpperCase() === base.symbol.toUpperCase())
    if (same) {
      setPositions(positions.map((p) => (p.id === same.id ? { ...p, purchases: [...p.purchases, purchase], isin: p.isin ?? isin } : p)))
    } else {
      setPositions([
        ...positions,
        { id: uid("pos"), symbol: base.symbol, name: base.name, exchange: base.exchange, kind: base.kind, currency: base.currency, purchases: [purchase], isin },
      ])
    }
    resetBuyForm()
    setShowAdd(false)
  }

  const addTopUp = () => {
    if (!topUpFor) return
    const qty = Number.parseFloat(buyQty)
    const price = Number.parseFloat(buyPrice)
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0 || !buyDate) return
    const purchase: Purchase = { id: uid("buy"), qty, price, date: buyDate }
    setPositions(positions.map((p) => (p.id === topUpFor.id ? { ...p, purchases: [...p.purchases, purchase] } : p)))
    setTopUpFor(null)
    setBuyQty("")
    setBuyPrice("")
    setBuyDate(todayISO())
  }

  const saveBuyEdit = () => {
    if (!editBuyFor) return
    const qty = Number.parseFloat(eBuyQty)
    const price = Number.parseFloat(eBuyPrice)
    if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0 || !eBuyDate) return
    setPositions(
      positions.map((p) =>
        p.id === editBuyFor.posId
          ? {
              ...p,
              purchases: p.purchases.map((b) =>
                b.id === editBuyFor.buyId ? { ...b, qty, price, date: eBuyDate } : b,
              ),
            }
          : p,
      ),
    )
    setEditBuyFor(null)
  }

  const saveEdit = () => {
    if (!editFor) return
    const symbol = eSymbol.trim()
    if (!symbol) return
    setPositions(
      positions.map((p) =>
        p.id === editFor.id
          ? {
              ...p,
              symbol,
              name: eName.trim() || symbol,
              exchange: eExchange.trim(),
              currency: (eCurrency || "EUR").toUpperCase(),
              kind: eKind,
              isin: eIsin.trim().toUpperCase() || undefined,
            }
          : p,
      ),
    )
    setEditFor(null)
  }

  const removePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id))
  }

  const removePurchase = (posId: string, buyId: string) => {
    setPositions(
      positions
        .map((p) => (p.id === posId ? { ...p, purchases: p.purchases.filter((b) => b.id !== buyId) } : p))
        .filter((p) => p.purchases.length > 0),
    )
  }

  const migrateLegacy = () => {
    try {
      const raw = storageGetItem(LEGACY_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed) || parsed.length === 0) return
      const mapped: Position[] = parsed.map((s: { id?: string; name: string; exchange: string; currency: string; symbol?: string; purchases: Array<{ id: string; price: number; quantity: number; date: string }> }) => ({
        id: uid("pos"),
        symbol: (s.symbol ?? s.name).trim(),
        name: s.name,
        exchange: s.exchange ?? "",
        kind: "stock" as Kind,
        currency: (s.currency ?? "EUR").toUpperCase(),
        purchases: s.purchases.map((b) => ({ id: uid("buy"), qty: b.quantity, price: b.price, date: b.date })),
      }))
      setPositions([...positions, ...mapped])
    } catch {
      // nada que migrar
    }
  }

  const legacyCount = useMemo(() => {
    try {
      const raw = typeof window !== "undefined" ? storageGetItem(LEGACY_KEY) : null
      if (!raw) return 0
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  }, [])

  const csvInputRef = useRef<HTMLInputElement | null>(null)

  const handleCsvFile = async (file: File) => {
    const text = await file.text()
    const { assets, cash } = parsePortfolioCsv(text)
    if (assets.length === 0 && !(cash > 0)) return
    // Filas de transacciones (DEGIRO: con ID de orden o ventas) se
    // concilian por ISIN con FIFO; el resto se suma como compras.
    const txByIsin = new Map<string, typeof assets>()
    const snapshots: typeof assets = []
    for (const a of assets) {
      if (a.orderId || a.side === "sell") {
        const list = txByIsin.get(a.isin) ?? []
        list.push(a)
        txByIsin.set(a.isin, list)
      } else {
        snapshots.push(a)
      }
    }
    setPositions((prev) => {
      const next = [...prev]
      const findByIsin = (isin: string) =>
        next.find(
          (p) =>
            (p.isin && p.isin.toUpperCase() === isin.toUpperCase()) ||
            p.symbol.toUpperCase() === isin.toUpperCase(),
        )
      for (const [isin, rows] of txByIsin) {
        const same = findByIsin(isin)
        const template = rows[0]
        // IDs ya procesados (incluye compras consumidas por ventas) para
        // que reimportar el mismo archivo no duplique nada
        const seen = new Set<string>(same?.seenOrderIds ?? [])
        for (const b of same?.purchases ?? []) {
          if (b.orderId) seen.add(b.orderId)
        }
        const fresh = rows.filter((r) => !r.orderId || !seen.has(r.orderId))
        for (const r of fresh) {
          if (r.orderId) seen.add(r.orderId)
        }
        const seenOrderIds = [...seen]
        const opening = (same?.purchases ?? []).map((b) => ({
          qty: b.qty,
          price: b.price,
          date: b.date,
          orderId: b.orderId,
        }))
        const remaining = applyTransactions(
          opening,
          fresh.map((r) => ({
            quantity: r.quantity,
            price:
              typeof r.csvPrice === "number" && Number.isFinite(r.csvPrice) ? r.csvPrice : 0,
            date: r.date ?? todayISO(),
            orderId: r.orderId,
            side: r.side ?? "buy",
          })),
        )
        if (remaining.length === 0) {
          if (same) next.splice(next.indexOf(same), 1)
          continue
        }
        const purchases: Purchase[] = remaining.map((l) => ({
          id: uid("buy"),
          qty: l.qty,
          price: l.price,
          date: l.date,
          orderId: l.orderId,
        }))
        if (same) {
          const idx = next.indexOf(same)
          next[idx] = { ...same, purchases, seenOrderIds }
        } else {
          next.push({
            id: uid("pos"),
            symbol: isin,
            name: template.product || isin,
            exchange: template.exchange ?? "",
            kind: template.kind ?? (/etf/i.test(template.product) ? "etf" : "stock"),
            currency: (template.currency || "EUR").toUpperCase(),
            purchases,
            isin,
            seenOrderIds,
          })
        }
      }
      for (const a of snapshots) {
        const price =
          typeof a.csvPrice === "number" && Number.isFinite(a.csvPrice)
            ? a.csvPrice
            : typeof a.eurValue === "number" && a.quantity > 0
              ? a.eurValue / a.quantity
              : 0
        const purchase: Purchase = { id: uid("buy"), qty: a.quantity, price, date: a.date ?? todayISO() }
        const same = findByIsin(a.isin)
        if (same) {
          const idx = next.indexOf(same)
          next[idx] = { ...same, purchases: [...same.purchases, purchase] }
        } else {
          next.push({
            id: uid("pos"),
            symbol: a.isin,
            name: a.product || a.isin,
            exchange: "",
            kind: a.kind ?? (/etf/i.test(a.product) ? "etf" : "stock"),
            currency: (a.currency || "EUR").toUpperCase(),
            purchases: [purchase],
            isin: a.isin,
          })
        }
      }
      return next
    })
    if (cash > 0) {
      try {
        storageSetItem("appPortfolioCash", String(cash))
      } catch {
        // almacenamiento no disponible
      }
    }
  }

  const exportCsv = () => {
    const lines = ["symbol;name;type;exchange;currency;quantity;avg_cost;price;value_eur;pnl_pct"]
    for (const r of rows) {
      const vEur = r.value !== null ? toEur(r.value, r.cur) : 0
      lines.push(
        [r.p.symbol, `"${r.p.name.replace(/"/g, "")}"`, KIND_LABEL[r.p.kind], `"${r.p.exchange}"`, r.cur, fmtNum(r.qty, 2), fmtNum(r.avg, 4), r.price !== undefined ? fmtNum(r.price, 4) : "", fmtNum(vEur, 2), r.pnlPct !== null ? fmtNum(r.pnlPct, 2) : ""].join(";"),
      )
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cartera.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const pnlColor = (v: number | null) =>
    v === null ? "" : v >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"

  return (
    <div className="space-y-4">
      {legacyCount > 0 && positions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Tienes {legacyCount} {legacyCount === 1 ? "posición" : "posiciones"} en la cartera anterior. Impórtalas para no empezar de cero (revisa después que cada símbolo apunte al listing correcto).
            </p>
            <Button size="sm" variant="outline" onClick={migrateLegacy}>Importar cartera anterior</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor total</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{fmtMoney(totals.valueEur)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {positions.length} {positions.length === 1 ? "posición" : "posiciones"}
            {lastUpdated ? ` · actualizado ${new Date(lastUpdated).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` : ""}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Invertido</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{fmtMoney(totals.investedEur)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">Coste total de compra</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Beneficio / Pérdida</CardDescription>
            <CardTitle className={`text-2xl tabular-nums ${pnlColor(totals.pnlEur)}`}>
              {totals.pnlEur >= 0 ? "+" : ""}{fmtMoney(totals.pnlEur)}
            </CardTitle>
          </CardHeader>
          <CardContent className={`pt-0 text-xs tabular-nums ${pnlColor(totals.pnlPct)}`}>
            {totals.pnlPct === null ? "—" : `${totals.pnlPct >= 0 ? "+" : ""}${fmtNum(totals.pnlPct, 2)}%`}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hoy</CardDescription>
            <CardTitle className={`flex items-center gap-1 text-2xl tabular-nums ${pnlColor(totals.dayEur)}`}>
              {totals.dayEur >= 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              {totals.dayEur >= 0 ? "+" : ""}{fmtMoney(totals.dayEur)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {quoteError ? "Sin conexión con cotizaciones" : "Variación intradía en euros"}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mayores posiciones</CardTitle>
            <CardDescription>Las 5 posiciones con más valor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin posiciones todavía.</p>}
            {[...rows]
              .sort((a, b) => {
                const av = a.value !== null ? toEur(a.value, a.cur) : 0
                const bv = b.value !== null ? toEur(b.value, b.cur) : 0
                return bv - av
              })
              .slice(0, 5)
              .map((r) => {
                const v = r.value !== null ? toEur(r.value, r.cur) : 0
                const w = totals.valueEur > 0 ? (v / totals.valueEur) * 100 : 0
                return (
                  <div key={r.p.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{r.displayName}</span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="tabular-nums text-muted-foreground">{fmtNum(w, 1)}%</span>
                        <span className="tabular-nums text-muted-foreground">{fmtMoney(v)}</span>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, w)}%` }} />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Asignación</CardTitle>
          <CardDescription>Acciones, ETFs y fondos de inversión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {(Object.keys(byKind) as Kind[]).map((k) => {
              const v = byKind[k]
              const w = totals.valueEur > 0 ? (v / totals.valueEur) * 100 : 0
              return (
                <div key={k} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{KIND_LABEL[k]}</span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tabular-nums text-muted-foreground">{fmtNum(w, 1)}%</span>
                      <span className="tabular-nums text-muted-foreground">{fmtMoney(v)}</span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, w)}%` }} />
                  </div>
                </div>
              )
            })}
        </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="h-5 w-5" /> Mis posiciones
            </CardTitle>
            <CardDescription>Cotizaciones en tiempo real</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => csvInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Importar CSV
            </Button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleCsvFile(file)
                event.target.value = ""
              }}
            />
            <Button size="sm" variant="outline" onClick={exportCsv} disabled={positions.length === 0}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => void refresh()} disabled={loading || positions.length === 0}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualizar
            </Button>
            <Dialog open={showAdd} onOpenChange={(o) => { setShowAdd(o); if (!o) resetBuyForm() }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" />{t("Add Stock")}</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Añadir acción, ETF o fondo</DialogTitle>
                  <DialogDescription>Busca el ticker y elige el listing exacto de tu bolsa. Después indica compra y fecha.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Buscar en todos los mercados</Label>
                    <Button size="sm" variant="ghost" onClick={() => setManualMode(!manualMode)}>
                      {manualMode ? "Usar buscador" : "Entrada manual"}
                    </Button>
                  </div>
                  {!manualMode ? (
                    <div>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: MSFT, VWCE, Iberdrola, SP500…" />
                      </div>
                      {searching && <p className="mt-1 text-xs text-muted-foreground">Buscando…</p>}
                      {hits.length > 0 && !selected && (
                        <div className="mt-2 max-h-56 overflow-auto rounded-md border">
                          {hits.map((h) => (
                            <button
                              key={h.symbol}
                              type="button"
                              className="w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-accent"
                              onClick={() => {
                                setSelected(h)
                                setHits([])
                                setQuery("")
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{h.symbol}</span>
                                <Badge variant="secondary">{KIND_LABEL[kindFromYahoo(h.type)]}</Badge>
                                {h.exchange ? <span className="text-xs text-muted-foreground">{h.exchange}</span> : null}
                                {h.currency ? <span className="ml-auto text-xs text-muted-foreground">{h.currency}</span> : null}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">{h.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {selected && (
                        <div className="mt-2 flex items-start justify-between gap-2 rounded-md border bg-secondary/40 p-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium">
                              {selected.symbol}
                              <Badge variant="secondary">{KIND_LABEL[kindFromYahoo(selected.type)]}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{selected.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {[selected.exchange, selected.currency].filter(Boolean).join(" · ")}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Cambiar</Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Símbolo *</Label>
                        <Input value={mSymbol} onChange={(e) => setMSymbol(e.target.value)} placeholder="Ej: MSF.DE" />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select value={mKind} onValueChange={(v) => setMKind(v as Kind)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stock">Acción</SelectItem>
                            <SelectItem value="etf">ETF</SelectItem>
                            <SelectItem value="fund">Fondo</SelectItem>
                            <SelectItem value="other">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Nombre</Label>
                        <Input value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Ej: Microsoft (Tradegate)" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>ISIN (opcional)</Label>
                        <Input value={mIsin} onChange={(e) => setMIsin(e.target.value)} placeholder="Ej: US0378331005 (necesario para Tradegate)" />
                      </div>
                      <div>
                        <Label>Bolsa</Label>
                        <Input value={mExchange} onChange={(e) => setMExchange(e.target.value)} placeholder="Ej: Tradegate, XETRA, NASDAQ…" />
                      </div>
                      <div>
                        <Label>Divisa</Label>
                        <Select value={mCurrency} onValueChange={setMCurrency}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "SEK", "NOK", "DKK"].map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Cantidad *</Label>
                      <Input type="number" min="0" step="any" value={buyQty} onChange={(e) => setBuyQty(e.target.value)} placeholder="10" />
                    </div>
                    <div>
                      <Label>Precio compra *</Label>
                      <Input type="number" min="0" step="any" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <Label>Fecha *</Label>
                      <Input type="date" value={buyDate} onChange={(e) => setBuyDate(e.target.value)} />
                    </div>
                  </div>
                  <Button className="w-full" onClick={addPosition} disabled={manualMode ? !mSymbol.trim() : !selected}>
                    Añadir a la cartera
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input className="sm:max-w-xs" value={filterText} onChange={(e) => setFilterText(e.target.value)} placeholder="Filtrar por símbolo o nombre…" />
            <Select value={filterKind} onValueChange={(v) => setFilterKind(v as "all" | Kind)}>
              <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo</SelectItem>
                <SelectItem value="stock">Acciones</SelectItem>
                <SelectItem value="etf">ETFs</SelectItem>
                <SelectItem value="fund">Fondos</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "value" | "pnl" | "name")}>
              <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Mayor valor</SelectItem>
                <SelectItem value="pnl">Mejor % P&L</SelectItem>
                <SelectItem value="name">Alfabético</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <Wallet className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 font-medium">Aún no tienes posiciones</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Pulsa «{t("Add Stock")}» y elige el listing exacto de tu bolsa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3">Activo</th>
                    <th className="py-2 pr-3 text-right">Cant.</th>
                    <th className="py-2 pr-3 text-right">Precio</th>
                    <th className="py-2 pr-3 text-right">Coste medio</th>
                    <th className="py-2 pr-3 text-right">Hoy</th>
                    <th className="py-2 pr-3 text-right">P&L</th>
                    <th className="py-2 pr-3 text-right">Valor €</th>
                    <th className="py-2 text-right"><span className="sr-only">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const dec = r.price !== undefined ? priceDecimals(r.price) : 2
                    const vEur = r.value !== null ? toEur(r.value, r.cur) : null
                    const w = totals.valueEur > 0 && vEur !== null ? (vEur / totals.valueEur) * 100 : 0
                    const isOpen = expanded === r.p.id
                    const exch = quotes[r.p.id]?.exchange || r.p.exchange || exchangeFromSymbol(r.p.symbol)
                    return (
                      <Fragment key={r.p.id}>
                        <tr className="border-b transition-colors hover:bg-muted/40">
                          <td className="py-3 pr-3">
                            <button className="flex items-center gap-1 text-left font-medium hover:underline" onClick={() => setExpanded(isOpen ? null : r.p.id)} title={isOpen ? "Ocultar compras" : "Ver compras"}>
                              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              {r.displayName}
                            </button>
                            <div className="ml-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">{r.p.symbol}</span>
                              <Badge variant="secondary">{KIND_LABEL[r.p.kind]}</Badge>
                              {exch ? <span>{exch}</span> : null}
                              <span>· {r.cur}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-right tabular-nums">{fmtNum(r.qty, r.qty % 1 === 0 ? 0 : 4)}</td>
                          <td className="py-3 pr-3 text-right tabular-nums">
                            {r.price !== undefined ? `${fmtNum(r.price, dec)} ${r.cur}` : "—"}
                          </td>
                          <td className="py-3 pr-3 text-right tabular-nums text-muted-foreground">
                            {r.qty > 0 ? `${fmtNum(r.avg, dec)} ${r.cur}` : "—"}
                          </td>
                          <td className={`py-3 pr-3 text-right tabular-nums ${pnlColor(r.dayPct)}`}>
                            {r.dayPct === null ? "—" : `${r.dayPct >= 0 ? "+" : ""}${fmtNum(r.dayPct, 2)}%`}
                          </td>
                          <td className={`py-3 pr-3 text-right tabular-nums font-medium ${pnlColor(r.pnlPct)}`}>
                            {r.pnl !== null && r.pnlPct !== null ? (
                              <span>
                                {r.pnl >= 0 ? "+" : ""}{fmtNum(r.pnl, 2)} ({r.pnlPct >= 0 ? "+" : ""}{fmtNum(r.pnlPct, 2)}%)
                              </span>
                            ) : "—"}
                          </td>
                          <td className="py-3 pr-3 text-right tabular-nums">
                            {vEur !== null ? <span className="font-medium">{fmtMoney(vEur)}</span> : "—"}
                            <div className="text-xs text-muted-foreground">{fmtNum(w, 1)}%</div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Añadir compra"
                                onClick={() => { setTopUpFor(r.p); setBuyQty(""); setBuyPrice(r.price !== undefined ? String(r.price) : ""); setBuyDate(todayISO()) }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Editar"
                                onClick={() => {
                                  setEditFor(r.p)
                                  setESymbol(r.p.symbol)
                                  setEName(r.p.name)
                                  setEIsin(r.p.isin ?? "")
                                  setEExchange(r.p.exchange)
                                  setECurrency(r.p.currency)
                                  setEKind(r.p.kind)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Eliminar" onClick={() => removePosition(r.p.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="border-b bg-secondary/30">
                            <td colSpan={8} className="px-4 py-3">
                              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Compras ({r.p.purchases.length})</p>
                              <div className="space-y-1">
                                {[...r.p.purchases]
                                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                                  .map((b) => (
                                    <div key={b.id} className="flex items-center justify-between gap-2 text-sm">
                                      <span className="tabular-nums">{b.date} · {fmtNum(b.qty, b.qty % 1 === 0 ? 0 : 4)} uds. a {fmtNum(b.price, dec)} {r.cur}</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                          title="Editar compra"
                                          onClick={() => {
                                            setEditBuyFor({ posId: r.p.id, buyId: b.id })
                                            setEBuyQty(String(b.qty))
                                            setEBuyPrice(String(b.price))
                                            setEBuyDate(b.date)
                                          }}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" title="Eliminar compra" onClick={() => removePurchase(r.p.id, b.id)}>
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={topUpFor !== null} onOpenChange={(o) => { if (!o) setTopUpFor(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir compra{topUpFor ? ` · ${topUpFor.symbol}` : ""}</DialogTitle>
            <DialogDescription>Se sumará a la posición existente con su precio y fecha.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Cantidad *</Label>
              <Input type="number" min="0" step="any" value={buyQty} onChange={(e) => setBuyQty(e.target.value)} placeholder="10" />
            </div>
            <div>
              <Label>Precio *</Label>
              <Input type="number" min="0" step="any" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Fecha *</Label>
              <Input type="date" value={buyDate} onChange={(e) => setBuyDate(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={addTopUp}>Guardar compra</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editBuyFor !== null} onOpenChange={(o) => { if (!o) setEditBuyFor(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar compra</DialogTitle>
            <DialogDescription>Modifica cantidad, precio y fecha de esta compra.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Cantidad *</Label>
              <Input type="number" min="0" step="any" value={eBuyQty} onChange={(e) => setEBuyQty(e.target.value)} placeholder="10" />
            </div>
            <div>
              <Label>Precio *</Label>
              <Input type="number" min="0" step="any" value={eBuyPrice} onChange={(e) => setEBuyPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label>Fecha *</Label>
              <Input type="date" value={eBuyDate} onChange={(e) => setEBuyDate(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={saveBuyEdit}>Guardar cambios</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editFor !== null} onOpenChange={(o) => { if (!o) setEditFor(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar posición{editFor ? ` · ${editFor.symbol}` : ""}</DialogTitle>
            <DialogDescription>Modifica los datos del activo. Las compras se mantienen.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Símbolo *</Label>
              <Input value={eSymbol} onChange={(e) => setESymbol(e.target.value)} placeholder="Ej: AAPL" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={eKind} onValueChange={(v) => setEKind(v as Kind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">Acción</SelectItem>
                  <SelectItem value="etf">ETF</SelectItem>
                  <SelectItem value="fund">Fondo</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Nombre</Label>
              <Input value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Ej: Apple Inc." />
            </div>
            <div className="sm:col-span-2">
              <Label>ISIN (opcional)</Label>
              <Input value={eIsin} onChange={(e) => setEIsin(e.target.value)} placeholder="Ej: US0378331005 (necesario para Tradegate)" />
            </div>
            <div>
              <Label>Bolsa</Label>
              <Input value={eExchange} onChange={(e) => setEExchange(e.target.value)} placeholder="Ej: NASDAQ" />
            </div>
            <div>
              <Label>Divisa</Label>
              <Select value={eCurrency} onValueChange={setECurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["EUR", "USD", "GBP", "CHF", "JPY", "CAD", "SEK", "NOK", "DKK"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={saveEdit} disabled={!eSymbol.trim()}>Guardar cambios</Button>
        </DialogContent>
      </Dialog>
      <InvestmentTips />
      <FinanceNews />
    </div>
  )
}
