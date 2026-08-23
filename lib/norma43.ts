export interface Norma43Expense {
  date: string
  concept: string
  reference: string
  amount: number
}

// Codificación oficial del Cuaderno 43 AEB:
// positivos: { = 0, A-I = 1-9 · negativos: } = 0, N-V = 1-9
const positiveDigitMap: Record<string, string> = {
  "{": "0",
  A: "1",
  B: "2",
  C: "3",
  D: "4",
  E: "5",
  F: "6",
  G: "7",
  H: "8",
  I: "9",
}

const negativeDigitMap: Record<string, string> = {
  "}": "0",
  N: "1",
  O: "2",
  P: "3",
  Q: "4",
  R: "5",
  S: "6",
  T: "7",
  U: "8",
  V: "9",
}

function decodeAmount(raw: string): number {
  const trimmed = raw.trim()
  if (!trimmed) return Number.NaN

  const marker = trimmed[trimmed.length - 1].toUpperCase()
  const digits = trimmed.slice(0, -1)

  let sign = 1
  let lastDigit = ""

  if (marker in positiveDigitMap) {
    lastDigit = positiveDigitMap[marker]
  } else if (marker in negativeDigitMap) {
    lastDigit = negativeDigitMap[marker]
    sign = -1
  } else if (/^\d$/.test(marker)) {
    // sin marca de signo: se asume positivo
    return Number.parseInt(trimmed, 10) / 100
  } else {
    return Number.NaN
  }

  const fullDigits = `${digits}${lastDigit}`
  if (!/^\d+$/.test(fullDigits)) return Number.NaN

  const value = Number.parseInt(fullDigits, 10) / 100
  return sign * value
}

function formatDate(yymmdd: string): string {
  if (!/^\d{6}$/.test(yymmdd)) return ""
  return `20${yymmdd.slice(0, 2)}-${yymmdd.slice(2, 4)}-${yymmdd.slice(4, 6)}`
}

export function parseNorma43Expenses(content: string): Norma43Expense[] {
  const movements: Array<{
    date: string
    concept: string
    reference: string
    amount: number
  }> = []

  const lines = content.split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "")

    if (line.startsWith("22")) {
      movements.push({
        date: formatDate(line.slice(6, 12)),
        concept: line.slice(18, 30).trim(),
        reference: line.slice(44, 90).trim(),
        amount: decodeAmount(line.slice(32, 42)),
      })
    } else if (line.startsWith("23") && movements.length > 0) {
      // Registro complementario: amplía el concepto del movimiento anterior
      const extraConcept = line.slice(4, 38).trim()
      if (extraConcept) {
        const previous = movements[movements.length - 1]
        previous.concept = previous.concept ? `${previous.concept} ${extraConcept}` : extraConcept
      }
    }
  }

  return movements
    .filter((movement) => !Number.isNaN(movement.amount) && movement.amount < 0)
    .map((movement) => ({
      date: movement.date,
      concept: movement.concept || "Sin concepto",
      reference: movement.reference,
      amount: movement.amount,
    }))
}
