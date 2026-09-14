"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLanguage } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Search, TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Building2, Users, Target, AlertTriangle, Globe, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

interface StockProfile {
  symbol: string
  name: string
  exchange: string
  sector: string
  industry: string
  country: string
  logo: string
  website: string
  description: string
  employees: number | null
}

interface StockQuote {
  price: number
  previousClose: number
  dayChange: number
  dayChangePct: number
  week52High: number
  week52Low: number
  marketCap: number
  volume: number
  currency: string
}

interface StockStats {
  [key: string]: number | null
}

interface AnalystData {
  targetMean: number | null
  targetHigh: number | null
  targetLow: number | null
  numberOfAnalysts: number | null
  recommendationMean: number | null
  recommendationKey: string | null
  strongBuy: number | null
  buyCount: number | null
  holdCount: number | null
  sellCount: number | null
  strongSell: number | null
}

interface CandleData {
  date: string
  price: number
  open: number
  high: number
  low: number
}

interface StockData {
  profile: StockProfile
  quote: StockQuote
  stats: StockStats
  analystData: AnalystData
  history: CandleData[]
}

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  marketCap: number | null
}

function formatLargeNumber(n: number | null | undefined): string {
  if (n == null) return "—"
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(2)
}

function formatPercent(n: number | null | undefined): string {
  if (n == null) return "—"
  return `${(n * 100).toFixed(1)}%`
}

function valuationColor(key: string, value: number): string {
  if (value === 0) return ""
  switch (key) {
    case "trailingPE":
    case "forwardPE":
      if (value < 15) return "text-green-600 dark:text-green-400"
      if (value > 30) return "text-red-600 dark:text-red-400"
      return ""
    case "priceToBook":
      if (value < 1) return "text-green-600 dark:text-green-400"
      if (value > 5) return "text-red-600 dark:text-red-400"
      return ""
    case "returnOnEquity":
      if (value > 0.2) return "text-green-600 dark:text-green-400"
      if (value < 0.05) return "text-red-600 dark:text-red-400"
      return ""
    case "debtToEquity":
      if (value < 50) return "text-green-600 dark:text-green-400"
      if (value > 150) return "text-red-600 dark:text-red-400"
      return ""
    default:
      return ""
  }
}

