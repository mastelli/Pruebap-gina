"use client"

import { createContext, useContext, useEffect } from "react"

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

interface AuthState {
  email: string | null
  name: string | null
  ready: boolean
  userId: string | null
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  email: null,
  name: null,
  ready: false,
  userId: null,
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children, value }: { children: React.ReactNode; value: AuthState }) {
  useEffect(() => {
    currentUserId = value.userId
  }, [value.userId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
