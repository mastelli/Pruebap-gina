function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

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

const INTERNET_COMPANIES = [
  "Movistar",
  "Orange",
  "Vodafone",
  "Digi",
  "Yoigo",
  "MásMóvil",
  "Jazztel",
  "Pepephone",
  "Simyo",
  "Lowi",
  "O2",
  "Finetwork",
  "Avatel",
  "Euskaltel",
  "Telecable",
  "Parlem",
  "Lebara",
  "Llamaya",
  "Suop",
  "Digi Mobil",
  "Virgin telco",
  "Adamo",
  "Ptv Telecom",
  "Netllar",
  "Ion Mobile",
  "Hits Mobile",
  "Guuk",
  "Wifibytes",
  "Lobster",
  "Sweno",
  "Oléphone",
  "Silbö Telecom",
  "Wewi Mobile",
  "Xenet",
  "Amena",
  "Carrefour Telecom",
  "Viasat",
  "Starlink",
  "Econet",
  "Fibra Medusa",
  "Fibracat",
  "Embou",
  "Redyser",
  "Somos Fibra",
  "Excom",
  "ConectaBalear",
  "Nostrum",
  "Aire Networks",
  "Colt",
  "LCRcom",
  "Nethits",
  "Procono",
  "Telecable Andalucía",
  "Cableworld",
  "Mundo R",
  "Mundo Fibra",
  "Sarenet",
  "IdecNet",
  "Wimax Online",
  "Netcan",
  "Wifirst",
  "Wireless Logic",
]

function makeMatcher(companies: string[]): (concept: string) => boolean {
  const normalizedCompanies = companies.map(normalize)
  return (concept: string) => {
    const normalizedConcept = normalize(concept)
    return normalizedCompanies.some((company) => normalizedConcept.includes(company))
  }
}

export const isElectricityBill = makeMatcher(ELECTRICITY_COMPANIES)
export const isInternetBill = makeMatcher(INTERNET_COMPANIES)

export interface DetectableMovement {
  name: string
  date: string
  amount: number
}

export function getMonthlyBillAmount(
  movements: DetectableMovement[],
  year: string,
  month: string,
  matcher: (concept: string) => boolean,
): number {
  return movements
    .filter(
      (movement) =>
        movement.date.startsWith(`${year}-${month}`) && matcher(movement.name),
    )
    .reduce((sum, movement) => sum + movement.amount, 0)
}
