export type Category = "AC" | "ANC" | "PC" | "PNC"

export interface Item {
  id: string
  name: string
  value: number
  interest: number
  dueDate?: string
  category: Category
}

export interface Derived {
  AC: number
  ANC: number
  PC: number
  PNC: number
  activoTotal: number
  pasivoTotal: number
  patrimonioNeto: number
  capitalCirculante: number
  liquidez: number | null
  solvencia: number | null
  endeudamiento: number | null
  pesoANC: number | null
  coberturaPC: number | null
  annualDebtService: number
  capacidadDePago: number | null
}

export interface SimulatorState {
  incomeLoss: number // 0 | 0.2 | 0.5
  rateRise: number // 0 | 0.01 | 0.02
  unexpectedExpense: number // euros
}

export const CATEGORY_LABELS: Record<Category, string> = {
  AC: "Activo corriente",
  ANC: "Activo no corriente",
  PC: "Pasivo corriente",
  PNC: "Pasivo no corriente",
}

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  AC: "Efectivo, cuentas, depósitos, inversiones líquidas.",
  ANC: "Vivienda, vehículos, inversiones no líquidas, otros.",
  PC: "Tarjetas y deudas con vencimiento ≤ 12 meses.",
  PNC: "Hipoteca y préstamos con vencimiento > 12 meses.",
}

export function sumBy(items: Item[], cat: Category): number {
  return items
    .filter((i) => i.category === cat)
    .reduce((acc, i) => acc + (Number.isFinite(i.value) ? i.value : 0), 0)
}

export function computeDerived(items: Item[]): Derived {
  const AC = sumBy(items, "AC")
  const ANC = sumBy(items, "ANC")
  const PC = sumBy(items, "PC")
  const PNC = sumBy(items, "PNC")
  const activoTotal = AC + ANC
  const pasivoTotal = PC + PNC
  const patrimonioNeto = activoTotal - pasivoTotal
  const capitalCirculante = AC - PC

  const annualDebtService = items
    .filter((i) => i.category === "PC" || i.category === "PNC")
    .reduce((acc, i) => acc + (Number.isFinite(i.value) ? i.value : 0) * ((Number.isFinite(i.interest) ? i.interest : 0) / 100), 0)

  return {
    AC,
    ANC,
    PC,
    PNC,
    activoTotal,
    pasivoTotal,
    patrimonioNeto,
    capitalCirculante,
    liquidez: PC > 0 ? AC / PC : null,
    solvencia: pasivoTotal > 0 ? activoTotal / pasivoTotal : null,
    endeudamiento: activoTotal > 0 ? pasivoTotal / activoTotal : null,
    pesoANC: activoTotal > 0 ? ANC / activoTotal : null,
    coberturaPC: PC > 0 ? AC / PC : null,
    annualDebtService,
    capacidadDePago: annualDebtService > 0 ? AC / (annualDebtService / 12) : null,
  }
}

// Aplica el escenario del simulador a los valores base.
export function applyScenario(base: Derived, items: Item[], sim: SimulatorState): Derived {
  const AC = base.AC - (Number.isFinite(sim.unexpectedExpense) ? sim.unexpectedExpense : 0)
  const extraAnnualInterest = items
    .filter((i) => i.category === "PC" || i.category === "PNC")
    .reduce(
      (acc, i) => acc + (Number.isFinite(i.value) ? i.value : 0) * sim.rateRise,
      0,
    )
  const pasivoTotal = base.pasivoTotal + extraAnnualInterest
  const activoTotal = AC + base.ANC
  const annualDebtService = items
    .filter((i) => i.category === "PC" || i.category === "PNC")
    .reduce(
      (acc, i) =>
        acc + (Number.isFinite(i.value) ? i.value : 0) * ((Number.isFinite(i.interest) ? i.interest : 0) / 100 + sim.rateRise),
      0,
    )
  const monthlyDebtService = annualDebtService / 12
  const capacidadDePago =
    monthlyDebtService > 0 ? (AC / monthlyDebtService) * (1 - sim.incomeLoss) : null

  return {
    AC,
    ANC: base.ANC,
    PC: base.PC,
    PNC: base.PNC,
    activoTotal,
    pasivoTotal,
    patrimonioNeto: activoTotal - pasivoTotal,
    capitalCirculante: AC - base.PC,
    liquidez: base.PC > 0 ? AC / base.PC : null,
    solvencia: pasivoTotal > 0 ? activoTotal / pasivoTotal : null,
    endeudamiento: activoTotal > 0 ? pasivoTotal / activoTotal : null,
    pesoANC: activoTotal > 0 ? base.ANC / activoTotal : null,
    coberturaPC: base.PC > 0 ? AC / base.PC : null,
    annualDebtService,
    capacidadDePago,
  }
}

