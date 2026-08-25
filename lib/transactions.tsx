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
  addBankMovements: (movements: BankMovementInput[]) => number
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

  const addBankMovements = (movements: BankMovementInput[]): number => {
    let added = 0
    setTransactions((prev) => {
      const existingKeys = new Set(
        prev.map((transaction) => `${transaction.date}|${transaction.name}|${transaction.amount}`),
      )

      const fresh: Transaction[] = []
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

      added = fresh.length
      return [...fresh, ...prev]
    })
    return added
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
