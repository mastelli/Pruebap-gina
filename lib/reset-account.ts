"use client"

import { storageSetItem } from "@/lib/auth"

// Claves con dinero de la cuenta y su valor a cero.
// No se tocan ajustes, categorías ni preferencias: solo saldos,
// movimientos, cartera, facturas y deudas.
const ZERO_VALUES: Record<string, string> = {
  appTransactions: "[]",
  appCheckingBalance: "0",
  appPortfolio: "[]",
  appPortfolioCash: "0",
  appPortfolioPrices: "{}",
  appPortfolioHistory: "{}",
  appPortfolioProV1: "[]",
  appManualStocks: "[]",
  appInvoices: "[]",
  "debt-dashboard-items": "[]",
}

export function resetAccountToZero(): string[] {
  if (typeof window === "undefined") return []
  const cleared: string[] = []
  try {
    const suffixes = new Set<string>()
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k) suffixes.add(k)
    }
    for (const [base, zero] of Object.entries(ZERO_VALUES)) {
      // Borra la clave sin prefijo y todas las variantes por cuenta (::userId)
      window.localStorage.removeItem(base)
      for (const k of suffixes) {
        if (k === base || k.startsWith(`${base}::`)) {
          window.localStorage.removeItem(k)
        }
      }
      // Escribe el cero en la cuenta activa (también sincroniza a Supabase)
      try {
        storageSetItem(base, zero)
      } catch {
        // sin almacenamiento
      }
      cleared.push(base)
    }
  } catch {
    // almacenamiento no disponible
  }
  return cleared
}