export type Severity = "critical" | "warning" | "ok"

export interface DiagnosisFlag {
  key: string
  severity: Severity
  title: string
  detail: string
}

export function diagnose(base: Derived, scenario: Derived, sim: SimulatorState): DiagnosisFlag[] {
  const flags: DiagnosisFlag[] = []

  if (scenario.patrimonioNeto <= 0) {
    flags.push({
      key: "pn-negative",
      severity: "critical",
      title: "Patrimonio neto negativo",
      detail: `Tu patrimonio neto es ${fmtEuro(scenario.patrimonioNeto)}. Tienes más deudas que activos.`,
    })
  } else if (scenario.patrimonioNeto < base.activoTotal * 0.1) {
    flags.push({
      key: "pn-low",
      severity: "warning",
      title: "Patrimonio neto bajo",
      detail: `El patrimonio neto (${fmtEuro(scenario.patrimonioNeto)}) es inferior al 10% de tu activo total.`,
    })
  }

  if (base.PC > 0) {
    if (scenario.liquidez !== null && scenario.liquidez < 1) {
      flags.push({
        key: "liquidity",
        severity: "critical",
        title: "Liquidez insuficiente",
        detail: `La liquidez es ${scenario.liquidez.toFixed(2)} (< 1). No tienes suficiente activo corriente para cubrir el pasivo corriente.`,
      })
    } else if (scenario.liquidez !== null && scenario.liquidez < 1.5) {
      flags.push({
        key: "liquidity",
        severity: "warning",
        title: "Liquidez ajustada",
        detail: `La liquidez es ${scenario.liquidez.toFixed(2)}. Un margen inferior a 1,5 puede ser incómodo ante imprevistos.`,
      })
    }
  }

  const shortTermDebt = items
    .filter((i) => (i.category === "PC" || i.category === "PNC") && i.dueDate)
    .filter((i) => {
      const days = daysUntil(i.dueDate)
      return days !== null && days >= 0 && days <= 90
    })
    .reduce((acc, i) => acc + (Number.isFinite(i.value) ? i.value : 0), 0)

  if (shortTermDebt > 0 && scenario.AC < shortTermDebt) {
    flags.push({
      key: "short-term-tension",
      severity: "critical",
      title: "Tensión a corto plazo por vencimientos",
      detail: `Tienes ${fmtEuro(shortTermDebt)} de deuda venciendo en los próximos 90 días y solo ${fmtEuro(scenario.AC)} líquidos.`,
    })
  } else if (shortTermDebt > 0 && scenario.AC < shortTermDebt * 1.5) {
    flags.push({
      key: "short-term-tension",
      severity: "warning",
      title: "Concentración de vencimientos próximos",
      detail: `${fmtEuro(shortTermDebt)} vencen en menos de 90 días; tu liquidez (${fmtEuro(scenario.AC)}) apenas los cubre.`,
    })
  }

  if (scenario.endeudamiento !== null && scenario.endeudamiento > 0.8) {
    flags.push({
      key: "debt",
      severity: "critical",
      title: "Exceso de deuda",
      detail: `El endeudamiento es ${pct(scenario.endeudamiento)}. Más del 80% de tu activo está financiado con deuda.`,
    })
  } else if (scenario.endeudamiento !== null && scenario.endeudamiento > 0.6) {
    flags.push({
      key: "debt",
      severity: "warning",
      title: "Nivel de deuda elevado",
      detail: `El endeudamiento es ${pct(scenario.endeudamiento)}. Vigila tu capacidad de endeudamiento.`,
    })
  }

  if (scenario.pesoANC !== null && scenario.pesoANC > 0.7) {
    flags.push({
      key: "anc",
      severity: "warning",
      title: "Exceso de activos no corrientes",
      detail: `El ${pct(scenario.pesoANC)} de tu activo es no corriente. Tu liquidez depende de vender estos activos.`,
    })
  }

  if (base.PC > 0 && sim.incomeLoss > 0 && scenario.capacidadDePago !== null && scenario.capacidadDePago < 6) {
    flags.push({
      key: "vuln-income",
      severity: "warning",
      title: "Vulnerabilidad ante pérdida de ingresos",
      detail: `Con −${pct(sim.incomeLoss)} de ingresos, tu capacidad de pago cae a ${scenario.capacidadDePago.toFixed(1)} meses de servicio de deuda.`,
    })
  }

  if (base.PC > 0 && sim.rateRise > 0 && scenario.capacidadDePago !== null && scenario.capacidadDePago < 6) {
    flags.push({
      key: "vuln-rates",
      severity: "warning",
      title: "Vulnerabilidad ante subida de tipos",
      detail: `Con +${(sim.rateRise * 100).toFixed(0)}% de tipos, tu capacidad de pago cae a ${scenario.capacidadDePago.toFixed(1)} meses.`,
    })
  }

  if (flags.length === 0) {
    flags.push({
      key: "ok",
      severity: "ok",
      title: "Sin alertas críticas",
      detail: "Tus ratios indican una situación equilibrada con los datos actuales.",
    })
  }

  return flags
}

