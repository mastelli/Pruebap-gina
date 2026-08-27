export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export const ELECTRICITY_COMPANIES = [
  "Endesa",
  "Iberdrola",
  "Naturgy",
  "EDP",
  "Repsol",
  "Acciona EnergÃ­a",
  "TotalEnergies",
  "Holaluz",
  "Octopus Energy",
  "Podo",
  "Audax Renovables",
  "Factorenergia",
  "FenÃ­e EnergÃ­a",
  "Nexus EnergÃ­a",
  "Som Energia",
  "Gana EnergÃ­a",
  "Aldro EnergÃ­a",
  "Wekiwi",
  "Imagina EnergÃ­a",
  "BonpreuEsclat Energia",
]

export const INTERNET_COMPANIES = [
  "Movistar",
  "Orange",
  "Vodafone",
  "Digi",
  "Yoigo",
  "MÃ¡sMÃ³vil",
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
  "OlÃ©phone",
  "SilbÃ¶ Telecom",
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
  "Telecable AndalucÃ­a",
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

export const WATER_COMPANIES = [
  "Aqualia",
  "Canal de Isabel II",
  "Agbar",
  "AigÃ¼es de Barcelona",
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
  "Espina & DelfÃ­n",
  "Aqlara",
  "Aguas de Valencia",
  "Aguas de Alicante",
  "Aguas de Murcia",
  "Aguas de CÃ³rdoba",
  "Aguas de CÃ¡diz",
  "Aguas de Huelva",
  "Aguas de Teruel",
  "Aguas de Zaragoza",
  "Consorcio de Aguas Bilbao Bizkaia",
  "Consorci dâ€™AigÃ¼es de Tarragona",
  "Aguas del AÃ±arbe",
  "Aguas de Valladolid",
  "Aguas de Burgos",
  "Aguas de LeÃ³n",
  "Aguas de AvilÃ©s",
  "Aguas de GijÃ³n",
  "Aguas de Oviedo",
  "Aguas de Santander",
  "Aguas de Torrelavega",
]

const SUBSCRIPTION_SERVICES = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Max",
  "Apple TV+",
  "Movistar Plus+",
  "SkyShowtime",
  "Filmin",
  "Atresplayer",
  "Mitele Plus",
  "RTVE Play+",
  "DAZN",
  "Crunchyroll",
  "Rakuten TV",
  "MUBI",
  "YouTube Premium",
  "YouTube Music",
  "Spotify",
  "Apple Music",
  "Amazon Music Unlimited",
  "Tidal",
  "Deezer",
  "SoundCloud Go+",
  "Amazon Prime",
  "Apple One",
  "Google One",
  "iCloud+",
  "Microsoft 365",
  "Adobe Creative Cloud",
  "Dropbox",
  "Google Workspace",
  "Canva Pro",
  "Notion",
  "Evernote",
  "1Password",
  "Dashlane",
  "NordVPN",
  "Surfshark",
  "ExpressVPN",
  "Proton VPN",
  "McAfee",
  "Norton",
  "Bitdefender",
  "PlayStation Plus",
  "Xbox Game Pass",
  "Nintendo Switch Online",
  "EA Play",
  "Ubisoft+",
  "GeForce NOW",
  "Kindle Unlimited",
  "Audible",
  "Duolingo Super",
  "Babbel",
  "Busuu",
  "Preply",
  "Headspace",
  "Calm",
  "Strava",
  "Freeletics",
  "Nike Training Club",
  "MyFitnessPal",
  "Gympass",
  "LinkedIn Premium",
  "X Premium",
  "Tinder Plus",
  "Tinder Gold",
  "Tinder Platinum",
  "Bumble Premium",
  "The New York Times",
  "Financial Times",
  "The Economist",
  "The Guardian",
  "El PaÃ­s",
  "El Mundo",
  "La Vanguardia",
  "ABC",
  "ExpansiÃ³n",
  "Cinco DÃ­as",
  "Onda Cero",
  "Atresplayer Premium",
  "Mediaset Infinity",
  "HolaDoctor",
  "Glovo Prime",
  "Uber One",
  "Just Eat Plus",
  "Amazon Audible",
  "CÃ­rculo de Lectores",
  "Casa del Libro",
  "Degusta Box",
  "Birchbox",
  "HelloFresh",
  "N26 You",
  "Revolut Premium",
  "Revolut Metal",
  "Amazon Business Prime",
  "Adobe Stock",
  "Shutterstock",
  "Envato Elements",
  "Getty Images",
  "123RF",
  "Canva",
  "Patreon",
  "OnlyFans",
  "Substack",
  "Dropbox Plus",
  "Google Drive",
  "Microsoft OneDrive",
  "Zoho",
  "Todoist Pro",
  "Grammarly",
  "ChatGPT Plus",
  "Claude Pro",
  "Perplexity Pro",
  "GitHub Copilot",
  "Midjourney",
  "Adobe Firefly",
  "OpenAI API",
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
export const isSubscription = makeMatcher(SUBSCRIPTION_SERVICES)

const RENT_MORTGAGE_KEYWORDS = [
  "alquiler",
  "hipoteca",
  "arrendamiento",
  "rent",
  "mortgage",
]

export const isRentOrMortgage = makeMatcher(RENT_MORTGAGE_KEYWORDS)

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

// Devuelve la compania detectada en el mes para una lista dada;
// si hay varias, gana la del movimiento mas reciente
export function getMonthlyBillProvider(
  movements: DetectableMovement[],
  year: string,
  month: string,
  companies: string[],
): string | null {
  let latest: { date: string; company: string } | null = null

  for (const movement of movements) {
    if (!movement.date.startsWith(`${year}-${month}`)) continue

    const normalizedConcept = normalize(movement.name)
    const company = companies.find(
      (candidate) => normalizedConcept.includes(normalize(candidate)),
    )
    if (company && (!latest || movement.date >= latest.date)) {
      latest = { date: movement.date, company }
    }
  }

  return latest?.company ?? null
}
