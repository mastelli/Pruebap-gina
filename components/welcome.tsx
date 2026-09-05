"use client"

import Link from "next/link"
import { BookOpen, Shield, TrendingUp, LayoutDashboard } from "lucide-react"

export function Welcome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-2xl text-center">
        <LayoutDashboard className="h-12 w-12 mx-auto mb-6 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Make It Right</h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Una plataforma integral para el gestión de tus finanzas personales y empresariales.
          Controla tus inversiones, analiza tus datos y planifica tu futuro financiero.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link
            href="/calculator"
            className="group flex items-center justify-center rounded-full bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <TrendingUp className="mr-2 h-5 w-5" />
            <span>Calculadora de Interés Compuesto</span>
          </Link>
          <Link
            href="/analytics/overview"
            className="group flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-lg font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors">
            <TrendingUp className="mr-2 h-5 w-5" />
            <span>Análisis Financiero</span>
          </Link>
          <Link
            href="/sign-in"
            className="group flex items-center justify-center rounded-full border-2 border-border px-6 py-3 text-lg font-medium text-foreground hover:bg-border/20 transition-colors">
            <Shield className="mr-2 h-5 w-5" />
            <span>Iniciar Sesión</span>
          </Link>
        </div>
      </div>
    </div>
  )
}