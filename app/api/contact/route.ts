import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { CONTACT_EMAIL } from "@/lib/contact"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const name = String(body.name ?? "").trim()
    const email = String(body.email ?? "").trim()
    const subject = String(body.subject ?? "").trim()
    const message = String(body.message ?? "").trim()

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Faltan campos obligatorios" }, { status: 400 })
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ ok: false, error: "Correo no configurado" }, { status: 500 })
    }

    const port = Number(process.env.SMTP_PORT ?? 587)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: `"MakeItRight" <${process.env.SMTP_USER}>`,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: subject ? `[Web] ${subject}` : "[Web] Nueva consulta de contacto",
      text: `Nombre: ${name}\nEmail del remitente: ${email}\n\n${message}`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Contact email error:", err)
    return NextResponse.json({ ok: false, error: "No se pudo enviar el mensaje" }, { status: 500 })
  }
}