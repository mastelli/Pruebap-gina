"use client"

import { createContext, useContext, useEffect, useRef } from "react"
import { cloudSet, cloudSetBatch, cloudGetAll } from "./cloud-storage"

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
let storageVersion = 0
let storageVersionListeners: Array<() => void> = []

export function onStorageVersionChange(cb: () => void): () => void {
  storageVersionListeners.push(cb)
  return () => { storageVersionListeners = storageVersionListeners.filter((l) => l !== cb) }
}

export function getStorageVersion(): number {
  return storageVersion
}

export function accountStorageKey(base: string): string {
  return currentUserId ? `${base}::${currentUserId}` : base
}

export function getAuthUserId(): string | null {
  return currentUserId
}

export function storageGetItem(base: string): string | null {
  try {
    const prefixed = currentUserId ? `${base}::${currentUserId}` : null
    if (prefixed) {
      const val = window.localStorage.getItem(prefixed)
      if (val !== null) return val
    }
    return window.localStorage.getItem(base)
  } catch {
    return null
  }
}

export function storageSetItem(base: string, value: string): void {
  if (!currentUserId) return
  try {
    const key = accountStorageKey(base)
    window.localStorage.setItem(key, value)
    // Background sync to Supabase — store raw JSON string
    cloudSet(currentUserId, key, value).catch(() => {})
  } catch {}
}

export function readStorage(base: string): string | null {
  try {
    const prefixed = currentUserId ? `${base}::${currentUserId}` : null
    if (prefixed) {
      const val = window.localStorage.getItem(prefixed)
      if (val !== null) return val
    }
    return window.localStorage.getItem(base)
  } catch {
    return null
  }
}

export function writeStorage(base: string, value: string): void {
  if (!currentUserId) return
  try {
    const key = accountStorageKey(base)
    window.localStorage.setItem(key, value)
    // Background sync to Supabase — store raw JSON string
    cloudSet(currentUserId, key, value).catch(() => {})
  } catch {}
}

const MIGRATE_KEYS = [
  "appTransactions",
  "appPortfolio",
  "appPortfolioCash",
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

// Migrate unprefixed localStorage → prefixed (for existing users before Clerk)
function migrateLocalStorageKeys(userId: string) {
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

// Pull all data from Supabase → localStorage (always overwrite — Supabase is source of truth)
async function syncFromCloud(userId: string) {
  try {
    const allData = await cloudGetAll(userId)
    if (!allData || Object.keys(allData).length === 0) return
    for (const [key, value] of Object.entries(allData)) {
      if (value !== null) {
        window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value))
      }
    }
  } catch {}
}

let lastSyncTime = 0
const SYNC_COOLDOWN_MS = 10000

async function syncFromCloudAndNotify(userId: string) {
  const now = Date.now()
  if (now - lastSyncTime < SYNC_COOLDOWN_MS) return
  lastSyncTime = now
  await syncFromCloud(userId)
  storageVersion++
  for (const l of storageVersionListeners) l()
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

  // Set currentUserId SYNCHRONOUSLY during render
  if (value.userId !== currentUserId) {
    currentUserId = value.userId
    storageVersion++
    for (const l of storageVersionListeners) l()
  }

  useEffect(() => {
    if (!value.userId) return
    if (prevUserIdRef.current === value.userId) return
    prevUserIdRef.current = value.userId

    // 1. Migrate old unprefixed localStorage → prefixed
    migrateLocalStorageKeys(value.userId)

    // 2. Pull from Supabase → localStorage
    syncFromCloud(value.userId).then(() => {
      // Force re-load in providers after cloud sync completes
      storageVersion++
      for (const l of storageVersionListeners) l()
    })

    // 3. Re-sync when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && value.userId) {
        syncFromCloudAndNotify(value.userId)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [value.userId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
