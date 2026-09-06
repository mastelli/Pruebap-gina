"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function HelpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      })
      if (!res.ok) throw new Error("send failed")
      setStatus("sent")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight">Centro de ayuda</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cuéntanos tu consulta o problema y te responderemos lo antes posible.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Envíanos un mensaje</CardTitle>
          <CardDescription>
            Rellena el formulario y tu mensaje nos llegará directamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Tu correo</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="¿Sobre qué nos escribes?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe aquí tu consulta…" rows={5} required />
            </div>
            <Button type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando…
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar mensaje
                </>
              )}
            </Button>
            {status === "sent" && (
              <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                ¡Mensaje enviado! Te responderemos lo antes posible.
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-sm text-destructive">
                No se ha podido enviar el mensaje. Inténtalo de nuevo en unos minutos.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}