export interface Recommendation {
  priority: number
  text: string
}

export function recommend(base: Derived, scenario: Derived, items: Item[], sim: SimulatorState): Recommendation[] {
  const recs: Recommendation[] = []

  // 1) Liquidez: comparar vencimientos de deuda a corto plazo vs liquidez disponible.
  if (base.PC > 0 && scenario.liquidez !== null && scenario.liquidez < 1.5) {
    const shortDebt = items
      .filter((i) => i.category === "PC" && i.dueDate)
      .reduce((acc, i) => acc + i.value, 0)
    if (shortDebt > 0 && scenario.AC < shortDebt) {
      recs.push({
        priority: 1,
        text: `Liquidez baja (${scenario.liquidez.toFixed(2)}): tienes ${fmtEuro(shortDebt)} de deuda venciendo a corto plazo y solo ${fmtEuro(scenario.AC)} líquidos. Prioriza reducir o refinanciar ${fmtEuro(shortDebt - scenario.AC)} de esa deuda.`,
      })
    } else {
      const gap = base.PC - scenario.AC
      recs.push({
        priority: 1,
        text: `Liquidez ajustada (${scenario.liquidez.toFixed(2)}): aumenta tu activo corriente en ${fmtEuro(Math.max(0, gap))} o refinancia deuda a corto plazo para superar 1,5x.`,
      })
    }
  }

  // 2) Endeudamiento alto pero patrimonio sano -> ahorro.
  if (
    scenario.endeudamiento !== null &&
    scenario.endeudamiento > 0.6 &&
    scenario.patrimonioNeto > 0
  ) {
    recs.push({
      priority: 2,
      text: `Endeudamiento del ${pct(scenario.endeudamiento)}: aumenta tu ahorro mensual un 5% para reducir pasivo y bajar el ratio hacia el 50%.`,
    })
  }

  // 3) Exceso de ANC.
  if (scenario.pesoANC !== null && scenario.pesoANC > 0.7) {
    const liquidTarget = scenario.activoTotal * 0.3 - scenario.AC
    recs.push({
      priority: 3,
      text: `Los activos no corrientes son el ${pct(scenario.pesoANC)} del total: considera aumentar activos líquidos en ${fmtEuro(Math.max(0, liquidTarget))} para mejorar tu liquidez.`,
    })
  }

  // 4) Concentración de vencimientos próximos.
  const concentration = detectConcentration(items)
  if (concentration) {
    recs.push({
      priority: recs.length + 1,
      text: `Concentración de pagos: ${fmtEuro(concentration.amount)} vencen en ${concentration.monthLabel}. Anticipa liquidez para ese mes.`,
    })
  }

  // 5) Gasto imprevisto / pérdida de ingresos.
  if (sim.unexpectedExpense > 0 && scenario.AC < 0) {
    recs.push({
      priority: recs.length + 1,
      text: `El gasto imprevisto de ${fmtEuro(sim.unexpectedExpense)} deja tu liquidez en negativo. Reconstituye ${fmtEuro(-scenario.AC)} de efectivo cuanto antes.`,
    })
  }

  const uniq = Array.from(new Map(recs.map((r) => [r.text, r])).values())
  return uniq.sort((a, b) => a.priority - b.priority).slice(0, 3)
}

