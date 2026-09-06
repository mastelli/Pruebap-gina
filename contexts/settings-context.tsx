"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { storageGetItem, storageSetItem, onStorageVersionChange } from "@/lib/auth"

export interface UserSettings {
  avatar: string
  fullName: string
  email: string
  birthDate: string
  language: string
  currency: string
  dateFormat: string
  fontSize: number
  theme: "light" | "dark" | "system"
  layout: "default" | "compact" | "expanded"
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    accountActivity: boolean
    newFeatures: boolean
    marketing: boolean
    frequency: "real-time" | "daily" | "weekly"
    quietHoursStart: string
    quietHoursEnd: string
  }
  privacy: {
    analyticsSharing: boolean
    personalizedAds: boolean
    visibility: "public" | "private"
    dataRetention: "6-months" | "1-year" | "2-years" | "indefinite"
    cookies: {
      analytics: boolean
      marketing: boolean
    }
  }
}

const defaultSettings: UserSettings = {
  avatar: "",
  fullName: "",
  email: "",
  birthDate: "",
  language: "en",
  currency: "usd",
  dateFormat: "mm-dd-yyyy",
  fontSize: 16,
  theme: "system",
  layout: "default",
  notifications: {
    email: true,
    push: true,
    sms: false,
    accountActivity: true,
    newFeatures: true,
    marketing: false,
    frequency: "real-time",
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  },
  privacy: {
    analyticsSharing: true,
    personalizedAds: false,
    visibility: "public",
    dataRetention: "1-year",
    cookies: {
      analytics: true,
      marketing: false,
    },
  },
}

interface SettingsContextType {
  settings: UserSettings
  updateSettings: (newSettings: Partial<UserSettings>) => void
  updateNotificationSettings: (settings: Partial<UserSettings["notifications"]>) => void
  updatePrivacySettings: (settings: Partial<UserSettings["privacy"]>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window !== "undefined") {
      const savedSettings = storageGetItem("userSettings")
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    return defaultSettings
  })

  // Re-load settings when userId changes
  useEffect(() => {
    return onStorageVersionChange(() => {
      try {
        const saved = storageGetItem("userSettings")
        if (saved) setSettings(JSON.parse(saved))
      } catch {}
    })
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    storageSetItem("userSettings", JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const updateNotificationSettings = (notificationSettings: Partial<UserSettings["notifications"]>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notificationSettings },
    }))
  }

  const updatePrivacySettings = (privacySettings: Partial<UserSettings["privacy"]>) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...privacySettings },
    }))
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotificationSettings,
        updatePrivacySettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
