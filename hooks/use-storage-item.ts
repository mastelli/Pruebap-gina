"use client"

import { useEffect, useState } from "react"
import { storageGetItem, getStorageVersion, onStorageVersionChange } from "@/lib/auth"

/**
 * Read from storage and re-load when the auth userId changes.
 * Returns [value, hydrated] where hydrated means the first read is done.
 */
export function useStorageItem<T>(key: string, fallback: T): [T, boolean] {
  const [value, setValue] = useState<T>(fallback)
  const [hydrated, setHydrated] = useState(false)
  const [ver, setVer] = useState(0)

  useEffect(() => {
    return onStorageVersionChange(() => setVer((v) => v + 1))
  }, [])

  useEffect(() => {
    try {
      const raw = storageGetItem(key)
      if (raw !== null) {
        const parsed = JSON.parse(raw)
        setValue(parsed)
      }
    } catch {}
    setHydrated(true)
  }, [key, ver])

  return [value, hydrated]
}
