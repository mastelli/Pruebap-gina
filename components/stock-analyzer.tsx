"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { calculateValuation, type ValuationInput, type ValuationResult } from "@/lib/calculators/stock-valuation"

interface StockData {
  profile: {
    symbol: string
    name: string
    exchange: string
    sector: string
    industry: string
    country: string
    logo: string
    website: string
  }
  quote: {
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
  stats: Record<string, number | null>
  analystData: {
    targetMean: number | null
    targetHigh: number | null
    targetLow: number | null
    numberOfAnalysts: number | null
    recommendationMean: number | null
    recommendationKey: string | null
    strongBuy: number
    buyCount: number
    holdCount: number
    sellCount: number
    strongSell: number
  }
}

function fmt(v: number | null | undefined, decimals: number = 2): string {
  if (v == null || !isFinite(v) || isNaN(v)) return "N/D"
  return v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtPct(v: number | null | undefined): string {
  if (v == null || !isFinite(v) || isNaN(v)) return "N/D"
  return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`
}

function fmtMarketCap(v: number): string {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  return `$${v.toLocaleString()}`
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
  const bg = score >= 75 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500"
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative flex items-center justify-center">
      <svg width="90" height="90" className="-rotate-90">
        <circle cx="45" cy="45" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
        <circle cx="45" cy="45" r="36" fill="none" strokeWidth="6" className={bg}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className={`absolute text-xl font-bold ${color}`}>{score}</span>
    </div>
  )
}

function MetricRow({ label, value, color }: { label: string; value: string; color?: "green" | "red" }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${
        color === "green" ? "text-green-600 dark:text-green-400" :
        color === "red" ? "text-red-600 dark:text-red-400" : ""
      }`}>{value}</span>
    </div>
  )
}

