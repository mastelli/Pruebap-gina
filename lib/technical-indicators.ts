// Indicadores tecnicos basicos calculados a partir del historico de precios.
// Se usan para alimentar el resumen de analisis tecnico generado por IA con
// datos reales (nunca estimaciones inventadas).

export interface PricePoint {
  price: number | null
  volume?: number | null
}

export interface QuoteInput {
  price?: number | null
  dayChangePct?: number | null
  week52High?: number | null
  week52Low?: number | null
}

export interface TechnicalSnapshot {
  price: number
  dayChangePct: number | null
  week52High: number | null
  week52Low: number | null
  sma20: number | null
  sma50: number | null
  rsi14: number | null
  trend1mPct: number | null
  trend3mPct: number | null
  volumeRatio: number | null
}

const round = (n: number, decimals = 2) => {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}

export function sma(values: number[], period: number): number | null {
  if (values.length < period || period <= 0) return null
  const slice = values.slice(-period)
  return round(slice.reduce((sum, v) => sum + v, 0) / period)
}

export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null

  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const change = values[i] - values[i - 1]
    if (change >= 0) avgGain += change
    else avgLoss -= change
  }
  avgGain /= period
  avgLoss /= period

  for (let i = period + 1; i < values.length; i++) {
    const change = values[i] - values[i - 1]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? -change : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100
  return round(100 - 100 / (1 + avgGain / avgLoss), 1)
}

export function pctChange(values: number[], sessions: number): number | null {
  if (sessions <= 0 || values.length <= sessions) return null
  const from = values[values.length - 1 - sessions]
  if (!from) return null
  const to = values[values.length - 1]
  return round(((to - from) / from) * 100, 2)
}

export function volumeRatio(volumes: number[], period = 20): number | null {
  if (volumes.length < period * 2) return null
  const recent = volumes.slice(-period)
  const previous = volumes.slice(-period * 2, -period)
  const recentAvg = recent.reduce((sum, v) => sum + v, 0) / period
  const previousAvg = previous.reduce((sum, v) => sum + v, 0) / period
  if (previousAvg <= 0) return null
  return round(recentAvg / previousAvg, 2)
}

export function buildTechnicalSnapshot(
  history: PricePoint[],
  quote: QuoteInput,
): TechnicalSnapshot | null {
  const closes = history
    .map((point) => point.price)
    .filter((price): price is number => typeof price === "number" && price > 0)
  const volumes = history
    .map((point) => point.volume)
    .filter((volume): volume is number => typeof volume === "number" && volume > 0)

  const lastClose = closes.length > 0 ? closes[closes.length - 1] : null
  const price = quote.price ?? lastClose
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) return null

  return {
    price: round(price),
    dayChangePct: quote.dayChangePct ?? null,
    week52High: quote.week52High ?? null,
    week52Low: quote.week52Low ?? null,
    sma20: sma(closes, 20),
    sma50: sma(closes, 50),
    rsi14: rsi(closes),
    trend1mPct: pctChange(closes, 21),
    trend3mPct: pctChange(closes, 63),
    volumeRatio: volumeRatio(volumes),
  }
}
