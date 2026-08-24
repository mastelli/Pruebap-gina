"use client"

import { useCallback, useEffect, useState } from "react"
import { storageGetItem, storageSetItem } from "@/lib/auth"

const PORTFOLIO_STORAGE_KEY = "appPortfolio"
const PRICES_STORAGE_KEY = "appPortfolioPrices"
const HISTORY_STORAGE_KEY = "appPortfolioHistory"
const REFRESH_MS = 30 * 1000

interface StoredAsset {
  isin: string
  quantity: number
  currency?: string
  csvPrice?: number
  eurValue?: number
}

interface PriceInfo {
  price?: number
  currency?: string
}

function monthKey(offsetMonths = 0): string {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() + offsetMonths)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

// Cartera total en euros; guarda ademas un historico mensual en
// localStorage para poder calcular la variacion respecto al mes pasado
export function usePortfolioEurTotal(): { total: number | null; momPct: number | null } {
  const [total, setTotal] = useState<number | null>(null)
  const [momPct, setMomPct] = useState<number | null>(null)

  const computeTotal = useCallback(async () => {
    try {
      const rawAssets = storageGetItem(PORTFOLIO_STORAGE_KEY)
      if (!rawAssets) {
        setTotal(0)
        return
      }
      const parsed = JSON.parse(rawAssets) as StoredAsset[] | { assets?: StoredAsset[] }
      const assets: StoredAsset[] = Array.isArray(parsed) ? parsed : parsed.assets ?? []

      let rawPrices: Record<string, PriceInfo> = {}
      try {
        const rawPricesJson = storageGetItem(PRICES_STORAGE_KEY)
        if (rawPricesJson) rawPrices = JSON.parse(rawPricesJson) as Record<string, PriceInfo>
      } catch {
        rawPrices = {}
      }

      if (assets.length === 0) {
        setTotal(0)
        return
      }

      // divisas distintas del euro presentes en la cartera
      const currencies = new Set<string>()
      for (const asset of assets) {
        const liveCurrency = rawPrices[asset.isin]?.currency
        const currency = (liveCurrency ?? asset.currency ?? "EUR").toUpperCase()
        if (currency && currency !== "EUR") currencies.add(currency)
      }

      const res = await fetch("/api/portfolio-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: assets.map((asset) => ({ isin: asset.isin })),
          currencies: Array.from(currencies),
        }),
      })
      const json = (await res.json()) as {
        results?: Record<string, PriceInfo | null>
        fx?: Record<string, number>
      }
      const results = json.results ?? {}
      const fx = json.fx ?? {}

      let sum = 0
      for (const asset of assets) {
        const quote = results[asset.isin]
        const price = quote?.price ?? asset.csvPrice
        const currency = (quote?.currency ?? asset.currency ?? "EUR").toUpperCase()
        const rate = !currency || currency === "EUR" ? 1 : (fx[currency] ?? 1)

        if (price !== undefined) {
          sum += price * asset.quantity * rate
        } else if (asset.eurValue !== undefined) {
          // el csv ya traia el valor en euros de la posicion completa
          sum += asset.eurValue
        }
      }
      setTotal(sum)

      // historico mensual: guarda el valor de este mes y compara con el anterior
      try {
        const key = monthKey()
        const prevKey = monthKey(-1)
        let history: Record<string, number> = {}
        const rawHistory = storageGetItem(HISTORY_STORAGE_KEY)
        if (rawHistory) history = JSON.parse(rawHistory) as Record<string, number>
        history[key] = sum
        storageSetItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
        const prevValue = history[prevKey]
        setMomPct(prevValue && prevValue > 0 ? ((sum - prevValue) / prevValue) * 100 : null)
      } catch {
        // almacenamiento no disponible
      }
    } catch {
      // almacenamiento no disponible o respuesta invalida
    }
  }, [])

  useEffect(() => {
    void computeTotal()
    const id = setInterval(() => void computeTotal(), REFRESH_MS)
    return () => clearInterval(id)
  }, [computeTotal])

  return { total, momPct }
}

// Suma de los totales de la cartera en euros, con conversion de divisa
export function PortfolioTotal() {
  const { total } = usePortfolioEurTotal()

  const formatted =
    total === null
      ? "…"
      : total.toLocaleString("es-ES", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        })

  return <span className="tabular-nums">{formatted}</span>
}
