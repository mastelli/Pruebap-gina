"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CONTACT_EMAIL } from "@/lib/contact"

export default function HelpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body = `Nombre: ${name}\nEmail: ${email}\n${subject ? `Asunto: ${subject}\n` : ""}\n${message}`
    const uri = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject || "Consulta desde MakeItRight")}&body=${encodeURIComponent(body)}`
    window.location.href = uri
    setSent(true)
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
            Rellena el formulario y se abrirá tu aplicación de correo con el mensaje listo para enviar.
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
            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Enviar mensaje
            </Button>
            {sent && (
              <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                Se ha abierto tu aplicación de correo con el mensaje listo para enviar. ¡Gracias!
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}