function MetricRow({ label, value, format, colorClass }: { label: string; value: number | null | undefined; format?: string; colorClass?: string }) {
  const display = value == null ? "—" :
    format === "percent" ? formatPercent(value) :
    format === "large" ? formatLargeNumber(value) :
    format === "currency" ? value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
    value.toFixed(2)
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${colorClass ?? ""}`}>{display}</span>
    </div>
  )
}

function RecommendationBar({ data }: { data: AnalystData }) {
  const total = (data.strongBuy ?? 0) + (data.buyCount ?? 0) + (data.holdCount ?? 0) + (data.sellCount ?? 0) + (data.strongSell ?? 0)
  if (total === 0) return null
  const pct = (n: number) => (n / total) * 100
  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
        {data.strongBuy ? <div className="bg-green-700" style={{ width: `${pct(data.strongBuy)}%` }} /> : null}
        {data.buyCount ? <div className="bg-green-500" style={{ width: `${pct(data.buyCount)}%` }} /> : null}
        {data.holdCount ? <div className="bg-yellow-500" style={{ width: `${pct(data.holdCount)}%` }} /> : null}
        {data.sellCount ? <div className="bg-red-400" style={{ width: `${pct(data.sellCount)}%` }} /> : null}
        {data.strongSell ? <div className="bg-red-700" style={{ width: `${pct(data.strongSell)}%` }} /> : null}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="text-green-600">Strong Buy {data.strongBuy ?? 0}</span>
        <span className="text-green-500">Buy {data.buyCount ?? 0}</span>
        <span className="text-yellow-500">Hold {data.holdCount ?? 0}</span>
        <span className="text-red-400">Sell {data.sellCount ?? 0}</span>
        <span className="text-red-600">Strong Sell {data.strongSell ?? 0}</span>
      </div>
    </div>
  )
}

function PriceRangeBar({ current, low, high }: { current: number; low: number; high: number }) {
  const range = high - low
  if (range <= 0) return null
  const pct = ((current - low) / range) * 100
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{low.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span>{high.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="relative h-2 bg-secondary rounded-full">
        <div className="absolute h-2 bg-primary rounded-full" style={{ width: `${pct}%` }} />
        <div className="absolute h-3 w-0.5 bg-foreground -top-0.5" style={{ left: `${pct}%` }} />
      </div>
    </div>
  )
}

export function InvestmentTestDashboard() {
  const { t } = useLanguage()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<StockData | null>(null)
  const [searching, setSearching] = useState(false)
  const [range, setRange] = useState("6mo")
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<import("lightweight-charts").IChartApi | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    valuation: true,
    financials: true,
    growth: true,
    profitability: true,
    balance: true,
    analysts: true,
    risk: true,
  })

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const searchStock = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 1) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/stock?query=${encodeURIComponent(q.trim())}`)
      if (!res.ok) return
      const json = await res.json()
      setResults(Array.isArray(json) ? json : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (query === selectedSymbol) return
    const timer = setTimeout(() => searchStock(query), 300)
    return () => clearTimeout(timer)
  }, [query, searchStock, selectedSymbol])

  const loadStock = useCallback(async (symbol: string, r?: string) => {
    setLoading(true)
    setResults([])
    setSelectedSymbol(symbol)
    setQuery(symbol)
    try {
      const res = await fetch(`/api/stock?symbol=${encodeURIComponent(symbol)}&range=${r ?? range}`)
      if (!res.ok) return
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    if (!data || !chartContainerRef.current) return
    const container = chartContainerRef.current

    import("lightweight-charts").then(({ createChart, CandlestickSeries, VolumeSeries }) => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }

      const chart = createChart(container, {
        width: container.clientWidth,
        height: 450,
        layout: {
          background: { color: "transparent" },
          textColor: "hsl(240 3.8% 46.1%)",
        },
        grid: {
          vertLines: { color: "hsl(240 5% 85% / 0.3)" },
          horzLines: { color: "hsl(240 5% 85% / 0.3)" },
        },
        crosshair: {
          mode: 0,
        },
        rightPriceScale: {
          borderColor: "hsl(240 5% 85%)",
        },
        timeScale: {
          borderColor: "hsl(240 5% 85%)",
          timeVisible: false,
        },
      })

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        wickUpColor: "#22c55e",
      })

      const candleData = data.history.map((c) => ({
        time: c.date as string,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.price,
      })).sort((a, b) => a.time.localeCompare(b.time))

      candleSeries.setData(candleData as any)

      const volumeSeries = chart.addSeries(VolumeSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
      })

      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      })

      const volData = data.history.map((c) => ({
        time: c.date as string,
        value: c.volume ?? 0,
        color: c.price >= c.open ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
      })).sort((a, b) => a.time.localeCompare(b.time))

      volumeSeries.setData(volData as any)

      chart.timeScale().fitContent()
      chartRef.current = chart

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth })
        }
      }
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    })
  }, [data])

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [])

  const stats = data?.stats ?? {}
  const q = data?.quote
  const a = data?.analystData
  const p = data?.profile

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("Search by symbol or company name...")}
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results.length > 0) loadStock(results[0].symbol)
              }}
            />
            {results.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
                {results.map((r) => (
                  <button
                    key={r.symbol}
                    className="w-full px-4 py-2.5 text-left hover:bg-accent flex items-center justify-between"
                    onClick={() => loadStock(r.symbol)}
                  >
                    <div>
                      <span className="font-medium">{r.symbol}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{r.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.exchange}
                      {r.marketCap ? <span className="ml-2">{formatLargeNumber(r.marketCap)}</span> : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Activity className="h-6 w-6 animate-spin mx-auto mb-2" />
            {t("Loading stock data...")}
          </CardContent>
        </Card>
      )}

      {data && !loading && (
        <>
          {/* Header: Price + Company Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {p?.logo ? <img src={p.logo} alt={p.name} className="h-12 w-12 rounded-lg" /> : null}
                  <div>
                    <h3 className="text-2xl font-bold">{p?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{p?.symbol}</Badge>
                      <Badge variant="outline">{p?.exchange}</Badge>
                      {p?.sector ? <Badge variant="outline">{p.sector}</Badge> : null}
                    </div>
                    {p?.website ? (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1 mt-1">
                        {p.website} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                    {p?.description ? (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                        {p.description}
                      </p>
                    ) : null}
                    {p?.employees ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.employees.toLocaleString("es-ES")} {t("employees")}
                      </p>
                    ) : null}
                  </div>
                </div>
                {q && (
                  <div className="text-right">
                    <div className="text-3xl font-bold tabular-nums">
                      {q.price.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {q.currency}
                    </div>
                    <div className={`flex items-center justify-end gap-2 text-lg font-medium ${q.dayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {q.dayChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      <span>{q.dayChange >= 0 ? "+" : ""}{q.dayChange.toFixed(2)} ({q.dayChangePct >= 0 ? "+" : ""}{q.dayChangePct.toFixed(2)}%)</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Vol: {formatLargeNumber(q.volume)} · MCap: {formatLargeNumber(q.marketCap)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Investment Thesis + Expected Value */}
          {q && a && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Expected Value Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t("Expected Value")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {a.targetMean ? (
                    <>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">{t("Target Price")}</div>
                        <div className="text-3xl font-bold tabular-nums mt-1">
                          {a.targetMean.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {q.currency}
                        </div>
                        <div className={`text-lg font-semibold mt-1 ${a.targetMean >= q.price ? "text-green-600" : "text-red-600"}`}>
                          {a.targetMean >= q.price ? "+" : ""}{((a.targetMean - q.price) / q.price * 100).toFixed(1)}% {t("upside")}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 rounded-lg bg-green-500/10">
                          <div className="text-muted-foreground">{t("Bull Case")}</div>
                          <div className="font-bold text-green-600">{a.targetHigh?.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</div>
                          <div className="text-xs text-green-600">+{a.targetHigh ? ((a.targetHigh - q.price) / q.price * 100).toFixed(1) : 0}%</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-red-500/10">
                          <div className="text-muted-foreground">{t("Bear Case")}</div>
                          <div className="font-bold text-red-600">{a.targetLow?.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</div>
                          <div className="text-xs text-red-600">{a.targetLow ? ((a.targetLow - q.price) / q.price * 100).toFixed(1) : 0}%</div>
                        </div>
                      </div>
                      <PriceRangeBar current={q.price} low={a.targetLow ?? 0} high={a.targetHigh ?? 0} />
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      {t("No analyst targets available")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Investment Thesis */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t("Investment Thesis")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const positives: string[] = []
                    const negatives: string[] = []
                    const neutral: string[] = []

                    // Valuation
                    if (stats.trailingPE) {
                      if (stats.trailingPE < 15) positives.push(t("Low P/E indicates undervaluation"))
                      else if (stats.trailingPE > 30) negatives.push(t("High P/E suggests overvaluation"))
                      else neutral.push(t("P/E is within normal range"))
                    }
                    if (stats.pegRatio) {
                      if (stats.pegRatio < 1) positives.push(t("PEG < 1: growth is cheap relative to earnings"))
                      else if (stats.pegRatio > 2) negatives.push(t("PEG > 2: paying premium for growth"))
                    }
                    if (stats.priceToBook && stats.priceToBook < 1) positives.push(t("Trading below book value — rare opportunity"))

                    // Profitability
                    if (stats.returnOnEquity) {
                      if (stats.returnOnEquity > 0.2) positives.push(t("ROE > 20% — excellent capital efficiency"))
                      else if (stats.returnOnEquity < 0.05) negatives.push(t("ROE < 5% — poor capital allocation"))
                    }
                    if (stats.profitMargins && stats.profitMargins > 0.2) positives.push(t("Strong profit margins above 20%"))
                    if (stats.grossMargins && stats.grossMargins > 0.5) positives.push(t("High gross margins — strong pricing power"))

                    // Growth
                    if (stats.revenueGrowth) {
                      if (stats.revenueGrowth > 0.15) positives.push(t("Revenue growth > 15% — strong momentum"))
                      else if (stats.revenueGrowth < 0) negatives.push(t("Declining revenue — growth concerns"))
                    }
                    if (stats.earningsGrowth && stats.earningsGrowth > 0.2) positives.push(t("Earnings growing faster than revenue — improving efficiency"))

                    // Financial health
                    if (stats.debtToEquity) {
                      if (stats.debtToEquity < 50) positives.push(t("Low debt — conservative balance sheet"))
                      else if (stats.debtToEquity > 150) negatives.push(t("High debt levels — financial risk"))
                    }
                    if (stats.currentRatio && stats.currentRatio > 1.5) positives.push(t("Strong liquidity position"))
                    if (stats.freeCashflow && stats.freeCashflow > 0) positives.push(t("Positive free cash flow — self-funding growth"))

                    // Analyst sentiment
                    if (a.recommendationKey === "buy" || a.recommendationKey === "strongBuy") {
                      positives.push(t("Analyst consensus is bullish"))
                    } else if (a.recommendationKey === "sell" || a.recommendationKey === "strongSell") {
                      negatives.push(t("Analyst consensus is bearish"))
                    }
                    if (a.targetMean && q.price && a.targetMean > q.price * 1.1) {
                      positives.push(t("Significant upside to analyst target price"))
                    }

                    // Risk
                    if (stats.beta) {
                      if (stats.beta > 1.5) neutral.push(t("High beta — more volatile than market"))
                      else if (stats.beta < 0.8) positives.push(t("Low beta — defensive stock"))
                    }

                    // Insider ownership
                    if (stats.heldPercentInsiders && stats.heldPercentInsiders > 0.1) {
                      positives.push(t("Significant insider ownership — aligned interests"))
                    }

                    const score = positives.length - negatives.length
                    const rating = score >= 4 ? t("Strong Buy") : score >= 2 ? t("Buy") : score >= 0 ? t("Hold") : score >= -2 ? t("Sell") : t("Strong Sell")
                    const ratingColor = score >= 4 ? "text-green-600 bg-green-500/10" : score >= 2 ? "text-green-500 bg-green-500/10" : score >= 0 ? "text-yellow-600 bg-yellow-500/10" : score >= -2 ? "text-red-500 bg-red-500/10" : "text-red-600 bg-red-500/10"

                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge variant="outline" className={`text-base px-4 py-1 ${ratingColor}`}>{rating}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {positives.length} {t("positives")} · {negatives.length} {t("negatives")} · {neutral.length} {t("neutral")}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {positives.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-green-600 mb-2">{t("Strengths")}</h4>
                              <ul className="space-y-1">
                                {positives.map((p, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-green-500 mt-0.5">+</span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {negatives.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-red-600 mb-2">{t("Risks")}</h4>
                              <ul className="space-y-1">
                                {negatives.map((n, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">-</span>
                                    <span>{n}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {neutral.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">{t("Key Observations")}</h4>
                            <ul className="space-y-1">
                              {neutral.map((n, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="mt-0.5">·</span>
                                  <span>{n}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Range selector */}
          <div className="flex gap-2">
            {["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y"].map((r) => (
              <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => { setRange(r); if (selectedSymbol) loadStock(selectedSymbol, r) }}>
                {r.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("Technical Chart")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chartContainerRef} className="w-full" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Valuation Metrics */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection("valuation")}>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><DollarSign className="h-5 w-5" />{t("Valuation")}</span>
                  {expandedSections.valuation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.valuation && (
                <CardContent className="pt-0">
                  <MetricRow label="P/E (TTM)" value={stats.trailingPE} colorClass={valuationColor("trailingPE", stats.trailingPE ?? 0)} />
                  <MetricRow label="P/E Forward" value={stats.forwardPE} colorClass={valuationColor("forwardPE", stats.forwardPE ?? 0)} />
                  <MetricRow label="PEG Ratio" value={stats.pegRatio} />
                  <MetricRow label="P/B" value={stats.priceToBook} colorClass={valuationColor("priceToBook", stats.priceToBook ?? 0)} />
                  <MetricRow label="P/S (TTM)" value={stats.priceToSalesTrailing12Months} />
                  <MetricRow label="EV/Revenue" value={stats.enterpriseToRevenue} />
                  <MetricRow label="EV/EBITDA" value={stats.enterpriseToEbitda} />
                  <MetricRow label="Enterprise Value" value={stats.enterpriseValue} format="large" />
                  <Separator className="my-2" />
                  <MetricRow label="Trailing EPS" value={stats.trailingEps} format="currency" />
                  <MetricRow label="Forward EPS" value={stats.forwardEps} format="currency" />
                  <MetricRow label="Book Value" value={stats.bookValue} format="currency" />
                </CardContent>
              )}
            </Card>

            {/* Analyst Recommendations */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection("analysts")}>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Target className="h-5 w-5" />{t("Analyst Recommendations")}</span>
                  {expandedSections.analysts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.analysts && a && (
                <CardContent className="pt-0 space-y-4">
                  {a.recommendationKey && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t("Consensus")}:</span>
                      <Badge variant={a.recommendationKey === "buy" || a.recommendationKey === "strongBuy" ? "default" : a.recommendationKey === "sell" ? "destructive" : "secondary"}>
                        {a.recommendationKey}
                      </Badge>
                      {a.recommendationMean ? <span className="text-sm">({a.recommendationMean.toFixed(1)}/5)</span> : null}
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t("Price Target")}</div>
                    {a.targetMean && q ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t("Low")}: {a.targetLow?.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                          <span className="font-medium">{t("Mean")}: {a.targetMean.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                          <span>{t("High")}: {a.targetHigh?.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <PriceRangeBar current={q.price} low={a.targetLow ?? 0} high={a.targetHigh ?? 0} />
                        <div className="text-xs text-muted-foreground text-center">
                          {t("Upside")}: {a.targetMean > q.price ? "+" : ""}{((a.targetMean - q.price) / q.price * 100).toFixed(1)}%
                        </div>
                      </div>
                    ) : <span className="text-sm text-muted-foreground">—</span>}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t("Rating Distribution")} ({a.numberOfAnalysts ?? 0} {t("analysts")})</div>
                    <RecommendationBar data={a} />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Growth */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection("growth")}>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />{t("Growth")}</span>
                  {expandedSections.growth ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.growth && (
                <CardContent className="pt-0">
                  <MetricRow label="Revenue Growth" value={stats.revenueGrowth} format="percent" />
                  <MetricRow label="Earnings Growth" value={stats.earningsGrowth} format="percent" />
                  <MetricRow label="Sales Growth QoQ" value={stats.salesGrowthQoQ} format="percent" />
                  <MetricRow label="5Y Revenue Growth" value={stats.salesGrowth5Y} format="percent" />
                  <MetricRow label="Est. Revenue Growth" value={stats.estimatedRevenueGrowth} format="percent" />
                  <MetricRow label="FCF Growth" value={stats.fcfGrowth} format="percent" />
                  <MetricRow label="Est. EPS Current Year" value={stats.estimatedEpsCurrentYear} format="currency" />
                  <MetricRow label="Est. EPS Next Year" value={stats.estimatedEpsNextYear} format="currency" />
                </CardContent>
              )}
            </Card>

            {/* Profitability */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection("profitability")}>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Activity className="h-5 w-5" />{t("Profitability")}</span>
                  {expandedSections.profitability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.profitability && (
                <CardContent className="pt-0">
                  <MetricRow label="Return on Equity" value={stats.returnOnEquity} format="percent" colorClass={valuationColor("returnOnEquity", stats.returnOnEquity ?? 0)} />
                  <MetricRow label="Return on Assets" value={stats.returnOnAssets} format="percent" />
                  <MetricRow label="Return on Capital" value={stats.returnOnCapitalEmployed} format="percent" />
                  <MetricRow label="Gross Margin" value={stats.grossMargins} format="percent" />
                  <MetricRow label="Operating Margin" value={stats.operatingMargins} format="percent" />
                  <MetricRow label="Profit Margin" value={stats.profitMargins} format="percent" />
                </CardContent>
              )}
            </Card>

            {/* Balance Sheet */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection("balance")}>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Building2 className="h-5 w-5" />{t("Balance Sheet & Cash Flow")}</span>
                  {expandedSections.balance ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.balance && (
                <CardContent className="pt-0">
                  <MetricRow label="Revenue" value={stats.revenue} format="large" />
                  <MetricRow label="EBITDA" value={stats.ebitda} format="large" />
                  <MetricRow label="Free Cash Flow" value={stats.freeCashflow} format="large" />
                  <MetricRow label="Operating Cash Flow" value={stats.operatingCashflow} format="large" />
                  <Separator className="my-2" />
                  <MetricRow label="Total Cash" value={stats.totalCash} format="large" />
                  <MetricRow label="Total Debt" value={stats.totalDebt} format="large" />
                  <MetricRow label="Debt/Equity" value={stats.debtToEquity} colorClass={valuationColor("debtToEquity", stats.debtToEquity ?? 0)} />
                  <MetricRow label="Current Ratio" value={stats.currentRatio} />
                  <Separator className="my-2" />
                  <MetricRow label="Dividend Yield" value={stats.dividendYield} format="percent" />
                  <MetricRow label="Payout Ratio" value={stats.payoutRatio} format="percent" />
                  <MetricRow label="Beta" value={stats.beta} />
                </CardContent>
              )}
            </Card>

            {/* Risk */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => toggleSection("risk")}>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />{t("Risk & Ownership")}</span>
                  {expandedSections.risk ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections.risk && (
                <CardContent className="pt-0">
                  {q && (
                    <>
                      <div className="text-sm text-muted-foreground mb-1">{t("52 Week Range")}</div>
                      <PriceRangeBar current={q.price} low={q.week52Low} high={q.week52High} />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1 mb-3">
                        <span>Low: {q.week52Low.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                        <span>High: {q.week52High.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}
                  <MetricRow label="Beta" value={stats.beta} />
                  <MetricRow label="Shares Outstanding" value={stats.sharesOutstanding} format="large" />
                  <MetricRow label="% Held by Insiders" value={stats.heldPercentInsiders} format="percent" />
                  <MetricRow label="% Held by Institutions" value={stats.heldPercentInstitutions} format="percent" />
                  <Separator className="my-2" />
                  {data.history.length > 1 && (() => {
                    const prices = data.history.map((c) => c.price)
                    const returns: number[] = []
                    for (let i = 1; i < prices.length; i++) {
                      if (prices[i - 1] !== 0) returns.push((prices[i] - prices[i - 1]) / prices[i - 1])
                    }
                    if (returns.length === 0) return null
                    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
                    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length
                    const dailyVol = Math.sqrt(variance)
                    const annualVol = dailyVol * Math.sqrt(252)
                    const maxDrawdown = (() => {
                      let peak = prices[0]
                      let maxDd = 0
                      for (const p of prices) {
                        if (p > peak) peak = p
                        const dd = (peak - p) / peak
                        if (dd > maxDd) maxDd = dd
                      }
                      return maxDd
                    })()
                    return (
                      <>
                        <MetricRow label="Annualized Volatility" value={annualVol} format="percent" />
                        <MetricRow label="Max Drawdown" value={maxDrawdown} format="percent" />
                        <MetricRow label="Daily Volatility" value={dailyVol} format="percent" />
                      </>
                    )
                  })()}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Company Description */}
          {p?.industry && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("Company Info")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">{t("Sector")}:</span> <span className="font-medium">{p.sector}</span></div>
                  <div><span className="text-muted-foreground">{t("Industry")}:</span> <span className="font-medium">{p.industry}</span></div>
                  <div><span className="text-muted-foreground">{t("Country")}:</span> <span className="font-medium">{p.country}</span></div>
                  <div><span className="text-muted-foreground">{t("Exchange")}:</span> <span className="font-medium">{p.exchange}</span></div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!data && !loading && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">{t("Search for a stock to begin analysis")}</p>
            <p className="text-sm mt-1">{t("Type a symbol like AAPL, TSLA, Iberdrola...")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
