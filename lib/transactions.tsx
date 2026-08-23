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

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: "demo-1", name: "Amazon.com", amount: -129.99, date: "2023-07-15" },
  { id: "demo-2", name: "Whole Foods Market", amount: -89.72, date: "2023-07-10" },
  { id: "demo-3", name: "Netflix Subscription", amount: -15.99, date: "2023-07-05" },
  { id: "demo-4", name: "Freelance Payment", amount: 750, date: "2023-07-12" },
  { id: "demo-5", name: "Gas Station", amount: -45.5, date: "2023-07-18" },
]

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
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed)
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
