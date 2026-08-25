"use client"

import { createContext, useContext, useEffect, useRef } from "react"

export function ageFromBirthDate(birthDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null
  const birth = new Date(`${birthDate}T00:00:00`)
  if (Number.isNaN(birth.getTime()) || birth > new Date()) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age >= 0 && age <= 120 ? age : null
}

let currentUserId: string | null = null

export function accountStorageKey(base: string): string {
  return currentUserId ? `${base}::${currentUserId}` : base
}

export function storageGetItem(base: string): string | null {
  if (!currentUserId) return null
  try {
    return window.localStorage.getItem(accountStorageKey(base))
  } catch {
    return null
  }
}

export function storageSetItem(base: string, value: string): void {
  if (!currentUserId) return
  try {
    window.localStorage.setItem(accountStorageKey(base), value)
  } catch {
    // almacenamiento no disponible
  }
}

const MIGRATE_KEYS = [
  "appTransactions",
  "appPortfolio",
  "appPortfolioPrices",
  "appPortfolioHistory",
  "userSettings",
  "appCheckingBalance",
  "appInvoices",
  "appChatMessages",
  "appChatNotes",
  "appExpenseBudgets",
  "appCategoryOverrides",
  "appCustomCategories",
  "appHiddenCategories",
]

function migrateIfNeeded(userId: string) {
  try {
    for (const key of MIGRATE_KEYS) {
      const prefixedKey = `${key}::${userId}`
      if (window.localStorage.getItem(prefixedKey) !== null) continue
      const old = window.localStorage.getItem(key)
      if (old !== null) {
        window.localStorage.setItem(prefixedKey, old)
      }
    }
  } catch {}
}

interface AuthState {
  email: string | null
  name: string | null
  lastName: string | null
  ready: boolean
  userId: string | null
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  email: null,
  name: null,
  lastName: null,
  ready: false,
  userId: null,
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children, value }: { children: React.ReactNode; value: AuthState }) {
  const prevUserIdRef = useRef<string | null>(null)

  // Set currentUserId SYNCHRONOUSLY during render so that any child
  // component calling storageGetItem in its own mount/useEffect will
  // already see the correct userId (no race condition).
  if (value.userId !== currentUserId) {
    currentUserId = value.userId
  }

  // Migrate old localStorage data when userId changes
  useEffect(() => {
    if (!value.userId) return
    if (prevUserIdRef.current === value.userId) return
    prevUserIdRef.current = value.userId
    migrateIfNeeded(value.userId)
  }, [value.userId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
