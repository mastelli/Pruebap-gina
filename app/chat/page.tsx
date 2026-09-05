"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, StickyNote, Trash2, MessageSquare, Plus, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n"
import { storageGetItem, storageSetItem } from "@/lib/auth"
import { useTransactions, sortByDateDesc } from "@/lib/transactions"
import { getCategoryFor } from "@/lib/categories"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  text: string
  time: string
}

interface Note {
  id: string
  text: string
}

const MESSAGES_KEY = "appChatMessages"
const NOTES_KEY = "appChatNotes"
const MAX_HISTORY = 12

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const stored = storageGetItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function save<T>(key: string, value: T[]): void {
  try {
    storageSetItem(key, JSON.stringify(value))
  } catch {
    // almacenamiento no disponible
  }
}

function formatEuros(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

// Resumen real de las transacciones del usuario para que el asistente
// responda con sus datos reales sin subir el historial completo
function buildFinancialContext(
  transactions: ReturnType<typeof useTransactions>["transactions"],
): string {
  const now = new Date()
  const year = now.getFullYear()
  const monthPrefix = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`

  let income = 0
  let expense = 0
  const byCategory: Record<string, number> = {}
  for (const transaction of transactions) {
    if (!transaction.date.startsWith(monthPrefix)) continue
    if (transaction.amount > 0) {
      income += transaction.amount
    } else {
      const value = -transaction.amount
      expense += value
      const category = getCategoryFor(transaction)
      byCategory[category] = (byCategory[category] ?? 0) + value
    }
  }

  const lines: string[] = [
    `- Mes actual (${year}-${String(now.getMonth() + 1).padStart(2, "0")}): ingresos ${formatEuros(income)}, gastos ${formatEuros(expense)}, neto ${formatEuros(income - expense)}.`,
  ]

  const categories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  if (categories.length > 0) {
    lines.push("  Gastos del mes por categoria:")
    for (const [category, value] of categories) {
      lines.push(
        `  * ${category}: ${formatEuros(value)} (${Math.round((value / expense) * 100)}%)`,
      )
    }
  }

  const recent = sortByDateDesc(transactions).slice(0, 15)
  if (recent.length > 0) {
    lines.push("  Movimientos recientes:")
    for (const transaction of recent) {
      const category = getCategoryFor(transaction)
      lines.push(
        `  - ${transaction.date} · ${transaction.description || category} · ${formatEuros(transaction.amount)}`,
      )
    }
  }

  return lines.join("\n")
}

export default function ChatPage() {
  const { t } = useLanguage()
  const { transactions } = useTransactions()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [noteInput, setNoteInput] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(load<ChatMessage>(MESSAGES_KEY))
    setNotes(load<Note>(NOTES_KEY))
  }, [])

  useEffect(() => {
    save(MESSAGES_KEY, messages)
  }, [messages])

  useEffect(() => {
    save(NOTES_KEY, notes)
  }, [notes])

  // Los mensajes guardados antes de la IA no tienen rol: se muestran como del usuario
  const normalizedMessages = messages.map((message) => ({
    ...message,
    role: message.role === "assistant" ? "assistant" : "user",
  }))

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, sending])

  const sendMessage = async () => {
    const text = messageInput.trim()
    if (!text || sending) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "user",
      text,
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    }

    const history = [...normalizedMessages, userMessage]
      .slice(-MAX_HISTORY)
      .map((message) => ({ role: message.role, content: message.text }))

    setMessages((prev) => [...prev, userMessage])
    setMessageInput("")
    setSending(true)
    setError(null)
    setTruncated(false)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: buildFinancialContext(transactions),
        }),
      })
      const data = await response.json().catch(() => null)

      if (response.status === 503) {
        setError(t("AI assistant unconfigured"))
      } else if (!data?.reply) {
        setError(t("AI assistant unavailable"))
      } else {
        if (data.truncated) setTruncated(true)
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            role: "assistant",
            text: data.reply,
            time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      }
    } catch {
      setError(t("AI assistant unavailable"))
    } finally {
      setSending(false)
    }
  }

  const addNote = () => {
    const text = noteInput.trim()
    if (!text) return

    setNotes((prev) => [
      ...prev,
      {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
      },
    ])
    setNoteInput("")
  }

  return (
    <div className="grid gap-4 lg:h-[calc(100vh-8rem)] lg:grid-cols-[1fr_320px]">
      <Card className="flex flex-col overflow-hidden lg:h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{t("Chat")}</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
            {normalizedMessages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[75%] rounded-lg bg-secondary px-3 py-2">
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <p className="mt-1 text-xs opacity-60">{message.time}</p>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[75%] rounded-lg bg-primary px-3 py-2 text-primary-foreground">
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <p className="mt-1 text-right text-xs opacity-70">{message.time}</p>
                  </div>
                </div>
              ),
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">{t("AI is typing")}</span>
                </div>
              </div>
            )}
            {normalizedMessages.length === 0 && !sending && (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("No messages yet")}</p>
            )}
            <div ref={messagesEndRef} />
          </div>
          {error && (
            <p className="flex items-center gap-2 text-xs text-destructive">
              {error}
              <button className="underline" onClick={() => setError(null)}>
                {t("Dismiss")}
              </button>
            </p>
          )}
          {truncated && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {t("AI response was cut off") + " — "}
                <button className="underline" onClick={sendMessage}>
                  {t("Continue")}
                </button>
              </span>
              <button className="underline" onClick={() => setTruncated(false)}>
                {t("Dismiss")}
              </button>
            </p>
          )}
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={messageInput}
              placeholder={t("Write a message")}
              onChange={(event) => setMessageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage()
              }}
              disabled={sending}
            />
            <Button size="icon" onClick={sendMessage} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">{t("Send")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden lg:h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{t("Notes")}</CardTitle>
          <StickyNote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start justify-between gap-2 rounded-md bg-secondary px-3 py-2">
                <p className="text-sm break-words whitespace-pre-wrap">{note.text}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setNotes((prev) => prev.filter((item) => item.id !== note.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">{t("Delete")}</span>
                </Button>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">{t("No notes yet")}</p>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={noteInput}
              placeholder={t("Add a note")}
              onChange={(event) => setNoteInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") addNote()
              }}
            />
            <Button variant="outline" onClick={addNote}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">{t("Add a note")}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}