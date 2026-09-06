"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLanguage } from "@/lib/i18n"

export default function HelpPage() {
  const { t } = useLanguage()
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
      <h1 className="text-2xl font-bold tracking-tight">{t("Help Center")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("Tell us your question or issue and we will get back to you as soon as possible.")}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("Send us a message")}</CardTitle>
          <CardDescription>
            {t("Fill in the form and your message will reach us directly.")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("Name")}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Your name")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("Your email")}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("you@email.com")} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">{t("Subject")}</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t("What is this about?")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("Message")}</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t("Write your question here...")} rows={5} required />
            </div>
            <Button type="submit" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("Sending...")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("Send message")}
                </>
              )}
            </Button>
            {status === "sent" && (
              <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                {t("Message sent! We will get back to you as soon as possible.")}
              </p>
            )}
            {status === "error" && (
              <p className="text-center text-sm text-destructive">
                {t("The message could not be sent. Please try again in a few minutes.")}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}