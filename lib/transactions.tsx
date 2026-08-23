"use client"

import { createContext, useContext, useEffect, useState } from "react"

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
  addBankMovements: (movements: BankMovementInput[]) => void
  removeTransaction: (id: string) => void
}

const TransactionsContext = createContext<TransactionsContextValue | null>(null)

const STORAGE_KEY = "appTransactions"

function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date))
}

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const withoutDemos = parsed.filter(
            (transaction) => typeof transaction?.id === "string" && !transaction.id.startsWith("demo-"),
          )
          if (withoutDemos.length > 0) {
            setTransactions(withoutDemos)
          }
        }
      }
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch {
      // storage unavailable
    }
  }, [transactions, hydrated])

  const addBankMovements = (movements: BankMovementInput[]) => {
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

      return [...fresh, ...prev]
    })
  }

  const removeTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
  }

  return (
    <TransactionsContext.Provider value={{ transactions, addBankMovements, removeTransaction }}>
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
