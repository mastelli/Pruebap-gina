export type AssetType = "current" | "noncurrent"
export type LiabilityType = "current" | "noncurrent"

export interface BalanceItem {
  id: string
  name: string
  category: string
  subcategory?: string
  value: number
  type: AssetType | LiabilityType
  currency?: string
  notes?: string
  tags?: string[]
  acquisitionDate?: string
  valuationDate?: string
  initialValue?: number
  interestRate?: number
  monthlyPayment?: number
  startDate?: string
  maturityDate?: string
  loanType?: string
  outstandingCapital?: number
}

export interface CashFlowEntry {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  date: string
  notes?: string
}

export interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  category: string
}

export interface BalanceSnapshot {
  id: string
  date: string
  assets: BalanceItem[]
  liabilities: BalanceItem[]
  cashFlow: CashFlowEntry[]
  goals: FinancialGoal[]
  essentialMonthlyExpenses?: number
}

export interface DerivedBalance {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  currentAssets: number
  nonCurrentAssets: number
  currentLiabilities: number
  nonCurrentLiabilities: number
  liquidityRatio: number
  immediateLiquidityRatio: number
  solvencyRatio: number
  debtRatio: number
  debtToEquityRatio: number
  liquidAssetPercentage: number
  housingWeight: number
  monthlyCashFlow: number
  emergencyFundMonths: number
  essentialMonthlyExpenses: number
}

export const ASSET_CURRENT_CATEGORIES = [
  "Cash",
  "Checking Account",
  "Savings Account",
  "Short-term Deposits",
  "Liquid Investments",
  "Money Market Funds",
  "Stocks/ETFs",
  "Cryptocurrencies",
  "Other Current Assets",
]

export const ASSET_NONCURRENT_CATEGORIES = [
  "Primary Residence",
  "Second Home",
  "Other Real Estate",
  "Vehicles",
  "Land",
  "Long-term Investments",
  "Investment Funds",
  "Pension Plans",
  "Company Stakes",
  "Other Non-current Assets",
]

export const LIABILITY_CURRENT_CATEGORIES = [
  "Credit Card",
  "Near-due Loans",
  "Pending Invoices",
  "Pending Taxes",
  "Other Short-term Debts",
]

export const LIABILITY_NONCURRENT_CATEGORIES = [
  "Mortgage",
  "Personal Loan",
  "Vehicle Loan",
  "Student Loans",
  "Other Loans",
  "Other Long-term Obligations",
]

export const CATEGORY_LABELS: Record<string, string> = {
  Cash: "Efectivo",
  "Checking Account": "Cuenta corriente",
  "Savings Account": "Cuenta de ahorro",
  "Short-term Deposits": "Depósitos a corto plazo",
  "Liquid Investments": "Inversiones líquidas",
  "Money Market Funds": "Fondos monetarios",
  "Stocks/ETFs": "Acciones/ETF",
  Cryptocurrencies: "Criptomonedas",
  "Other Current Assets": "Otros activos corrientes",
  "Primary Residence": "Vivienda habitual",
  "Second Home": "Segunda vivienda",
  "Other Real Estate": "Otros inmuebles",
  Vehicles: "Vehículos",
  Land: "Terrenos",
  "Long-term Investments": "Inversiones a largo plazo",
  "Investment Funds": "Fondos de inversión",
  "Pension Plans": "Planes de pensiones",
  "Company Stakes": "Participaciones en empresas",
  "Other Non-current Assets": "Otros activos no corrientes",
  "Credit Card": "Tarjeta de crédito",
  "Near-due Loans": "Préstamos con vencimiento próximo",
  "Pending Invoices": "Facturas pendientes",
  "Pending Taxes": "Impuestos pendientes",
  "Other Short-term Debts": "Otras deudas a corto plazo",
  Mortgage: "Hipoteca",
  "Personal Loan": "Préstamo personal",
  "Vehicle Loan": "Préstamo de vehículo",
  "Student Loans": "Préstamos estudiantiles",
  "Other Loans": "Otros préstamos",
  "Other Long-term Obligations": "Otras obligaciones a largo plazo",
  Housing: "Vivienda",
  Food: "Alimentación",
  Transport: "Transporte",
  Services: "Servicios",
  Leisure: "Ocio",
  Taxes: "Impuestos",
  Insurance: "Seguros",
  "Other Expenses": "Otros gastos",
  Salary: "Salario",
  Freelance: "Freelance",
  Rent: "Alquileres",
  Dividends: "Dividendos",
  Interests: "Intereses",
  "Other Income": "Otros ingresos",
}

export const CASHFLOW_INCOME_CATEGORIES = ["Salary", "Freelance", "Rent", "Dividends", "Interests", "Other Income"]
export const CASHFLOW_EXPENSE_CATEGORIES = ["Housing", "Food", "Transport", "Services", "Leisure", "Taxes", "Insurance", "Other Expenses"]

export function fmtEuro(v: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)
}

export function fmtEuroFull(v: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(v)
}

