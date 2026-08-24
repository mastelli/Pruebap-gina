"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

const PORTFOLIO_STORAGE_KEY = "appPortfolio"
const PRICES_STORAGE_KEY = "appPortfolioPrices"
const PRICE_TTL = 5 * 1000
const REFRESH_MS = 6 * 1000

interface Asset {
  id: string
  product: string
  isin: string
  quantity: number
  currency?: string
  csvPrice?: number
  eurValue?: number
}

interface PriceInfo {
  symbol?: string
  price?: number
  previousClose?: number | null
  currency?: string
  fetchedAt?: number
}

type PriceMap = Record<string, PriceInfo>

// Formato del csv del broker (por posicion):
// Producto, ISIN, Cantidad, Precio actual, Moneda, Valor local total, Valor EUR total

function parseNumber(raw: string): number {
  let value = (raw ?? "").trim().replace(/[€$%\s]/g, "")
  if (/,\d{1,4}$/.test(value)) {
    value = value.replace(/\./g, "").replace(",", ".")
  } else {
    value = value.replace(/,/g, "")
  }
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

// Divide una linea respetando campos entre comillas (nombres con comas)
function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current)
      current = ""
    } else {
      current += char
    }
  }
  cells.push(current)
  return cells.map((cell) => cell.trim().replace(/^"|"$/g, ""))
}

export function parsePortfolioCsv(text: string): Asset[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []

  const firstLine = lines[0]
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ","

  const assets: Asset[] = []

  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line, delimiter)
    const isin = (cells[1] ?? "").trim().toUpperCase()

    // Lineas sin ISIN valido (cabecera repetida, efectivo, etc.) se ignoran
    if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) continue

    const quantity = parseNumber(cells[2] ?? "")
    const csvPrice = parseNumber(cells[3] ?? "")
    const eurValue = parseNumber(cells[6] ?? cells[5] ?? "")
    if (!Number.isFinite(quantity) || (!Number.isFinite(csvPrice) && !Number.isFinite(eurValue))) continue

    assets.push({
      id: `${isin}-${Date.now()}-${assets.length}`,
      product: (cells[0] ?? "").trim() || isin,
      isin,
      quantity,
      currency: (cells[4] ?? "").trim().toUpperCase() || undefined,
      csvPrice: Number.isFinite(csvPrice) ? csvPrice : undefined,
      eurValue: Number.isFinite(eurValue) ? eurValue : undefined,
    })
  }

  return assets
}

