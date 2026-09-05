"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function HomePage() {
  const { ready, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return
    router.replace(userId ? "/inicio" : "/welcome")
  }, [ready, userId, router])

  return null
}