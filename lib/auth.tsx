"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs"

const ACCOUNTS_KEY = "appAccounts"
const MIGRATED_KEY = "appMigratedToClerk"

const STORAGE_KEYS = [
  "appPortfolio",
  "appPortfolioPrices",
  "appPortfolioHistory",
  "userSettings",
  "appTransactions",
  "appCheckingBalance",
  "appInvoices",
  "appChatMessages",
  "appChatNotes",
  "appExpenseBudgets",
  "appCategoryOverrides",
]

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
  try {
    return window.localStorage.getItem(accountStorageKey(base))
  } catch {
    return null
  }
}

export function storageSetItem(base: string, value: string): void {
  try {
    window.localStorage.setItem(accountStorageKey(base), value)
  } catch {
    // almacenamiento no disponible
  }
}

function migrateFromLocalStorage(clerkUserId: string, email: string | null) {
  if (!email) return
  try {
    const migrated = localStorage.getItem(MIGRATED_KEY)
    const migratedEmails: string[] = migrated ? JSON.parse(migrated) : []
    if (migratedEmails.includes(email)) return

    const accountsRaw = localStorage.getItem(ACCOUNTS_KEY)
    if (accountsRaw) {
      const accounts = JSON.parse(accountsRaw)
      if (accounts[email]) {
        for (const key of STORAGE_KEYS) {
          const oldKey = `${key}::${email}`
          const newKey = `${key}::${clerkUserId}`
          const data = localStorage.getItem(oldKey)
          if (data !== null && localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, data)
          }
        }
      }
    }

    migratedEmails.push(email)
    localStorage.setItem(MIGRATED_KEY, JSON.stringify(migratedEmails))
  } catch {
    // migracion silenciosa
  }
}

export function useAuth() {
  const { isSignedIn, isLoaded } = useClerkAuth()
  const { user } = useUser()

  const email = isSignedIn ? (user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? null) : null
  const name = isSignedIn ? (user?.firstName ?? null) : null
  const ready = isLoaded

  useEffect(() => {
    if (isSignedIn && user) {
      currentUserId = user.id
    } else {
      currentUserId = null
    }
  }, [isSignedIn, user])

  useEffect(() => {
    if (isSignedIn && user && email) {
      migrateFromLocalStorage(user.id, email)
    }
  }, [isSignedIn, user, email])

  return { email, name, ready }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
