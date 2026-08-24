"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

const ACCOUNTS_KEY = "appAccounts"
const SESSION_KEY = "appSession"

interface AccountRecord {
  salt: string
  hash: string
  name?: string
  surname?: string
  birthDate?: string
}

// edad a partir de la fecha de nacimiento (YYYY-MM-DD); null si es invalida
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

type Accounts = Record<string, AccountRecord>

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

// correo de la sesion activa; solo se rellena tras validar la contraseÃ±a
let sessionEmail: string | null = null

// clave de almacenamiento aislada por cuenta; los componentes deben usar
// estas funciones en lugar de window.localStorage directamente
export function accountStorageKey(base: string): string {
  return sessionEmail ? `${base}::${sessionEmail}` : base
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

interface RegisterDetails {
  name: string
  surname: string
  birthDate: string
}

interface AuthContextValue {
  email: string | null
  ready: boolean
  login: (email: string, password: string) => Promise<string | null>
  register: (email: string, password: string, details: RegisterDetails) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SESSION_KEY)
      if (saved) {
        sessionEmail = saved
        setEmail(saved)
      }
    } catch {
      // almacenamiento no disponible
    }
    setReady(true)
  }, [])

  // devuelve un mensaje de error traducible o null si ha ido bien
  const login = useCallback(async (candidateEmail: string, password: string): Promise<string | null> => {
    let accounts: Accounts = {}
    try {
      const raw = window.localStorage.getItem(ACCOUNTS_KEY)
      if (raw) accounts = JSON.parse(raw) as Accounts
    } catch {
      accounts = {}
    }
    const normalized = candidateEmail.trim().toLowerCase()
    const record = accounts[normalized]
    if (!record) return "No account exists with this email"
    const hash = await sha256(`${record.salt}:${password}`)
    if (hash !== record.hash) return "Incorrect password"
    sessionEmail = normalized
    window.localStorage.setItem(SESSION_KEY, normalized)
    setEmail(normalized)
    return null
  }, [])

  const register = useCallback(
    async (candidateEmail: string, password: string, details: RegisterDetails): Promise<string | null> => {
      const normalized = candidateEmail.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return "Invalid email"
      if (!details.name.trim() || !details.surname.trim()) return "Please enter your name and surname"
      const age = ageFromBirthDate(details.birthDate)
      if (age === null) return "Enter a valid age"
      if (password.length < 4) return "Password must be at least 4 characters"
      let accounts: Accounts = {}
      try {
        const raw = window.localStorage.getItem(ACCOUNTS_KEY)
        if (raw) accounts = JSON.parse(raw) as Accounts
      } catch {
        accounts = {}
      }
      if (accounts[normalized]) return "This account already exists"
      const salt = randomSalt()
      const hash = await sha256(`${salt}:${password}`)
      accounts[normalized] = {
        salt,
        hash,
        name: details.name.trim(),
        surname: details.surname.trim(),
        birthDate: details.birthDate,
      }
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))

      // rellena el perfil con el nombre indicado en el registro
      try {
        let storedSettings: Record<string, unknown> = {}
        const rawSettings = storageGetItem("userSettings")
        if (rawSettings) storedSettings = JSON.parse(rawSettings) as Record<string, unknown>
        storageSetItem(
          "userSettings",
          JSON.stringify({
            ...storedSettings,
            fullName: `${details.name.trim()} ${details.surname.trim()}`,
            email: normalized,
            birthDate: details.birthDate,
          }),
        )
      } catch {
        // ajustes no disponibles
      }

      sessionEmail = normalized
      window.localStorage.setItem(SESSION_KEY, normalized)
      setEmail(normalized)
      return null
    },
    [],
  )

  const logout = useCallback(() => {
    sessionEmail = null
    try {
      window.localStorage.removeItem(SESSION_KEY)
    } catch {
      // almacenamiento no disponible
    }
    setEmail(null)
  }, [])

  const value = useMemo(() => ({ email, ready, login, register, logout }), [email, ready, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
