"use client"

import Link from "next/link"
import {
  ArrowRight,
  TrendingUp,
  PieChart,
  Wallet,
  ShieldCheck,
  Calculator,
  LineChart,
  Landmark,
  Menu,
  X,
  CheckCircle2,
  ChevronDown,
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
import { LanguageSwitcher } from "@/components/language-switcher"

export default function Welcome() {
  const { t } = useLanguage()
  const { ready, userId, name, email, logout } = useAuth()
  const { settings } = useSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
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
            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {t("Product")}
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="grid w-[560px] grid-cols-2 gap-x-8 rounded-xl border border-border bg-background p-6 shadow-lg">
                  {/* Columna izquierda */}
                  <div className="space-y-5">
                    <Link href="/inicio" className="group/link block">
                      <span className="text-sm font-semibold text-foreground transition-colors group-hover/link:text-primary">{t("Home")}</span>
                    </Link>
                    <div>
                      <Link href="/analytics" className="group/link block">
                        <span className="text-sm font-semibold text-foreground transition-colors group-hover/link:text-primary">{t("Analytics")}</span>
                      </Link>
                      <div className="mt-2 space-y-1.5 border-l border-border pl-3">
                        <Link href="/analytics/income" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Revenue")}</Link>
                        <Link href="/analytics/expenses" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Expenses")}</Link>
                        <Link href="/analytics/savings" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Debt")}</Link>
                      </div>
                    </div>
                  </div>
                  {/* Columna derecha */}
                  <div className="space-y-5">
                    <Link href="/investment" className="group/link block">
                      <span className="text-sm font-semibold text-foreground transition-colors group-hover/link:text-primary">{t("Savings and Investment")}</span>
                    </Link>
                    <div>
                      <Link href="/calculator" className="group/link block">
                        <span className="text-sm font-semibold text-foreground transition-colors group-hover/link:text-primary">{t("Financial Calculators")}</span>
                      </Link>
                      <div className="mt-2 space-y-1.5 border-l border-border pl-3">
                        <Link href="/calculator/compound" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Compound Interest")}</Link>
                        <Link href="/calculator/realestate" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Real Estate Assets")}</Link>
                        <Link href="/calculator/stocks" className="block text-sm text-muted-foreground transition-colors hover:text-foreground">{t("Stocks")}</Link>
                      </div>
                    </div>
                    <Link href="/chat" className="group/link block">
                      <span className="text-sm font-semibold text-foreground transition-colors group-hover/link:text-primary">{t("AI chat")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {[
              { label: t("Features"), href: "#features" },
              { label: t("Analytics"), href: "/analytics" },
              { label: t("Blog"), href: "#features" },
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
                  <Link href="/inicio">{t("Go to app")}</Link>
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
                {t("Product")}
              </a>
              <div className="flex gap-3 pt-2">
                {signedIn ? (
                  <>
                    <Button size="sm" className="flex-1" asChild>
                      <Link href="/inicio">{t("Go to app")}</Link>
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
              {t("The trusted financial platform")}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {t("Take control of your finances.")}
              <br />
              {t("Decide with")} <span className="text-primary/70">{t("intelligence")}</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              {t("Hero intro")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="min-w-[220px]" asChild>
                <Link href="/inicio">
                  {t("Start for free")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[220px]" asChild>
                <Link href="/calculator">
                  {t("View calculators")}
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("14-day free trial · No credit card required")}
            </p>
          </div>
        </div>
      </section>

      {/* ======================= FEATURES ======================= */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("All your money, under control")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("Tools that were once reserved for professional financial advisors.")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: t("Track your net worth"),
              desc: t("Track your net worth desc"),
            },
            {
              icon: Calculator,
              title: t("Financial Calculators"),
              desc: t("Financial calculators desc"),
            },
            {
              icon: TrendingUp,
              title: t("Advanced analytics"),
              desc: t("Advanced analytics desc"),
            },
            {
              icon: PieChart,
              title: t("Smart investing"),
              desc: t("Smart investing desc"),
            },
            {
              icon: ShieldCheck,
              title: t("Bank-grade security"),
              desc: t("Bank-grade security desc"),
            },
            {
              icon: Landmark,
              title: t("Long-term planning"),
              desc: t("Long-term planning desc"),
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
              {t("Try without signing up")}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("Our calculators, at your fingertips")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("Calculators highlight intro")}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                t("Compound interest with periodic contributions"),
                t("Real rental yield of investment properties"),
                t("Fundamental stock analysis with a price target"),
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" asChild>
                <Link href="/calculator/compound">{t("Compound Interest")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/calculator/realestate">{t("Real Estate Assets")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/calculator/stocks">{t("Stocks")}</Link>
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
                { label: t("Compound Interest"), value: "10.000 € → 43.178 €", sub: t("in 15 years at 8% annual") },
                { label: t("Rental property"), value: "8,7% ROI", sub: t("net annual yield") },
                { label: t("Stock portfolio"), value: "+23,4%", sub: t("consensus upside potential") },
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
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("Frequently asked questions")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("We answer the most common questions before you get started.")}
          </p>
        </div>
        <div className="mt-10 space-y-3">
          {[
            {
              q: t("What is MakeItRight?"),
              a: t("What is MakeItRight? answer"),
            },
            {
              q: t("Who is MakeItRight designed for?"),
              a: t("Who is MakeItRight designed for? answer"),
            },
            {
              q: t("Is my financial data safe?"),
              a: t("Is my financial data safe? answer"),
            },
            {
              q: t("Can I use the calculators without signing up?"),
              a: t("Can I use the calculators without signing up? answer"),
            },
            {
              q: t("Can I cancel or change plans anytime?"),
              a: t("Can I cancel or change plans anytime? answer"),
            },
            {
              q: t("Is my data synced across devices?"),
              a: t("Is my data synced across devices? answer"),
            },
            {
              q: t("Do I need a credit card to try the app?"),
              a: t("Do I need a credit card to try the app? answer"),
            },
          ].map(({ q, a }, i) => (
            <div key={q} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium">{q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-border/60 px-5 pb-4 pt-3 text-sm leading-relaxed text-muted-foreground">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ======================= PRICING ======================= */}
      <section id="planes" className="border-y border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("Plans")}</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("Start for free and scale when you need it.")}
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{t("Standard")}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground">{t("/month")}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {[t("Unlimited calculators"), t("Basic net worth dashboard"), t("1 synced account"), t("Email support")].map(
                  (f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ),
                )}
              </ul>
              <Button variant="outline" className="mt-8" asChild>
                <Link href="/sign-up">{t("Start free")}</Link>
              </Button>
            </div>

            <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{t("Premium")}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">3,99€</span>
                <span className="text-muted-foreground">{t("/month")}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {[
                  t("All Standard features"),
                  t("AI chat"),
                  t("Advanced analytics and diagnosis"),
                  t("Real-time portfolio"),
                  t("Reports and exports"),
                  t("Priority support"),
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/sign-up">{t("Start now")}</Link>
              </Button>
            </div>

            <div className="relative flex flex-col rounded-xl border-2 border-primary bg-card p-6 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>{t("Most popular")}</Badge>
              </div>
              <h3 className="text-lg font-semibold">{t("Pro")}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">2,50€</span>
                <span className="text-muted-foreground">{t("/month")}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("A single annual payment of 29.99€")}
              </p>
              <span className="mt-2 inline-flex w-fit items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t("Save €18 per year")}
              </span>
              <ul className="mt-6 flex-1 space-y-3">
                {[
                  t("All Standard features"),
                  t("AI chat"),
                  t("Advanced analytics and diagnosis"),
                  t("Real-time portfolio"),
                  t("Reports and exports"),
                  t("Priority support"),
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8" asChild>
                <Link href="/sign-up">{t("Start now")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FINAL CTA ======================= */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-border text-white shadow-2xl"
          style={{ background: "linear-gradient(135deg, hsl(222 47% 6%), hsl(221 70% 13%) 55%, hsl(218 72% 5%))" }}
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
              {t("Start making better financial decisions today")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              {t("Join thousands of users who already take control of their financial future with MakeItRight.")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="min-w-[220px] bg-white text-slate-950 hover:bg-white/90" asChild>
                <Link href="/sign-up">
                  {t("Create free account")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MakeItRight. {t("All rights reserved.")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/aviso-legal" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t("Legal Notice")}
              </Link>
              <Link href="/privacidad" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t("Privacy Policy")}
              </Link>
              <Link href="/terminos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t("Terms of Service")}
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t("Cookie Policy")}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}