function formatMoney(value: number, currency?: string): string {
  const formatted = value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return currency && currency !== "EUR" ? `${formatted} ${currency}` : `${formatted} €`
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function PortfolioPanel() {
  const { t } = useLanguage()
  const [assets, setAssets] = useState<Asset[]>([])
  const [prices, setPrices] = useState<PriceMap>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Asset[] | { assets?: Asset[] }
        setAssets(Array.isArray(parsed) ? parsed : parsed.assets ?? [])
      }
      const rawPrices = window.localStorage.getItem(PRICES_STORAGE_KEY)
      if (rawPrices) setPrices(JSON.parse(rawPrices) as PriceMap)
    } catch {
      // almacenamiento no disponible
    }
  }, [])

  const persistAssets = (next: Asset[]) => {
    setAssets(next)
    try {
      window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // almacenamiento no disponible
    }
  }

  const refreshPrices = useCallback(async (list: Asset[], force = false) => {
    if (list.length === 0) return
    setLoading(true)
    try {
      let cached: PriceMap = {}
      try {
        const raw = window.localStorage.getItem(PRICES_STORAGE_KEY)
        if (raw) cached = JSON.parse(raw) as PriceMap
      } catch {
        cached = {}
      }

      const pending = force
        ? list
        : list.filter((asset) => {
            const entry = cached[asset.isin]
            return !entry?.price || Date.now() - Number(entry.fetchedAt ?? 0) > PRICE_TTL
          })

      const merged = { ...cached }
      let fetched = false
      if (pending.length > 0) {
        fetched = true
        const res = await fetch("/api/portfolio-prices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assets: pending.map((asset) => ({ isin: asset.isin, name: asset.product })),
          }),
        })
        const json = await res.json()
        const results = (json?.results ?? {}) as Record<string, PriceInfo | null>
        for (const [isin, info] of Object.entries(results)) {
          merged[isin] = info ? { ...info, fetchedAt: Date.now() } : merged[isin]
        }
      }

      setPrices(merged)
      if (fetched) setLastUpdated(Date.now())
      try {
        window.localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(merged))
      } catch {
        // almacenamiento no disponible
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (assets.length > 0) void refreshPrices(assets)
    // solo al montar o al cambiar el numero de activos
  }, [assets.length, refreshPrices]) // eslint-disable-line react-hooks/exhaustive-deps

  // Actualizacion automatica periodica mientras la pestana este visible
  useEffect(() => {
    if (assets.length === 0) return
    const id = setInterval(() => {
      if (!document.hidden) void refreshPrices(assets, true)
    }, REFRESH_MS)
    return () => clearInterval(id)
  }, [assets, refreshPrices])

  const handleFile = async (file: File) => {
    const text = await file.text()
    const parsed = parsePortfolioCsv(text)
    if (parsed.length === 0) return

    // anade los nuevos sustituyendo los que repiten ISIN
    const byIsin = new Map<string, Asset>()
    for (const asset of [...assets, ...parsed]) byIsin.set(asset.isin, asset)
    const next = Array.from(byIsin.values())
    persistAssets(next)
    void refreshPrices(next, true)
  }

  const removeAsset = (id: string) => persistAssets(assets.filter((asset) => asset.id !== id))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-semibold">{t("Investment Portfolio")}</CardTitle>
        <div className="flex items-center gap-2">
          {assets.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => void refreshPrices(assets, true)} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {t("Refresh")}
            </Button>
          )}
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            {t("Import Portfolio")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleFile(file)
              event.target.value = ""
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("No assets imported yet")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-4 font-medium">{t("Product")}</th>
                  <th className="py-2 pr-4 font-medium">ISIN</th>
                  <th className="py-2 pr-4 text-right font-medium">{t("Quantity")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{t("Price")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{t("Day +/-")}</th>
                  <th className="py-2" aria-label={t("Delete")} />
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const info = prices[asset.isin]
                  // Si el ISIN no resuelve en Yahoo usamos el precio del propio csv
                  const fallback =
                    asset.csvPrice !== undefined
                      ? { price: asset.csvPrice, currency: asset.currency }
                      : asset.eurValue !== undefined && asset.quantity !== 0
                        ? { price: asset.eurValue / asset.quantity, currency: "EUR" }
                        : undefined
                  const price = info?.price ?? fallback?.price
                  const displayCurrency = info?.currency ?? fallback?.currency
                  // Variacion diaria: precio actual frente al cierre de ayer
                  const prevClose = info?.previousClose ?? null
                  const dayChange =
                    price !== undefined && prevClose !== null ? price - prevClose : null
                  const dayPct =
                    dayChange !== null && prevClose !== null && prevClose !== 0
                      ? (dayChange / prevClose) * 100
                      : null
                  return (
                    <tr key={asset.id} className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">{t(asset.product)}</td>
                      <td className="py-3 pr-4 tabular-nums text-muted-foreground">{asset.isin}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {asset.quantity.toLocaleString("es-ES")}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {price !== undefined ? formatMoney(price, displayCurrency) : "—"}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right tabular-nums ${
                          dayPct === null ? "" : dayPct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {dayChange === null || dayPct === null
                          ? "—"
                          : `${formatSigned(dayChange)} (${formatSigned(dayPct)}%)`}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeAsset(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("Delete")}</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("Quotes may be delayed up to 15 minutes")}
              {lastUpdated
                ? ` · ${t("Last updated")} ${new Date(lastUpdated).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
