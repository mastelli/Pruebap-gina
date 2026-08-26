import type { Currency } from "./real-estate-types"

const localeMap: Record<Currency, string> = {
  EUR: "es-ES",
  USD: "en-US",
  GBP: "en-GB",
}

const symbolMap: Record<Currency, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
}

export function formatCurrency(
  amount: number,
  currency: Currency = "EUR",
  decimals = 0,
): string {
  try {
    return new Intl.NumberFormat(localeMap[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  } catch {
    return `${symbolMap[currency]}${amount.toFixed(decimals)}`
  }
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