export interface Concentration {
  monthLabel: string
  amount: number
}

export function detectConcentration(items: Item[]): Concentration | null {
  const now = new Date()
  const map = new Map<string, number>()
  for (const i of items) {
    if (!i.dueDate) continue
    const d = new Date(i.dueDate)
    if (Number.isNaN(d.getTime())) continue
    const months = (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth())
    if (months < 0 || months > 12) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    map.set(key, (map.get(key) ?? 0) + (Number.isFinite(i.value) ? i.value : 0))
  }
  let worst: Concentration | null = null
  for (const [key, amount] of map.entries()) {
    const [y, m] = key.split("-")
    const label = `${["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][Number(m) - 1]} ${y}`
    if (!worst || amount > worst.amount) worst = { monthLabel: label, amount }
  }
  return worst && worst.amount > 0 ? worst : null
}

export interface ProjectionPoint {
  month: number
  patrimonioNeto: number
  deuda: number
  liquidez: number | null
}

export function project(
  base: Derived,
  scenario: Derived,
  sim: SimulatorState,
  monthlySavings: number,
  months: number,
): ProjectionPoint[] {
  const effectiveSavings = (Number.isFinite(monthlySavings) ? monthlySavings : 0) * (1 - sim.incomeLoss)
  const points: ProjectionPoint[] = []
  let pn = scenario.patrimonioNeto
  let ac = scenario.AC
  const pc = scenario.PC
  for (let m = 0; m <= months; m++) {
    points.push({
      month: m,
      patrimonioNeto: Math.round(pn),
      deuda: Math.round(scenario.pasivoTotal),
      liquidez: pc > 0 ? ac / pc : null,
    })
    pn += effectiveSavings
    ac += effectiveSavings
  }
  return points
}

export type RiskLevel = "green" | "amber" | "red"

export function riskLevel(flags: DiagnosisFlag[]): RiskLevel {
  if (flags.some((f) => f.severity === "critical")) return "red"
  if (flags.some((f) => f.severity === "warning")) return "amber"
  return "green"
}

export const ND = "N/D"

export function fmtEuro(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return ND
  return v.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  })
}

export function pct(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return ND
  return `${(v * 100).toFixed(1)}%`
}

export function fmtNum(v: number | null, digits = 2): string {
  if (v === null || !Number.isFinite(v)) return ND
  return v.toFixed(digits)
}

export function fmtDelta(v: number | null, digits = 2): string {
  if (v === null || !Number.isFinite(v)) return ND
  const sign = v > 0 ? "+" : ""
  return `${sign}${v.toFixed(digits)}`
}

export function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  const diff = d.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
