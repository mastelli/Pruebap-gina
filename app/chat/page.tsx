"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, StickyNote, Trash2, MessageSquare, Plus } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

interface ChatMessage {
  id: string
  text: string
  time: string
}

interface Note {
  id: string
  text: string
}

const MESSAGES_KEY = "appChatMessages"
const NOTES_KEY = "appChatNotes"

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function save<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // almacenamiento no disponible
  }
}

export default function ChatPage() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [noteInput, setNoteInput] = useState("")
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    const text = messageInput.trim()
    if (!text) return

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
        time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      },
    ])
    setMessageInput("")
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
            {messages.map((message) => (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[75%] rounded-lg bg-primary px-3 py-2 text-primary-foreground">
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  <p className="mt-1 text-right text-xs opacity-70">{message.time}</p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("No messages yet")}</p>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Input
              value={messageInput}
              placeholder={t("Write a message")}
              onChange={(event) => setMessageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") sendMessage()
              }}
            />
            <Button size="icon" onClick={sendMessage}>
              <Send className="h-4 w-4" />
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
