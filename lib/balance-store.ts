"use client"

import { useState, useEffect, useCallback } from "react"
import type { BalanceItem, CashFlowEntry, FinancialGoal, BalanceSnapshot } from "./balance-engine"
import { generateId, getDemoData } from "./balance-engine"

const STORAGE_KEY = "balance2-data"

function loadFromStorage(): BalanceSnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(data: BalanceSnapshot) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // silently fail
  }
}

export function useBalanceStore() {
  const [snapshot, setSnapshot] = useState<BalanceSnapshot | null>(null)
  const [history, setHistory] = useState<BalanceSnapshot[]>([])

  useEffect(() => {
    const saved = loadFromStorage()
    if (saved) {
      setSnapshot(saved)
      loadHistory()
    } else {
      const demo = getDemoData()
      setSnapshot(demo)
      saveToStorage(demo)
    }
  }, [])

  const loadHistory = useCallback(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}-history`)
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
  }, [])

  const persist = useCallback((s: BalanceSnapshot) => {
    saveToStorage(s)
  }, [])

  const saveSnapshot = useCallback(() => {
    if (!snapshot) return
    const newHistory = [...history, { ...snapshot, id: generateId() }].slice(-50)
    setHistory(newHistory)
    localStorage.setItem(`${STORAGE_KEY}-history`, JSON.stringify(newHistory))
  }, [snapshot, history])

  const addAsset = useCallback(
    (item: Omit<BalanceItem, "id">) => {
      if (!snapshot) return
      const newItem = { ...item, id: generateId() } as BalanceItem
      const updated = { ...snapshot, assets: [...snapshot.assets, newItem] }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const updateAsset = useCallback(
    (id: string, updates: Partial<BalanceItem>) => {
      if (!snapshot) return
      const updated = {
        ...snapshot,
        assets: snapshot.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const removeAsset = useCallback(
    (id: string) => {
      if (!snapshot) return
      const updated = { ...snapshot, assets: snapshot.assets.filter((a) => a.id !== id) }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const addLiability = useCallback(
    (item: Omit<BalanceItem, "id">) => {
      if (!snapshot) return
      const newItem = { ...item, id: generateId() } as BalanceItem
      const updated = { ...snapshot, liabilities: [...snapshot.liabilities, newItem] }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const updateLiability = useCallback(
    (id: string, updates: Partial<BalanceItem>) => {
      if (!snapshot) return
      const updated = {
        ...snapshot,
        liabilities: snapshot.liabilities.map((l) => (l.id === id ? { ...l, ...updates } : l)),
      }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const removeLiability = useCallback(
    (id: string) => {
      if (!snapshot) return
      const updated = { ...snapshot, liabilities: snapshot.liabilities.filter((l) => l.id !== id) }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const addCashFlow = useCallback(
    (entry: Omit<CashFlowEntry, "id">) => {
      if (!snapshot) return
      const newEntry = { ...entry, id: generateId() } as CashFlowEntry
      const updated = { ...snapshot, cashFlow: [...snapshot.cashFlow, newEntry] }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const removeCashFlow = useCallback(
    (id: string) => {
      if (!snapshot) return
      const updated = { ...snapshot, cashFlow: snapshot.cashFlow.filter((e) => e.id !== id) }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const addGoal = useCallback(
    (goal: Omit<FinancialGoal, "id">) => {
      if (!snapshot) return
      const newGoal = { ...goal, id: generateId() } as FinancialGoal
      const updated = { ...snapshot, goals: [...snapshot.goals, newGoal] }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const updateGoal = useCallback(
    (id: string, updates: Partial<FinancialGoal>) => {
      if (!snapshot) return
      const updated = {
        ...snapshot,
        goals: snapshot.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const removeGoal = useCallback(
    (id: string) => {
      if (!snapshot) return
      const updated = { ...snapshot, goals: snapshot.goals.filter((g) => g.id !== id) }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const setEssentialExpenses = useCallback(
    (amount: number) => {
      if (!snapshot) return
      const updated = { ...snapshot, essentialMonthlyExpenses: amount }
      setSnapshot(updated)
      persist(updated)
    },
    [snapshot, persist],
  )

  const resetToDemo = useCallback(() => {
    const demo = getDemoData()
    setSnapshot(demo)
    persist(demo)
  }, [persist])

  return {
    snapshot,
    history,
    addAsset,
    updateAsset,
    removeAsset,
    addLiability,
    updateLiability,
    removeLiability,
    addCashFlow,
    removeCashFlow,
    addGoal,
    updateGoal,
    removeGoal,
    setEssentialExpenses,
    saveSnapshot,
    resetToDemo,
  }
}