export function pct(v: number): string {
  if (!isFinite(v)) return "0%"
  return `${v.toFixed(1)}%`
}

export function fmtNum(v: number): string {
  return new Intl.NumberFormat("es-ES").format(v)
}

export function safeDiv(n: number, d: number): number {
  if (d === 0) return 0
  return n / d
}

export function currentRatio(ca: number, cl: number): number {
  return safeDiv(ca, cl)
}

export function solvencyRatio(ta: number, tl: number): number {
  return safeDiv(ta, tl)
}

export function debtRatio(tl: number, ta: number): number {
  return safeDiv(tl, ta) * 100
}

export function debtToEquityRatio(tl: number, nw: number): number {
  return safeDiv(tl, nw)
}

export function liquidAssetPercentage(liq: number, ta: number): number {
  return safeDiv(liq, ta) * 100
}

export function housingWeight(housing: number, ta: number): number {
  return safeDiv(housing, ta) * 100
}

export function emergencyFundCoverage(liq: number, monthlyExpenses: number): number {
  return safeDiv(liq, monthlyExpenses)
}

export function getLiquidAssets(items: BalanceItem[]): number {
  const liquidCategories = new Set(["Cash", "Checking Account", "Savings Account", "Short-term Deposits", "Liquid Investments", "Money Market Funds"])
  return items
    .filter((i) => i.type === "current" && liquidCategories.has(i.category))
    .reduce((s, i) => s + i.value, 0)
}

export function getHousingAssets(items: BalanceItem[]): number {
  const housingCategories = new Set(["Primary Residence", "Second Home", "Other Real Estate", "Land"])
  return items.filter((i) => i.type === "noncurrent" && housingCategories.has(i.category)).reduce((s, i) => s + i.value, 0)
}

export function computeDerived(
  assets: BalanceItem[],
  liabilities: BalanceItem[],
  cashFlow: CashFlowEntry[],
  essentialMonthlyExpenses?: number,
): DerivedBalance {
  const totalAssets = assets.reduce((s, i) => s + i.value, 0)
  const totalLiabilities = liabilities.reduce((s, i) => s + i.value, 0)
  const netWorth = totalAssets - totalLiabilities

  const currentAssets = assets.filter((i) => i.type === "current").reduce((s, i) => s + i.value, 0)
  const nonCurrentAssets = assets.filter((i) => i.type === "noncurrent").reduce((s, i) => s + i.value, 0)
  const currentLiabilities = liabilities.filter((i) => i.type === "current").reduce((s, i) => s + i.value, 0)
  const nonCurrentLiabilities = liabilities.filter((i) => i.type === "noncurrent").reduce((s, i) => s + i.value, 0)

  const liquidAssets = getLiquidAssets(assets)
  const housing = getHousingAssets(assets)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)
  const monthCashFlow = cashFlow.filter((e) => e.date >= monthStart && e.date <= monthEnd)
  const monthlyIncome = monthCashFlow.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0)
  const monthlyExpenses = monthCashFlow.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0)
  const monthlyCashFlow = monthlyIncome - monthlyExpenses

  const essExpenses = essentialMonthlyExpenses ?? monthlyExpenses

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    currentAssets,
    nonCurrentAssets,
    currentLiabilities,
    nonCurrentLiabilities,
    liquidityRatio: currentRatio(currentAssets, currentLiabilities),
    immediateLiquidityRatio: currentRatio(liquidAssets, currentLiabilities),
    solvencyRatio: solvencyRatio(totalAssets, totalLiabilities),
    debtRatio: debtRatio(totalLiabilities, totalAssets),
    debtToEquityRatio: debtToEquityRatio(totalLiabilities, netWorth),
    liquidAssetPercentage: liquidAssetPercentage(liquidAssets, totalAssets),
    housingWeight: housingWeight(housing, totalAssets),
    monthlyCashFlow,
    emergencyFundMonths: emergencyFundCoverage(liquidAssets, essExpenses),
    essentialMonthlyExpenses: essExpenses,
  }
}

export function getRatioHealth(ratio: number, thresholds: { good: number; warn: number }, inverse = false): "good" | "warning" | "critical" {
  if (inverse) {
    if (ratio <= thresholds.good) return "good"
    if (ratio <= thresholds.warn) return "warning"
    return "critical"
  }
  if (ratio >= thresholds.good) return "good"
  if (ratio >= thresholds.warn) return "warning"
  return "critical"
}

export interface RatioInfo {
  label: string
  value: number
  formattedValue: string
  description: string
  health: "good" | "warning" | "critical"
}

