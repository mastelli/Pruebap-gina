"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { storageGetItem, storageSetItem, onStorageVersionChange } from "@/lib/auth"

export interface Transaction {
  id: string
  name: string
  amount: number
  date: string
}

export interface BankMovementInput {
  date: string
  concept: string
  amount: number
}

const DEFAULT_TRANSACTIONS: Transaction[] = []

interface TransactionsContextValue {
  transactions: Transaction[]
  checkingBalance: number | null
  addBankMovements: (movements: BankMovementInput[]) => Transaction[]
  updateCheckingBalance: (delta: number) => void
  setCheckingBalance: (value: number) => void
  removeTransaction: (id: string) => void
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

const STORAGE_KEY = "appTransactions"
const BALANCE_STORAGE_KEY = "appCheckingBalance"

function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date))
}

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS)
  const [checkingBalance, setCheckingBalanceState] = useState<number | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [storageVer, setStorageVer] = useState(0)

  // Re-load data when userId changes (storage version increments)
  useEffect(() => {
    return onStorageVersionChange(() => setStorageVer((v) => v + 1))
  }, [])

  // Load from storage — re-runs on each storageVer change
  useEffect(() => {
    try {
      const stored = storageGetItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const withoutDemos = parsed.filter(
            (transaction) => typeof transaction?.id === "string" && !transaction.id.startsWith("demo-"),
          )
          setTransactions(withoutDemos)
        }
      }

      const storedBalance = storageGetItem(BALANCE_STORAGE_KEY)
      if (storedBalance !== null) {
        const parsedBalance = Number.parseFloat(storedBalance)
        if (!Number.isNaN(parsedBalance)) {
          setCheckingBalanceState(parsedBalance)
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [storageVer])

  // Only save AFTER hydration with a valid storage version
  useEffect(() => {
    if (!hydrated) return
    try {
      storageSetItem(STORAGE_KEY, JSON.stringify(transactions))
      storageSetItem(BALANCE_STORAGE_KEY, String(checkingBalance ?? 0))
    } catch {}
  }, [transactions, checkingBalance, hydrated])

  const addBankMovements = (movements: BankMovementInput[]): Transaction[] => {
    let fresh: Transaction[] = []
    setTransactions((prev) => {
      const existingKeys = new Set(
        prev.map((transaction) => `${transaction.date}|${transaction.name}|${transaction.amount}`),
      )

      fresh = []
      movements.forEach((movement, index) => {
        const transaction: Transaction = {
          id: `bank-${Date.now()}-${index}`,
          name: movement.concept || "Sin concepto",
          amount: movement.amount,
          date: movement.date || new Date().toISOString().slice(0, 10),
        }
        const key = `${transaction.date}|${transaction.name}|${transaction.amount}`
        if (!existingKeys.has(key)) {
          existingKeys.add(key)
          fresh.push(transaction)
        }
      })

      return [...fresh, ...prev]
    })
    return fresh
  }

  const updateCheckingBalance = (delta: number) => {
    setCheckingBalanceState((prev) => (prev ?? 0) + delta)
  }

  const setCheckingBalance = (value: number) => {
    setCheckingBalanceState(value)
  }

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        checkingBalance,
        addBankMovements,
        updateCheckingBalance,
        setCheckingBalance,
        removeTransaction,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions(): TransactionsContextValue {
  const context = useContext(TransactionsContext)
  if (!context) {
    throw new Error("useTransactions must be used within TransactionsProvider")
  }
  return context
}

export { sortByDateDesc }

// Prefijo AAAA-MM del mes elegido usando el anio mas reciente que tenga
// movimientos en ese mes; si no hay datos, cae al anio en curso.
export function getPeriodPrefix(transactions: Transaction[], month: string): string {
  let latestYear = -Infinity
  for (const transaction of transactions) {
    if (transaction.date.length < 7 || transaction.date.slice(5, 7) !== month) continue
    const year = Number.parseInt(transaction.date.slice(0, 4), 10)
    if (Number.isFinite(year) && year > latestYear) latestYear = year
  }
  if (!Number.isFinite(latestYear)) return `${new Date().getFullYear()}-${month}`
  return `${latestYear}-${month}`
}

// Prefijo AAAA-MM del momento real de los datos: el periodo (mes + anio) de la
// ultima transaccion importada o anadida. Sin datos, cae al mes en curso.
export function getLatestPeriod(transactions: Transaction[]): string {
  let latest = ""
  for (const transaction of transactions) {
    const prefix = transaction.date.slice(0, 7)
    if (prefix.length === 7 && prefix > latest) latest = prefix
  }
  if (!latest) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }
  return latest
}
