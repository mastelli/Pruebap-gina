// Cotizaciones directas de TradingView por ISIN: primero se busca el
// ticker en cada bolsa (symbol-search) y luego se lee el scanner.
// Sin dependencias de React: se usa desde las API routes.
import { sameVenue } from "./exchanges"

export interface TvSearchRow {
  symbol?: unknown
  exchange?: unknown
  currency?: unknown
  description?: unknown
}

export interface TvQuote {
  symbol: string
  price: number
  previousClose: number | null
  currency: string
  longName?: string
  exchange?: string
}

const TV_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  Referer: "https://www.tradingview.com/",
  Origin: "https://www.tradingview.com",
}

const tvSymbolCache = new Map<string, { exchange: string; symbol: string }>()

export function isValidIsin(value: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{9}\d$/.test((value ?? "").trim().toUpperCase())
}

// Elige la fila del listado exacto si coincide la bolsa (comparando con
// alias: "XETRA" vale para "XETR", "BME Madrid" para "BME"...), si no el
// listado en EUR y si no la primera fila con simbolo. El ISIN solo no
// basta: el mismo valor cotiza en USD y en EUR.
export function pickTvRow(
  rows: TvSearchRow[],
  exchangeReq?: string,
): { exchange: string; symbol: string; currency: string; description: string } | null {
  const clean = (Array.isArray(rows) ? rows : [])
    .map((r) => ({
      exchange: String(r?.exchange ?? "").trim(),
      symbol: String(r?.symbol ?? "").trim(),
      currency: String(r?.currency ?? "").trim().toUpperCase(),
      description: String(r?.description ?? "").trim(),
    }))
    .filter((r) => r.symbol !== "" && r.exchange !== "")
  if (clean.length === 0) return null
  const ex = exchangeReq ?? ""
  if (ex.trim() !== "") {
    const match = clean.find((r) => sameVenue(r.exchange, ex))
    if (match) return match
  }
  return clean.find((r) => r.currency === "EUR") ?? clean[0] ?? null
}

// Convierte la respuesta del scanner en cotizacion. LSE cotiza en peniques
// (GBX): se pasa a libras para no multiplicar por 100 el valor.
export function parseTvScanner(ticker: string, exchange: string, json: unknown): TvQuote | null {
  const o = (json ?? {}) as Record<string, unknown>
  const close = typeof o["close"] === "number" && Number.isFinite(o["close"]) ? o["close"] : null
  if (close === null) return null
  const changeAbs =
    typeof o["change_abs"] === "number" && Number.isFinite(o["change_abs"]) ? o["change_abs"] : null
  let currency = typeof o["currency"] === "string" && o["currency"] !== "" ? o["currency"] : "EUR"
  let price = close
  if (currency.toUpperCase() === "GBX") {
    price = close / 100
    currency = "GBP"
  }
  const description = typeof o["description"] === "string" ? o["description"] : ""
  return {
    symbol: `${exchange}:${ticker}`,
    price,
    previousClose: changeAbs !== null ? price - changeAbs : null,
    currency,
    longName: description !== "" ? description : undefined,
    exchange,
  }
}

async function tvSearchByIsin(isin: string): Promise<TvSearchRow[]> {
  const res = await fetch(
    `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(isin.trim().toUpperCase())}`,
    { headers: TV_HEADERS, signal: AbortSignal.timeout(8000) },
  )
  if (!res.ok) return []
  const json = await res.json()
  return Array.isArray(json) ? (json as TvSearchRow[]) : []
}

// Cotizacion directa de TradingView para un ISIN (search + scanner).
// Devuelve null si no hay listado utilizable.
export async function getTradingViewQuoteByIsin(
  isin: string,
  exchangeReq?: string,
): Promise<TvQuote | null> {
  const key = isin.trim().toUpperCase()
  if (!isValidIsin(key)) return null
  let picked = tvSymbolCache.get(key)
  if (picked === undefined) {
    const rows = await tvSearchByIsin(key).catch(() => [] as TvSearchRow[])
    const row = pickTvRow(rows, exchangeReq)
    picked = row ? { exchange: row.exchange, symbol: row.symbol } : null
    if (picked) tvSymbolCache.set(key, picked)
  }
  if (!picked) return null
  try {
    const res = await fetch(
      `https://scanner.tradingview.com/symbol?symbol=${encodeURIComponent(`${picked.exchange}:${picked.symbol}`)}&fields=${encodeURIComponent("close,change_abs,currency,description")}`,
      { headers: TV_HEADERS, signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return null
    return parseTvScanner(picked.symbol, picked.exchange, await res.json())
  } catch {
    return null
  }
}
