import { type NextRequest, NextResponse } from "next/server"

// Resumen de analisis tecnico generado por IA, fundamentado unicamente en los
// indicadores que calcula la app con el historico real de la accion.

const API_KEY = process.env.GEMINI_API_KEY
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash"
const CACHE_TTL = 6 * 60 * 60 * 1000
const MIN_WORDS = 50
const MAX_WORDS = 70

const cache = new Map<string, { ts: number; text: string }>()

interface AnalysisRequest {
  symbol?: string
  name?: string
  exchange?: string
  currency?: string
  lang?: string
  snapshot?: Record<string, number | null>
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function clean(text: string): string {
  return text
    .replace(/```[\s\S]*?\n/g, "")
    .replace(/```/g, "")
    .replace(/^\s*["“]|["”]\s*$/g, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function fitToRange(text: string): string {
  if (countWords(text) <= MAX_WORDS) return text
  // Conserva frases completas hasta el limite; si no cabe ninguna, recorta.
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? []
  let out = ""
  for (const sentence of sentences) {
    if (countWords(out + sentence) > MAX_WORDS) break
    out += sentence
  }
  if (out.trim()) return out.trim()
  return `${text.split(/\s+/).slice(0, MAX_WORDS).join(" ").replace(/[,;:]$/, "")}…`
}

async function generate(prompt: string, system: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { temperature: 0.5, maxOutputTokens: 400 },
      }),
      signal: AbortSignal.timeout(20000),
    },
  )
  if (!response.ok) throw new Error(`upstream_error (${response.status})`)
  const data = await response.json()
  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("") ?? ""
  if (!reply.trim()) throw new Error("empty_reply")
  return reply
}

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "missing_key" }, { status: 503 })
  }

  const body = (await request.json().catch(() => null)) as AnalysisRequest | null
  const symbol = typeof body?.symbol === "string" ? body.symbol.trim().toUpperCase() : ""
  if (!symbol || symbol.length > 20) {
    return NextResponse.json({ error: "symbol_required" }, { status: 400 })
  }
  if (!body?.snapshot || typeof body.snapshot.price !== "number") {
    return NextResponse.json({ error: "snapshot_required" }, { status: 400 })
  }

  const lang = body.lang === "en" ? "en" : "es"
  const cacheKey = `${symbol}:${lang}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ analysis: cached.text, cached: true })
  }

  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : symbol
  const exchange = typeof body.exchange === "string" ? body.exchange : ""
  const currency = typeof body.currency === "string" ? body.currency : ""
  const language = lang === "en" ? "English" : "español"

  const system = [
    "Eres un analista técnico bursátil objetivo.",
    `Escribes siempre en ${language}.`,
    "No inventas datos ni cifras: usas exclusivamente los indicadores aportados.",
    "No das recomendaciones personalizadas de compra o venta.",
    "No usas listas, títulos ni markdown: solo un párrafo.",
  ].join(" ")

  const basePrompt = [
    `Escribe un análisis técnico breve de ${name} (${symbol}${exchange ? `, ${exchange}` : ""}${currency ? `, ${currency}` : ""}).`,
    `Debe tener entre ${MIN_WORDS} y ${MAX_WORDS} palabras (ni menos ni más), en ${language}, en un único párrafo.`,
    "Interpreta la tendencia con la SMA20 y SMA50, el momento con el RSI14, la evolución a 1 y 3 meses, el rango de 52 semanas y el volumen relativo.",
    "Si un dato es null o falta, omítelo; no lo sustituyas por estimaciones.",
    "No repitas todas las cifras: interpreta lo que significan.",
    "Responde solo con el párrafo.",
    `Datos reales: ${JSON.stringify(body.snapshot)}`,
  ].join("\n")

  try {
    let text = ""
    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt =
        attempt === 0
          ? basePrompt
          : `${basePrompt}\n\nTu intento anterior tuvo ${countWords(text)} palabras. Escribe de nuevo el párrafo completo con entre ${MIN_WORDS} y ${MAX_WORDS} palabras.`
      text = clean(await generate(prompt, system))
      if (countWords(text) >= MIN_WORDS) break
    }

    const analysis = fitToRange(text)
    if (!analysis) {
      return NextResponse.json({ error: "empty_reply" }, { status: 502 })
    }

    cache.set(cacheKey, { ts: Date.now(), text: analysis })
    return NextResponse.json({ analysis, words: countWords(analysis) })
  } catch {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 })
  }
}