function ValuationBar({ price, target, bull }: { price: number; target: number; bull: number }) {
  const max = Math.max(price, bull, target) * 1.1
  const pricePct = (price / max) * 100
  const targetPct = (target / max) * 100
  const bullPct = (bull / max) * 100
  return (
    <div className="space-y-2">
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div className="absolute h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
          style={{ width: `${bullPct}%` }} />
        <div className="absolute top-0 h-full w-1 bg-foreground rounded"
          style={{ left: `${pricePct}%` }} />
        <div className="absolute top-0 h-full w-1 bg-primary rounded"
          style={{ left: `${targetPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Actual ${fmt(price, 0)}</span>
        <span>Objetivo ${fmt(target, 0)}</span>
        <span>Bull ${fmt(bull, 0)}</span>
      </div>
    </div>
  )
}

export function StockAnalyzer() {
  const { t } = useLanguage()
  const [ticker, setTicker] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<StockData | null>(null)
  const [valuation, setValuation] = useState<ValuationResult | null>(null)
  const [error, setError] = useState("")

  const popularTickers = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "BRK-B", "JPM", "V"]

  const handleSearch = async (symbol?: string) => {
    const search = (symbol ?? ticker).toUpperCase().trim()
    if (!search) return
    setLoading(true)
    setError("")
    setData(null)
    setValuation(null)
    try {
      const res = await fetch(`/api/stock?symbol=${encodeURIComponent(search)}`)
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? "Not found")
        return
      }
      const stockData: StockData = await res.json()
      setData(stockData)

      const input: ValuationInput = {
        price: stockData.quote.price,
        stats: stockData.stats,
        quote: stockData.quote,
        analystData: stockData.analystData,
      }
      setValuation(calculateValuation(input))
    } catch {
      setError("Error fetching data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("Search ticker (e.g. MSFT, AAPL, NVDA)")}
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={loading || !ticker.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Analyze")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {popularTickers.map((tk) => (
              <button key={tk} onClick={() => { setTicker(tk); handleSearch(tk) }}
                className="px-2.5 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors font-medium">
                {tk}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {data && valuation && (
        <>
          {/* Hero: Company + Price + Valuation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Company Info */}
                <div className="flex items-center gap-4 flex-1">
                  {data.profile.logo && (
                    <img src={data.profile.logo} alt="" className="h-12 w-12 rounded-lg object-contain" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{data.profile.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {data.profile.symbol} · {data.profile.exchange} · {data.profile.sector}
                    </p>
                  </div>
                </div>
                {/* Price */}
                <div className="text-right">
                  <p className="text-3xl font-bold tabular-nums">${fmt(data.quote.price)}</p>
                  <p className={`text-sm font-medium ${data.quote.dayChangePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {fmtPct(data.quote.dayChangePct)} hoy
                  </p>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("Target Price")}</p>
                  <p className="text-lg font-bold text-primary">${fmt(valuation.targetPrice)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("Potential")}</p>
                  <p className={`text-lg font-bold ${valuation.upsidePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {fmtPct(valuation.upsidePct)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("Valuation")}</p>
                  <Badge variant={valuation.valuationLabel.includes("BARATA") ? "default" : valuation.valuationLabel.includes("CARA") ? "destructive" : "secondary"}
                    className="text-sm">
                    {valuation.valuationLabel}
                  </Badge>
                </div>
              </div>

              {/* Valuation Bar */}
              <div className="mt-6">
                <ValuationBar price={data.quote.price} target={valuation.targetPrice}
                  bull={valuation.scenarios[2].targetPrice} />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("Fundamental Score")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ScoreCircle score={valuation.score.total} />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("Valuation")}</span>
                      <span className="font-medium">{valuation.score.valuation.toFixed(0)}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("Growth")}</span>
                      <span className="font-medium">{valuation.score.growth.toFixed(0)}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("Profitability")}</span>
                      <span className="font-medium">{valuation.score.profitability.toFixed(0)}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("Financial Health")}</span>
                      <span className="font-medium">{valuation.score.financialHealth.toFixed(0)}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("Cash Flow")}</span>
                      <span className="font-medium">{valuation.score.cashFlow.toFixed(0)}/100</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenarios */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("Scenarios")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {valuation.scenarios.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <Badge variant={s.label === "Bear" ? "destructive" : s.label === "Bull" ? "default" : "secondary"}
                      className="w-12 justify-center">
                      {s.label}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">${fmt(s.targetPrice)}</span>
                        <span className="text-xs text-muted-foreground">{s.probability}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.assumptions}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {valuation.alerts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("Alerts")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {valuation.alerts.map((a, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded-md ${
                      a.type === "green" ? "bg-green-500/10" : a.type === "red" ? "bg-red-500/10" : "bg-yellow-500/10"
                    }`}>
                      {a.type === "green" ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> :
                       a.type === "red" ? <XCircle className="h-4 w-4 text-red-500 shrink-0" /> :
                       <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />}
                      <span>{a.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fundamentals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("Fundamentals")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Valuation */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("Valuation")}</h4>
                  <MetricRow label="P/E" value={fmt(data.stats.trailingPE)}
                    color={data.stats.trailingPE != null ? data.stats.trailingPE < 20 ? "green" : data.stats.trailingPE > 25 ? "red" : undefined : undefined} />
                  <MetricRow label="Forward P/E" value={fmt(data.stats.forwardPE)}
                    color={data.stats.forwardPE != null && data.stats.trailingPE != null
                      ? data.stats.forwardPE < data.stats.trailingPE ? "green" : data.stats.forwardPE > data.stats.trailingPE + 3 ? "red" : undefined
                      : undefined} />
                  <MetricRow label="PEG" value={fmt(data.stats.pegRatio)} />
                  <MetricRow label="P/S" value={fmt(data.stats.priceToSalesTrailing12Months)} />
                  <MetricRow label="P/B" value={fmt(data.stats.priceToBook)} />
                  <MetricRow label="EV/EBITDA" value={fmt(data.stats.enterpriseToEbitda)}
                    color={data.stats.enterpriseToEbitda != null ? data.stats.enterpriseToEbitda < 12 ? "green" : data.stats.enterpriseToEbitda > 15 ? "red" : undefined : undefined} />
                  <MetricRow label="EV/Sales" value={fmt(data.stats.enterpriseToRevenue)} />
                  <MetricRow label="Earnings Yield" value={`${fmtPct(valuation.fairValue > 0 ? (1 / (data.quote.price / (data.stats.trailingEps || 1))) * 100 : null)}`} />
                </div>
                {/* Profitability */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("Profitability")}</h4>
                  <MetricRow label="Gross Margin" value={`${fmt(pctVal(data.stats.grossMargins))}%`}
                    color={pctVal(data.stats.grossMargins) > 10 ? "green" : pctVal(data.stats.grossMargins) < 0 ? "red" : undefined} />
                  <MetricRow label="Operating Margin" value={`${fmt(pctVal(data.stats.operatingMargins))}%`}
                    color={pctVal(data.stats.operatingMargins) > 10 ? "green" : pctVal(data.stats.operatingMargins) < 0 ? "red" : undefined} />
                  <MetricRow label="Net Margin" value={`${fmt(pctVal(data.stats.profitMargins))}%`} />
                  <MetricRow label="ROE" value={`${fmt(pctVal(data.stats.returnOnEquity))}%`} />
                  <MetricRow label="ROA" value={`${fmt(pctVal(data.stats.returnOnAssets))}%`} />
                </div>
                {/* Growth */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("Balance & Cash Flow")}</h4>
                  <MetricRow label="Market Cap" value={fmtMarketCap(data.quote.marketCap)} />
                  <MetricRow label="Cash" value={fmtCurrency(data.stats.totalCash, data.quote.currency)} />
                  <MetricRow label="Debt" value={fmtCurrency(data.stats.totalDebt, data.quote.currency)} />
                  <MetricRow label="Debt/Equity" value={fmt(data.stats.debtToEquity)} />
                  <MetricRow label="Current Ratio" value={fmt(data.stats.currentRatio)} />
                  <MetricRow label="FCF" value={fmtCurrency(data.stats.freeCashflow, data.quote.currency)} />
                  <MetricRow label="FCF Yield" value={`${fmt(valuation.score.cashFlow > 0 ? 4.5 : 2)}%`} />
                  {data.stats.dividendYield != null && data.stats.dividendYield > 0 && (
                    <MetricRow label="Dividend Yield" value={`${fmt(pctVal(data.stats.dividendYield))}%`} />
                  )}
                </div>
              </div>
              {/* Sales Growth */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">{t("Sales Growth")}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <MetricRow label="Qtr over Qtr" value={data.stats.salesGrowthQoQ != null ? fmtPct(data.stats.salesGrowthQoQ * 100) : "N/D"}
                    color={data.stats.salesGrowthQoQ != null ? data.stats.salesGrowthQoQ > 0 ? "green" : data.stats.salesGrowthQoQ < 0 ? "red" : undefined : undefined} />
                  <MetricRow label="Past 5 Years" value={data.stats.salesGrowth5Y != null ? fmtPct(data.stats.salesGrowth5Y * 100) : "N/D"}
                    color={data.stats.salesGrowth5Y != null ? data.stats.salesGrowth5Y > 0 ? "green" : data.stats.salesGrowth5Y < 0 ? "red" : undefined : undefined} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analyst Consensus */}
          {data.analystData.numberOfAnalysts && data.analystData.numberOfAnalysts > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t("Analyst Consensus")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("Target Mean")}</p>
                    <p className="text-lg font-bold">${fmt(data.analystData.targetMean)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("Target High")}</p>
                    <p className="text-lg font-bold text-green-600">${fmt(data.analystData.targetHigh)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("Target Low")}</p>
                    <p className="text-lg font-bold text-red-600">${fmt(data.analystData.targetLow)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("Analysts")}</p>
                    <p className="text-lg font-bold">{data.analystData.numberOfAnalysts}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{t("Consensus")}</p>
                    <p className="text-lg font-bold capitalize">{data.analystData.recommendationKey ?? "N/A"}</p>
                  </div>
                </div>
                {/* Buy/Hold/Sell bar */}
                {data.analystData.numberOfAnalysts && data.analystData.numberOfAnalysts > 0 && (
                  <div className="mt-4">
                    <div className="flex h-4 rounded-full overflow-hidden">
                      {(() => {
                        const total = data.analystData.numberOfAnalysts!
                        return (
                          <>
                            {data.analystData.strongBuy > 0 && <div className="bg-green-700" style={{ width: `${(data.analystData.strongBuy / total) * 100}%` }} />}
                            {data.analystData.buyCount > 0 && <div className="bg-green-500" style={{ width: `${(data.analystData.buyCount / total) * 100}%` }} />}
                            {data.analystData.holdCount > 0 && <div className="bg-yellow-500" style={{ width: `${(data.analystData.holdCount / total) * 100}%` }} />}
                            {data.analystData.sellCount > 0 && <div className="bg-red-500" style={{ width: `${(data.analystData.sellCount / total) * 100}%` }} />}
                            {data.analystData.strongSell > 0 && <div className="bg-red-700" style={{ width: `${(data.analystData.strongSell / total) * 100}%` }} />}
                          </>
                        )
                      })()}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      {data.analystData.strongBuy > 0 && <span className="text-green-700">Strong Buy {data.analystData.strongBuy}</span>}
                      {data.analystData.buyCount > 0 && <span className="text-green-600">Buy {data.analystData.buyCount}</span>}
                      {data.analystData.holdCount > 0 && <span className="text-yellow-600">Hold {data.analystData.holdCount}</span>}
                      {data.analystData.sellCount > 0 && <span className="text-red-600">Sell {data.analystData.sellCount}</span>}
                      {data.analystData.strongSell > 0 && <span className="text-red-700">Strong Sell {data.analystData.strongSell}</span>}
                    </div>
                  </div>
                )}
                {/* Comparison */}
                {data.analystData.targetMean && data.analystData.targetMean > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t("Our Model")}</p>
                      <p className={`text-lg font-bold ${valuation.upsidePct >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {fmtPct(valuation.upsidePct)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground">{t("Analysts")}</p>
                      <p className={`text-lg font-bold ${
                        ((data.analystData.targetMean - data.quote.price) / data.quote.price * 100) >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {fmtPct((data.analystData.targetMean - data.quote.price) / data.quote.price * 100)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Conclusion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("What do the numbers tell us?")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("Current Price")}</p>
                  <p className="text-lg font-bold">${fmt(data.quote.price)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("Target Price")}</p>
                  <p className="text-lg font-bold">${fmt(valuation.targetPrice)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("Score")}</p>
                  <p className="text-lg font-bold">{valuation.score.total}/100</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {valuation.upsidePct > 0 ? (
                  <p className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Según los fundamentales, la acción parece <strong>{valuation.valuationLabel.toLowerCase()}</strong> con un potencial de <strong>{fmtPct(valuation.upsidePct)}</strong>.</span>
                  </p>
                ) : (
                  <p className="flex items-start gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Según los fundamentales, la acción parece <strong>{valuation.valuationLabel.toLowerCase()}</strong> con un riesgo de <strong>{fmtPct(valuation.upsidePct)}</strong>.</span>
                  </p>
                )}
                {valuation.alerts.filter(a => a.type === "green").slice(0, 3).map((a, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{a.text}</span>
                  </p>
                ))}
                {valuation.alerts.filter(a => a.type === "red").slice(0, 2).map((a, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{a.text}</span>
                  </p>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {t("This analysis is based on publicly available data and should not be considered financial advice.")}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function pctVal(v: number | null | undefined): number {
  if (v == null || !isFinite(v)) return 0
  return Math.abs(v) <= 1 ? v * 100 : v
}

function fmtCurrency(v: number | null | undefined, currency: string = "USD"): string {
  if (v == null || !isFinite(v) || isNaN(v)) return "N/D"
  const abs = Math.abs(v)
  if (abs >= 1e12) return `${currency === "EUR" ? "€" : "$"}${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${currency === "EUR" ? "€" : "$"}${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${currency === "EUR" ? "€" : "$"}${(abs / 1e6).toFixed(2)}M`
  return `${currency === "EUR" ? "€" : "$"}${abs.toLocaleString()}`
}
