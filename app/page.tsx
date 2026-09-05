"use client"

import { useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { TrendingUp, Shield, LayoutDashboard } from "lucide-react"

export default function Page() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <p>Cargando estado de sesión...</p>
  }

  if (!isSignedIn) {
    // Usuario NO está logueado - mostrar bienvenida
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="w-full max-w-2xl text-center">
          <LayoutDashboard className="h-12 w-12 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight mb-4">Make It Right</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Gestión financiera para personas y empresas.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Link
              href="/calculator"
              className="btn btn-primary flex items-center justify-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Calculadora de Interés Compuesto</span>
            </Link>
            <Link
              href="/analytics/overview"
              className="btn btn-secondary flex items-center justify-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Análisis Financiero</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Usuario ESTÁ logueado - mostrar la aplicación normal
  return (
    <div className="w-full">
      <h1 className="hidden">Aplicación financiera</h1>
    </div>
  )
}