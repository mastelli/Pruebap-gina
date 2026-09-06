"use client"

import Script from "next/script"

const PLACEHOLDER = "ca-pub-0000000000000000"

export function AdsenseScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  if (!client || client === PLACEHOLDER || /^ca-pub-0+$/.test(client)) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}