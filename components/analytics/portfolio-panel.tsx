"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

const PORTFOLIO_STORAGE_KEY = "appPortfolio"
const PRICES_STORAGE_KEY = "appPortfolioPrices"
const PRICE_TTL = 10 * 60 * 1000

interface Asset {
  id: string
  product: string
  isin: string
  quantity: number
  purchasePrice: number
}

interface PriceInfo {
  symbol?: string
  price?: number
  previousClose?: number | null
  currency?: string
  fetchedAt?: number
}

type PriceMap = Record<string, PriceInfo>

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "")
}

function parseNumber(raw: string): number {
  let value = raw.trim().replace(/[€$%\s]/g, "")
  if (/,\d{1,4}$/.test(value)) {
    value = value.replace(/\./g, "").replace(",", ".")
  } else {
    value = value.replace(/,/g, "")
  }
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

// Acepta ; o , como separador y cabeceras flexibles en espanol o ingles
function parsePortfolioCsv(text: string): Asset[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  if (lines.length < 2) return []

  const delimiter = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ";" : ","
  const headers = lines[0].split(delimiter).map(normalizeHeader)

  const findIndex = (candidates: string[]) =>
    headers.findIndex((header) => candidates.some((candidate) => header.includes(candidate)))

  const productIdx = findIndex(["producto", "product", "nombre", "name", "descripcion"])
  const isinIdx = headers.findIndex((header) => header === "isin")
  const quantityIdx = findIndex(["cantidad", "participaciones", "acciones", "quantity", "shares"])
  const priceIdx = findIndex(["preciocompra", "purchaseprice", "precio"])

  if (isinIdx === -1 || quantityIdx === -1 || priceIdx === -1) return []

  return lines
    .slice(1)
    .map((line, index) => {
      const cells = line.split(delimiter)
      const isin = (cells[isinIdx] ?? "").trim().toUpperCase()
      if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin)) return null
      const quantity = parseNumber(cells[quantityIdx] ?? "")
      const purchasePrice = parseNumber(cells[priceIdx] ?? "")
      if (!Number.isFinite(quantity) || !Number.isFinite(purchasePrice)) return null
      return {
        id: `${isin}-${Date.now()}-${index}`,
        product: (cells[productIdx] ?? "").trim() || isin,
        isin,
        quantity,
        purchasePrice,
      } satisfies Asset
    })
    .filter((asset): asset is Asset => asset !== null)
}

function formatMoney(value: number, currency?: string): string {
  const formatted = value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return currency && currency !== "EUR" ? `${formatted} ${currency}` : `${formatted} €`
}

export function PortfolioPanel() {
  const { t } = useLanguage()
  const [assets, setAssets] = useState<Asset[]>([])
  const [prices, setPrices] = useState<PriceMap>({})
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      if (raw) setAssets(JSON.parse(raw) as Asset[])
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

  const refreshPrices = useCallback(async (list: Asset[]) => {
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

      const pending = list.filter((asset) => {
        const entry = cached[asset.isin]
        return !entry?.price || Date.now() - Number(entry.fetchedAt ?? 0) > PRICE_TTL
      })

      let merged = { ...cached }
      if (pending.length > 0) {
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

  const handleFile = async (file: File) => {
    const text = await file.text()
    const parsed = parsePortfolioCsv(text)
    if (parsed.length === 0) return

    // anade los nuevos sustituyendo los que repiten ISIN
    const byIsin = new Map<string, Asset>()
    for (const asset of [...assets, ...parsed]) byIsin.set(asset.isin, asset)
    const next = Array.from(byIsin.values())
    persistAssets(next)
    void refreshPrices(next)
  }

  const removeAsset = (id: string) => persistAssets(assets.filter((asset) => asset.id !== id))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-semibold">{t("Investment Portfolio")}</CardTitle>
        <div className="flex items-center gap-2">
          {assets.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => void refreshPrices(assets)} disabled={loading}>
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
                  <th className="py-2 pr-4 text-right font-medium">{t("Purchase Price")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{t("Price Today")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{t("Day +/-")}</th>
                  <th className="py-2 pr-4 text-right font-medium">{t("Potential G/P")}</th>
                  <th className="py-2" aria-label={t("Delete")} />
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const info = prices[asset.isin]
                  const price = info?.price
                  const prevClose = info?.previousClose ?? null
                  const dayPct =
                    price !== undefined && prevClose !== null && prevClose !== undefined && prevClose !== 0
                      ? ((price - prevClose) / prevClose) * 100
                      : null
                  const gpPct =
                    price !== undefined && asset.purchasePrice !== 0
                      ? ((price - asset.purchasePrice) / asset.purchasePrice) * 100
                      : null
                  return (
                    <tr key={asset.id} className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">{t(asset.product)}</td>
                      <td className="py-3 pr-4 tabular-nums text-muted-foreground">{asset.isin}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {asset.quantity.toLocaleString("es-ES")}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {formatMoney(asset.purchasePrice, info?.currency)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        {price !== undefined ? formatMoney(price, info?.currency) : "—"}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right tabular-nums ${
                          dayPct === null ? "" : dayPct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {dayPct === null
                          ? "—"
                          : `${dayPct >= 0 ? "+" : ""}${dayPct.toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}%`}
                      </td>
                      <td
                        className={`py-3 pr-4 text-right tabular-nums ${
                          gpPct === null ? "" : gpPct >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {gpPct === null
                          ? "—"
                          : `${gpPct >= 0 ? "+" : ""}${gpPct.toLocaleString("es-ES", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}%`}
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
            <p className="mt-2 text-xs text-muted-foreground">{t("Quotes may be delayed up to 15 minutes")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
