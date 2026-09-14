// Traduce el sufijo de bolsa del simbolo de Yahoo Finance a un nombre
// legible (p. ej. "OHLA.MC" -> "BME Madrid"). Los simbolos sin sufijo
// cotizan en bolsa estadounidense.
const EXCHANGE_BY_SUFFIX: Record<string, string> = {
  MC: "BME Madrid",
  BME: "BME Madrid",
  SG: "Stuttgart",
  TG: "Tradegate",
  SW: "SIX Suiza",
  DE: "XETRA",
  F: "Frankfurt",
  HM: "Hamburgo",
  BE: "Berlín",
  L: "Londres",
  PA: "París",
  AS: "Ámsterdam",
  BR: "Bruselas",
  LI: "Lisboa",
  MI: "Milán",
  VI: "Viena",
  ST: "Estocolmo",
  CO: "Copenhague",
  OL: "Oslo",
  HE: "Helsinki",
  TO: "Toronto",
  V: "TSX Venture",
  HK: "Hong Kong",
  SS: "Shanghái",
  SZ: "Shenzhen",
  T: "Tokio",
  OSA: "Osaka",
  AX: "Sídney",
  NZ: "Nueva Zelanda",
  SA: "San Pablo",
  JO: "Johannesburgo",
  SI: "Singapur",
  KS: "Corea del Sur",
  KQ: "KOSDAQ",
  TW: "Taipéi",
  BK: "Bombay",
  NS: "NSE India",
  WA: "Varsovia",
  PR: "Praga",
  BU: "Budapest",
  BD: "Belgrado",
  ZA: "Zagreb",
  IR: "Irlanda",
  ATH: "Atenas",
  IST: "Estambul",
  BVMF: "B3 Brasil",
  BMV: "México",
  BCS: "Chile",
  BVC: "Colombia",
  SNSE: "Santiago",
  CN: "Canadá",
  IM: "Borsa Italiana",
  RISE: "Rusia",
  MEX: "México",
  KT: "Korea",
}

// Mapeo de exchange IDs de Yahoo Finance a nombres legibles
const EXCHANGE_ID_TO_NAME: Record<string, string> = {
  NMS: "NASDAQ",
  NCM: "NASDAQ",
  BUE: "NASDAQ",
  NAS: "NASDAQ",
  NYQ: "NYSE",
  NYSE: "NYSE",
  LON: "Londres",
  LSE: "Londres",
  FRA: "Frankfurt",
  FSE: "Frankfurt",
  ETR: "XETRA",
  XETRA: "XETRA",
  MCE: "BME Madrid",
  BCN: "BME Madrid",
  STO: "Estocolmo",
  OSL: "Oslo",
  CPH: "Copenhague",
  HEL: "Helsinki",
  ICE: "Islandia",
  TSE: "Tokio",
  OSA: "Oslo",
  HAM: "Hamburgo",
  MUN: "Múnich",
  DUS: "Düsseldorf",
  SGF: "Stuttgart",
  TGA: "Tradegate",
  TOR: "Toronto",
  VEF: "TSX Venture",
  ASX: "Sídney",
  NZE: "Nueva Zelanda",
  HKG: "Hong Kong",
  SHA: "Shanghái",
  SHE: "Shenzhen",
  TAI: "Taipéi",
  BOM: "Bombay",
  NSE: "NSE India",
  KSE: "Corea del Sur",
  KOQ: "KOSDAQ",
  SET: "Bangkok",
  JKT: "Yakarta",
  PHS: "Filipinas",
  KLSE: "Malasia",
  SN: "Singapur",
  BVMF: "San Paulo",
  JNB: "Johannesburgo",
  WSE: "Varsovia",
  PRA: "Praga",
  BUD: "Budapest",
  BLB: "Belgrado",
  ZSE: "Zagreb",
  VIA: "Viena",
  MIL: "Milán",
  LIS: "Lisboa",
  AMS: "Ámsterdam",
  BRU: "Bruselas",
  PAR: "París",
  RIS: "Rusia",
}

// Cache de exchange por símbolo
const exchangeCache = new Map<string, string>()

export function setExchangeCache(symbol: string, exchange: string) {
  exchangeCache.set(symbol.toUpperCase(), exchange)
}

// Nombre de la bolsa donde cotiza un simbolo; vacio si no se puede deducir
export function exchangeFromSymbol(symbol?: string): string {
  if (!symbol) return ""
  // 1. Buscar en cache (obtenido de Yahoo Finance)
  const cached = exchangeCache.get(symbol.toUpperCase())
  if (cached) return cached
  // 2. Detectar por sufijo
  const match = symbol.toUpperCase().match(/\.([A-Z]{1,3})$/)
  if (match) return EXCHANGE_BY_SUFFIX[match[1]] ?? ""
  // 3. Sin sufijo: asumir US (será corregido por Yahoo Finance)
  return ""
}
