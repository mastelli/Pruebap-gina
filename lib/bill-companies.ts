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

const WATER_COMPANIES = [
  "Aqualia",
  "Canal de Isabel II",
  "Agbar",
  "Aigües de Barcelona",
  "Acciona Agua",
  "Global Omnium",
  "FACSA",
  "Hidralia",
  "Hidraqua",
  "Hidrogea",
  "GS Inima",
  "Sacyr Agua",
  "CASSA",
  "EMASESA",
  "EMAYA",
  "EMACSA",
  "EMALCSA",
  "Espina & Delfín",
  "Aqlara",
  "Aguas de Valencia",
  "Aguas de Alicante",
  "Aguas de Murcia",
  "Aguas de Córdoba",
  "Aguas de Cádiz",
  "Aguas de Huelva",
  "Aguas de Teruel",
  "Aguas de Zaragoza",
  "Consorcio de Aguas Bilbao Bizkaia",
  "Consorci d’Aigües de Tarragona",
  "Aguas del Añarbe",
  "Aguas de Valladolid",
  "Aguas de Burgos",
  "Aguas de León",
  "Aguas de Avilés",
  "Aguas de Gijón",
  "Aguas de Oviedo",
  "Aguas de Santander",
  "Aguas de Torrelavega",
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
export const isWaterBill = makeMatcher(WATER_COMPANIES)

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
