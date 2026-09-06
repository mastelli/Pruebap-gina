"use client"

import { useEffect, useRef } from "react"

const PLACEHOLDER = "ca-pub-0000000000000000"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

interface AdSlotProps {
  slot?: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid"
  className?: string
}

export function AdSlot({ slot = "3096723540", format = "auto", className = "" }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const pushedRef = useRef(false)

  useEffect(() => {
    if (!client || client === PLACEHOLDER || /^ca-pub-0+$/.test(client)) return
    if (pushedRef.current) return
    pushedRef.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [client])

  if (!client || client === PLACEHOLDER || /^ca-pub-0+$/.test(client)) return null

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}