export function computeRatios(d: DerivedBalance): RatioInfo[] {
  return [
    {
      label: "Liquidez corriente",
      value: d.liquidityRatio,
      formattedValue: d.liquidityRatio.toFixed(2),
      description: "Capacidad para hacer frente a obligaciones de corto plazo con activos corrientes.",
      health: getRatioHealth(d.liquidityRatio, { good: 1.5, warn: 1.0 }),
    },
    {
      label: "Liquidez inmediata",
      value: d.immediateLiquidityRatio,
      formattedValue: d.immediateLiquidityRatio.toFixed(2),
      description: "Capacidad para cubrir deudas a corto plazo solo con activos líquidos.",
      health: getRatioHealth(d.immediateLiquidityRatio, { good: 1.0, warn: 0.5 }),
    },
    {
      label: "Solvencia",
      value: d.solvencyRatio,
      formattedValue: d.solvencyRatio.toFixed(2),
      description: "Capacidad global para cubrir todas las deudas con los activos disponibles.",
      health: getRatioHealth(d.solvencyRatio, { good: 2.0, warn: 1.0 }),
    },
    {
      label: "Endeudamiento",
      value: d.debtRatio,
      formattedValue: pct(d.debtRatio),
      description: "Proporción de activos financiada mediante deuda.",
      health: getRatioHealth(d.debtRatio, { good: 30, warn: 50 }, true),
    },
    {
      label: "Deuda / Patrimonio",
      value: d.debtToEquityRatio,
      formattedValue: d.debtToEquityRatio.toFixed(2),
      description: "Relación entre el total de deudas y el patrimonio neto.",
      health: getRatioHealth(d.debtToEquityRatio, { good: 0.5, warn: 1.0 }, true),
    },
    {
      label: "Activos líquidos",
      value: d.liquidAssetPercentage,
      formattedValue: pct(d.liquidAssetPercentage),
      description: "Porcentaje del total de activos que se encuentra en forma líquida.",
      health: getRatioHealth(d.liquidAssetPercentage, { good: 20, warn: 10 }),
    },
    {
      label: "Peso de la vivienda",
      value: d.housingWeight,
      formattedValue: pct(d.housingWeight),
      description: "Porcentaje del patrimonio concentrado en vivienda e inmuebles.",
      health: getRatioHealth(d.housingWeight, { good: 40, warn: 60 }, true),
    },
  ]
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function getDemoData(): BalanceSnapshot {
  const now = new Date().toISOString().slice(0, 10)
  return {
    id: "demo",
    date: now,
    assets: [
      { id: generateId(), name: "Efectivo", category: "Cash", value: 1000, type: "current", valuationDate: now },
      { id: generateId(), name: "Cuenta corriente", category: "Checking Account", value: 15000, type: "current", valuationDate: now },
      { id: generateId(), name: "Cuenta de ahorro", category: "Savings Account", value: 8000, type: "current", valuationDate: now },
      { id: generateId(), name: "Inversiones líquidas", category: "Liquid Investments", value: 20000, type: "current", valuationDate: now },
      { id: generateId(), name: "Acciones/ETF", category: "Stocks/ETFs", value: 12000, type: "current", valuationDate: now },
      { id: generateId(), name: "Vivienda habitual", category: "Primary Residence", value: 300000, type: "noncurrent", valuationDate: now },
      { id: generateId(), name: "Vehículo", category: "Vehicles", value: 20000, type: "noncurrent", valuationDate: now },
      { id: generateId(), name: "Inversiones largo plazo", category: "Long-term Investments", value: 40000, type: "noncurrent", valuationDate: now },
      { id: generateId(), name: "Plan de pensiones", category: "Pension Plans", value: 25000, type: "noncurrent", valuationDate: now },
    ],
    liabilities: [
      { id: generateId(), name: "Tarjeta de crédito", category: "Credit Card", value: 1500, type: "current", valuationDate: now },
      { id: generateId(), name: "Hipoteca", category: "Mortgage", value: 180000, type: "noncurrent", interestRate: 2.5, monthlyPayment: 900, outstandingCapital: 180000, type: "noncurrent", valuationDate: now },
      { id: generateId(), name: "Préstamo vehículo", category: "Vehicle Loan", value: 8000, type: "noncurrent", interestRate: 4.0, monthlyPayment: 250, outstandingCapital: 8000, valuationDate: now },
    ],
    cashFlow: [
      { id: generateId(), type: "income", category: "Salary", amount: 3000, date: now },
      { id: generateId(), type: "income", category: "Dividends", amount: 200, date: now },
      { id: generateId(), type: "expense", category: "Housing", amount: 900, date: now },
      { id: generateId(), type: "expense", category: "Food", amount: 400, date: now },
      { id: generateId(), type: "expense", category: "Transport", amount: 150, date: now },
      { id: generateId(), type: "expense", category: "Services", amount: 120, date: now },
      { id: generateId(), type: "expense", category: "Leisure", amount: 200, date: now },
      { id: generateId(), type: "expense", category: "Insurance", amount: 80, date: now },
      { id: generateId(), type: "expense", category: "Taxes", amount: 600, date: now },
    ],
    goals: [
      { id: generateId(), name: "Fondo de emergencia", targetAmount: 15000, currentAmount: 8000, category: "Emergency Fund" },
      { id: generateId(), name: "Segunda vivienda", targetAmount: 100000, currentAmount: 12000, category: "Real Estate" },
    ],
    essentialMonthlyExpenses: 2000,
  }
}
