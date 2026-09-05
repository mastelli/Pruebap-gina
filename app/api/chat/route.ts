import { type NextRequest, NextResponse } from "next/server"

// Clave del proveedor, leida solo en el servidor (Vercel / .env.local)
const API_KEY = process.env.GEMINI_API_KEY
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const SYSTEM_PROMPT = `
Eres Aurora, asistente financiero personal en español. Ayudas al usuario a entender y
gestionar su dinero usando los datos reales de sus transacciones bancarias que recibes
como contexto.

Reglas:
- Responde siempre en español, de forma clara, concisa y práctica.
- Basa tus respuestas en el contexto de finanzas proporcionado cuando el usuario hable
  de sus movimientos, ahorro, gastos o ingresos. Si no hay datos para algo, dilo.
- Ofrece consejos de presupuesto, ahorro y control de gastos cuando aporte valor.
- Para inversiones, evita recomendaciones concretas personalizadas y recuerda siempre
  que invertir conlleva riesgo.
- No inventes cifras ni datos; usa únicamente los del contexto.`.trim()

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: "missing_key" }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const rawMessages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : []
  const context: string = typeof body?.context === "string" ? body.context : ""

  // Ultimas 12 intervenciones como maximo para no agotar la ventana de contexto
  const history: ChatMessage[] = rawMessages.slice(-12)

  const contextBlock =
    `Datos de finanzas del usuario (generados por la aplicacion):\n` +
    context.trim() ||
    "El usuario todavia no tiene transacciones importadas."

  const contents = [
    { role: "user", parts: [{ text: contextBlock }] },
    ...history.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
  ]

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      },
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: `upstream_error (${response.status})` },
        { status: 502 },
      )
    }

    const data = await response.json()
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? "")
        .join("") ?? ""

    if (!reply) {
      return NextResponse.json({ error: "empty_reply" }, { status: 502 })
    }

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 })
  }
}