"use client"

import { getAuthUserId } from "@/lib/auth"
import { cloudSetBatch } from "@/lib/cloud-storage"

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

export async function resetAccountToZero(): Promise<string[]> {
  if (typeof window === "undefined") return []
  const cleared: string[] = []
  const userId = getAuthUserId()
  const cloudItems: { key: string; value: unknown }[] = []
  try {
    for (const [base, zero] of Object.entries(ZERO_VALUES)) {
      // Cero local: clave base + clave de la cuenta activa.
      // Se escribe directamente (sin depender de storageSetItem) y
      // no se tocan claves de otras cuentas.
      try {
        window.localStorage.setItem(base, zero)
      } catch {
        // sin almacenamiento
      }
      if (userId) {
        const prefixed = `${base}::${userId}`
        try {
          window.localStorage.setItem(prefixed, zero)
        } catch {
          // sin almacenamiento
        }
        cloudItems.push({ key: prefixed, value: zero })
      }
      cleared.push(base)
    }
    // Espera a que la nube guarde los ceros ANTES de recargar,
    // si no el valor antiguo (p. ej. 3345,12 €) volvería al iniciar sesión.
    if (userId && cloudItems.length > 0) {
      try {
        await cloudSetBatch(userId, cloudItems)
      } catch {
        // se reintentará en el siguiente guardado
      }
    }
  } catch {
    // almacenamiento no disponible
  }
  return cleared
}
