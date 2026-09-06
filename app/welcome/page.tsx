"use client"

import Link from "next/link"
import {
  ArrowRight,
  Lock,
  TrendingUp,
  PieChart,
  Wallet,
  ShieldCheck,
  Calculator,
  LineChart,
  Landmark,
  Globe,
  Smartphone,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { useSettings } from "@/contexts/settings-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"

export default function Welcome() {
  const { t } = useLanguage()
  const { ready, userId, name, email, logout } = useAuth()
  const { settings } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const signedIn = ready && Boolean(userId)
  const displayName = name ?? settings.fullName

  return (
    <div className="isolate min-h-screen bg-background text-foreground">
      {/* ======================= FONDO DECORATIVO ======================= */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div
          className="absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-indigo-400/15 blur-3xl"
          style={{ animation: "blob-drift 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -left-36 top-1/3 h-[380px] w-[380px] rounded-full bg-sky-400/10 blur-3xl"
          style={{ animation: "blob-drift 18s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute -bottom-24 left-1/4 h-[340px] w-[340px] rounded-full bg-emerald-400/10 blur-3xl"
          style={{ animation: "blob-drift 16s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 h-[280px] w-[280px] rounded-full bg-violet-400/10 blur-3xl"
          style={{ animation: "blob-drift 20s ease-in-out infinite reverse" }}
        />
        <div className="absolute -bottom-40 -right-36 h-[560px] w-[560px] rounded-full border border-primary/10" />
        <div className="absolute -bottom-28 -right-20 h-[340px] w-[340px] rounded-full border border-primary/10" />
        <div className="absolute -top-24 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full border border-emerald-400/20" />
        <div className="absolute left-8 top-1/4 h-3 w-3 rounded-full bg-primary/15" />
        <div className="absolute left-56 top-2/3 h-2 w-2 rounded-full bg-indigo-400/25" />
        <div className="absolute right-14 top-1/2 h-2 w-2 rounded-full bg-emerald-400/25" />
        <div className="absolute bottom-16 left-1/3 h-2.5 w-2.5 rounded-full bg-violet-400/25" />
      </div>
      {/* ======================= NAVBAR ======================= */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LineChart className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">MakeItRight</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: "Producto", href: "#features" },
              { label: "Características", href: "#features" },
              { label: "Análisis", href: "/analytics" },
              { label: "Blog", href: "#features" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {signedIn ? (
              <>
                <Button size="sm" asChild>
                  <Link href="/inicio">Ir a la app</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <UserAvatar name={displayName || "?"} className="h-8 w-8 text-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">{t("Profile")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">{t("Settings")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout() }}>{t("Log out")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/sign-in">{t("Sign in")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">{t("Create account")}</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="rounded-md p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Producto
              </a>
              <div className="flex gap-3 pt-2">
                {signedIn ? (
                  <>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/inicio">Ir a la app</Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 shrink-0 rounded-full">
                          <UserAvatar name={displayName || "?"} className="h-8 w-8 text-xs" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{email}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/settings">{t("Profile")}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings">{t("Settings")}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout() }}>{t("Log out")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/sign-in">{t("Sign in")}</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/sign-up">{t("Create account")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ======================= HERO ======================= */}
      <section className="isolate relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% -10%, hsl(var(--primary) / 0.08), transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-5 px-3 py-1">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              La plataforma financiera de confianza
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Controla tus finanzas.
              <br />
              Decide con <span className="text-primary/70">inteligencia</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              MakeItRight reúne tu patrimonio, tus inversiones y tus cálculos en un solo
              lugar. Analiza, simula y planifica tu futuro financiero con herramientas de
              nivel profesional.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="min-w-[220px]" asChild>
                <Link href="/inicio">
                  Empieza gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[220px]" asChild>
                <Link href="/calculator">
                  Ver calculadoras
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              14 días de prueba gratuita · Sin tarjeta de crédito
            </p>
          </div>
        </div>
      </section>

      {/* ======================= FEATURES ======================= */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Todo tu dinero, bajo control
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Herramientas que antes solo estaban al alcance de asesores profesionales.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: "Control de patrimonio",
              desc: "Sincroniza tus cuentas y sigue tu patrimonio neto al día. Ingresos, gastos y ahorro en un solo panel.",
            },
            {
              icon: Calculator,
              title: "Calculadoras financieras",
              desc: "Interés compuesto, inmuebles y acciones. Simula escenarios antes de tomar decisiones.",
            },
            {
              icon: TrendingUp,
              title: "Análisis avanzado",
              desc: "Gráficos, métricas y diagnóstico automático de tu salud financiera con recomendaciones personalizadas.",
            },
            {
              icon: PieChart,
              title: "Inversión inteligente",
              desc: "Sigue tu cartera con cotizaciones en tiempo real y analiza cada activo con nuestro modelo propio.",
            },
            {
              icon: ShieldCheck,
              title: "Seguridad bancaria",
              desc: "Autenticación segura y cifrado de extremo a extremo. Tus datos protegidos con los estándares más exigentes.",
            },
            {
              icon: Landmark,
              title: "Planificación a largo plazo",
              desc: "Proyecciones de rentabilidad, análisis de deuda y simulación de hipotecas para planificar tu futuro.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= CALCULATORS HIGHLIGHT ======================= */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <Badge variant="secondary" className="mb-4">
              <Calculator className="mr-1.5 h-3.5 w-3.5" />
              Prueba sin registro
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Nuestras calculadoras,
              <br />
              a tu alcance
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No necesitas crear una cuenta para empezar. Accede gratis a todas nuestras
              calculadoras y hazte una idea de lo que es posible.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Interés compuesto con aportaciones periódicas",
                "Rentabilidad real de propiedades en alquiler",
                "Análisis fundamental de acciones con objetivo de precio",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/calculator/compound">Interés compuesto</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/calculator/realestate">Activos inmobiliarios</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/calculator/stocks">Acciones</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.1), transparent 60%)",
              }}
            />
            <div className="space-y-4">
              {[
                { label: "Interés compuesto", value: "10.000 € → 43.178 €", sub: "en 15 años al 8% anual" },
                { label: "Inmueble en alquiler", value: "8,7% ROI", sub: "rentabilidad neta anual" },
                { label: "Cartera de acciones", value: "+23,4%", sub: "potencial alcista del consenso" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border bg-background/80 p-5 shadow-sm backdrop-blur"
                >
                  <div className="text-sm font-medium text-muted-foreground">{card.label}</div>
                  <div className="mt-1 text-2xl font-bold tracking-tight">{card.value}</div>
                  <div className="mt-0.5 text-sm text-muted-foreground">{card.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FAQ ======================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Preguntas frecuentes</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Resolvemos las dudas más comunes antes de que empieces.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            {
              q: "¿Necesito una tarjeta de crédito para probar la app?",
              a: "No. El plan Estándar es gratuito y no pide tarjeta. Solo la necesitarás si decides pasar a Premium o Pro.",
            },
            {
              q: "¿Mis datos financieros están seguros?",
              a: "Sí. Usamos autenticación segura y cifrado de extremo a extremo. Tus datos no se comparten con terceros.",
            },
            {
              q: "¿Puedo usar las calculadoras sin registrarme?",
              a: "Sí. Todas nuestras calculadoras son de acceso libre y no requieren crear una cuenta.",
            },
            {
              q: "¿Qué diferencia hay entre Premium y Pro?",
              a: "Premium incluye el chat con IA y el análisis avanzado. Pro añade facturación anual con descuento y es la opción ideal para un uso intensivo.",
            },
            {
              q: "¿Puedo cancelar o cambiar de plan cuando quiera?",
              a: "Sí, sin permanencia ni costes ocultos. Puedes cambiar o cancelar tu plan en cualquier momento desde tu cuenta.",
            },
            {
              q: "¿Mis datos se sincronizan entre dispositivos?",
              a: "Sí. Al iniciar sesión, tu patrimonio, movimientos y configuración se sincronizan en todos tus dispositivos.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================= PRICING ======================= */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Planes</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Empieza gratis y escala cuando lo necesites.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Estándar</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {["Calculadoras ilimitadas", "Panel básico de patrimonio", "1 cuenta sincronizada", "Soporte por email"].map(
                  (f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ),
                )}
              </ul>
              <Button variant="outline" className="mt-8" asChild>
                <Link href="/sign-up">Comenzar gratis</Link>
              </Button>
            </div>

            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Premium</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">3,99€</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {[
                  "Todas las funciones Estándar",
                  "Chat con IA",
                  "Análisis y diagnóstico avanzado",
                  "Cartera en tiempo real",
                  "Informes y exportación",
                  "Soporte prioritario",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/sign-up">Empezar ahora</Link>
              </Button>
            </div>

            <div className="relative flex flex-col rounded-xl border-2 border-primary bg-card p-6 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Más popular</Badge>
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">2,50€</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Un solo pago anual de 29,99€
              </p>
              <span className="mt-2 inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Ahorra 18€ al año
              </span>
              <ul className="mt-6 flex-1 space-y-3">
                {[
                  "Todas las funciones Estándar",
                  "Chat con IA",
                  "Análisis y diagnóstico avanzado",
                  "Cartera en tiempo real",
                  "Informes y exportación",
                  "Soporte prioritario",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/sign-up">Empezar ahora</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FINAL CTA ======================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-border text-white shadow-2xl"
          style={{ background: "linear-gradient(135deg, hsl(222 47% 14%), hsl(221 83% 28%) 55%, hsl(214 80% 18%))" }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div
              className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl"
              style={{ animation: "blob-drift 16s ease-in-out infinite" }}
            />
            <div
              className="absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl"
              style={{ animation: "blob-drift 20s ease-in-out infinite reverse" }}
            />
            <div className="absolute -left-10 -top-16 h-96 w-96 rounded-full border border-white/10" />
            <div className="absolute -left-4 -top-36 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute inset-x-1/3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="absolute bottom-10 left-1/4 h-2 w-2 rounded-full bg-emerald-400/60" />
            <div className="absolute right-1/4 top-1/3 h-2 w-2 rounded-full bg-sky-400/60" />
            <div className="absolute left-1/5 bottom-1/3 h-1.5 w-1.5 rounded-full bg-violet-300/60" />
          </div>
          <div className="relative px-6 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Empieza a tomar mejores decisiones financieras hoy
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Únete a miles de usuarios que ya controlan su futuro financiero con MakeItRight.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="min-w-[220px] bg-white text-slate-950 hover:bg-white/90" asChild>
                <Link href="/sign-up">
                  Crear cuenta gratuita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LineChart className="h-4 w-4" />
                </div>
                <span className="font-bold tracking-tight">MakeItRight</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                Gestión financiera inteligente para personas y empresas.
              </p>
            </div>
            {[
              {
                title: "Producto",
                links: ["Calculadoras", "Análisis", "Inversiones", "Precios"],
              },
              {
                title: "Legal",
                links: ["Privacidad", "Términos", "Cookies", "Seguridad"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold">{col.title}</h4>
                <ul className="mt-4 space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MakeItRight. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cifrado de extremo a extremo</span>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}