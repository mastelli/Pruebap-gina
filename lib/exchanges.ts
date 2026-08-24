// Traduce el sufijo de bolsa del simbolo de Yahoo Finance a un nombre
// legible (p. ej. "OHLA.MC" -> "BME Madrid"). Los simbolos sin sufijo
// cotizan en bolsa estadounidense.
const EXCHANGE_BY_SUFFIX: Record<string, string> = {
  MC: "BME Madrid",
  BME: "BME Madrid",
  SG: "Stuttgart",
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
}

// Nombre de la bolsa donde cotiza un simbolo; vacio si no se puede deducir
export function exchangeFromSymbol(symbol?: string): string {
  if (!symbol) return ""
  const match = symbol.toUpperCase().match(/\.([A-Z]{1,3})$/)
  if (!match) return "EE. UU."
  return EXCHANGE_BY_SUFFIX[match[1]] ?? ""
}
