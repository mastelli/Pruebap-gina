// Cotizaciones de Tradegate Exchange por ISIN (endpoint publico).
// Sin dependencias de React: se usa desde las API routes.

export interface TradegateQuote {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
  exchange: string
}

const TG_UA = { "User-Agent": "Mozilla/5.0" }

export function tradegateNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    // Tradegate mezcla floats ("130.21"), formato aleman ("296,40") y
    // miles con espacio ("1 220,00"): se quitan todos los espacios primero
    const s = value.trim().replace(/\s/g, "")
    if (!s) return null
    const normalized = /,\d{1,4}$/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s
    const n = parseFloat(normalized)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export async function getTradegateQuote(isin: string): Promise<TradegateQuote | null> {
  if (!/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(isin.trim().toUpperCase())) return null
  try {
    const res = await fetch(
      `https://www.tradegate.de/refresh.php?isin=${encodeURIComponent(isin.trim().toUpperCase())}`,
      { headers: TG_UA, signal: AbortSignal.timeout(5000) },
    )
    if (!res.ok) return null
    const text = await res.text()
    if (!text.trim()) return null
    const json = JSON.parse(text)
    const price = tradegateNumber(json?.last) ?? tradegateNumber(json?.ask) ?? tradegateNumber(json?.bid)
    if (price === null) return null
    return {
      symbol: isin.trim().toUpperCase(),
      price,
      previousClose: tradegateNumber(json?.close),
      currency: "EUR",
      exchange: "Tradegate",
    }
  } catch {
    return null
  }
}
