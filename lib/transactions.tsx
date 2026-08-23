"use client"

import { createContext, useContext, useEffect, useState } from "react"

export interface Transaction {
  id: string
  name: string
  amount: number
  date: string
}

export interface BankExpenseInput {
  date: string
  concept: string
  amount: number
}

const DEFAULT_TRANSACTIONS: Transaction[] = []

interface TransactionsContextValue {
  transactions: Transaction[]
  addBankExpenses: (expenses: BankExpenseInput[]) => void
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

  const addBankExpenses = (expenses: BankExpenseInput[]) => {
    setTransactions((prev) => [
      ...expenses.map((expense, index) => ({
        id: `bank-${Date.now()}-${index}`,
        name: expense.concept,
        amount: expense.amount,
        date: expense.date || new Date().toISOString().slice(0, 10),
      })),
      ...prev,
    ])
  }

  return (
    <TransactionsContext.Provider value={{ transactions, addBankExpenses }}>
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
