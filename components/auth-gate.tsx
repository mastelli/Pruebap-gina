"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth"
import { AuthScreen } from "@/components/auth-screen"

// Bloquea el acceso a toda la aplicacion mientras no haya una sesion
// con contraseña validada; evita parpadeos esperando a leer la sesion
export function AuthGate({ children }: { children: ReactNode }) {
  const { email, ready } = useAuth()

  if (!ready) return null
  if (!email) return <AuthScreen />
  return <>{children}</>
}
