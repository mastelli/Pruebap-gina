import type { Transaction } from "./transactions"

const ELECTRICITY_COMPANIES = [
  "Endesa",
  "Iberdrola",
  "Naturgy",
  "EDP",
  "Repsol",
  "Acciona Energía",
  "TotalEnergies",
  "Holaluz",
  "Octopus Energy",
  "Podo",
  "Audax Renovables",
  "Factorenergia",
  "Feníe Energía",
  "Nexus Energía",
  "Som Energia",
  "Gana Energía",
  "Aldro Energía",
  "Wekiwi",
  "Imagina Energía",
  "BonpreuEsclat Energia",
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const NORMALIZED_COMPANIES = ELECTRICITY_COMPANIES.map(normalize)

export function isElectricityBill(concept: string): boolean {
  const normalizedConcept = normalize(concept)
  return NORMALIZED_COMPANIES.some((company) => normalizedConcept.includes(company))
}

export function getMonthlyElectricityAmount(
  transactions: Transaction[],
  year: string,
  month: string,
): number {
  return transactions
    .filter(
      (transaction) =>
        transaction.date.startsWith(`${year}-${month}`) && isElectricityBill(transaction.name),
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0)
}
