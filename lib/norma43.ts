export interface Norma43Expense {
  date: string
  concept: string
  reference: string
  amount: number
}

const negativeDigitMap: Record<string, string> = {
  N: "0",
  O: "1",
  P: "2",
  Q: "3",
  R: "4",
  S: "5",
  T: "6",
  U: "7",
  V: "8",
  W: "9",
}

function decodeAmount(raw: string): number {
  if (raw.length === 0) return 0
  const lastChar = raw[raw.length - 1].toUpperCase()
  let digits = raw
  let negative = false

  if (/[A-Z]/.test(lastChar)) {
    const mapped = negativeDigitMap[lastChar]
    if (mapped === undefined) return Number.NaN
    negative = true
    digits = raw.slice(0, -1) + mapped
  }

  if (!/^\d+$/.test(digits)) return Number.NaN

  const value = Number.parseInt(digits, 10) / 100
  return negative ? -value : value
}

function formatDate(yymmdd: string): string {
  if (!/^\d{6}$/.test(yymmdd)) return ""
  return `20${yymmdd.slice(0, 2)}-${yymmdd.slice(2, 4)}-${yymmdd.slice(4, 6)}`
}

export function parseNorma43Expenses(content: string): Norma43Expense[] {
  const expenses: Norma43Expense[] = []
  const lines = content.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "")

    if (!line.startsWith("22")) continue

    const operationDate = line.slice(6, 12)
    const concept = line.slice(18, 30).trim()
    const amount = decodeAmount(line.slice(32, 42))
    const reference = line.slice(44, 90).trim()

    if (Number.isNaN(amount)) continue

    if (amount < 0) {
      expenses.push({
        date: formatDate(operationDate),
        concept,
        reference,
        amount,
      })
    }
  }

  return expenses
}
