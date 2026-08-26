"use client"

import { useSettings } from "@/contexts/settings-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserAvatar } from "@/components/user-avatar"
import { ageFromBirthDate } from "@/lib/auth"
import { Laptop, Smartphone, Tablet } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useLanguage, type Language } from "@/lib/i18n"

const sections = [
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
]

type AccountSession = {
  id: string
  status: string
  createdAt: number | null
  lastActiveAt: number | null
  browserName: string | null
  city: string | null
  country: string | null
  deviceType: string | null
  ipAddress: string | null
  isMobile: boolean
}

type SessionData = {
  history: AccountSession[]
  activeSessions: AccountSession[]
  currentSessionId: string | null
}

function formatSessionDate(value: number | null, language: Language) {
  if (!value) return "—"

  return new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function sessionLocation(session: AccountSession) {
  return [session.city, session.country].filter(Boolean).join(", ") || "—"
}

function SessionIcon({ session }: { session: AccountSession }) {
  const device = session.deviceType?.toLowerCase() ?? ""
  if (device.includes("tablet")) return <Tablet className="mr-2 h-4 w-4" />
  if (session.isMobile || device.includes("mobile") || device.includes("phone")) {
    return <Smartphone className="mr-2 h-4 w-4" />
  }
  return <Laptop className="mr-2 h-4 w-4" />
}

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings()
  const { t, lang, setLang } = useLanguage()
  const [activeSection, setActiveSection] = useState("account")
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionsError, setSessionsError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const loadSessions = async () => {
      try {
        const response = await fetch("/api/account/sessions", { signal: controller.signal })
        if (!response.ok) throw new Error("Unable to load sessions")
        const data = (await response.json()) as SessionData
        setSessionData(data)
      } catch (error) {
        if ((error as Error).name !== "AbortError") setSessionsError(true)
      } finally {
        if (!controller.signal.aborted) setSessionsLoading(false)
      }
    }

    void loadSessions()
    return () => controller.abort()
  }, [])

  const scrollTo = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">{t("Settings")}</h1>
      <div className="flex gap-10">
        <nav className="w-48 shrink-0 sticky top-24 self-start">
          <ul className="space-y-1">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === s.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {t(s.label)}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 min-w-0 divide-y divide-border">

          {/* Account */}
          <section id="account" className="scroll-mt-24 py-8 first:pt-0">
            <h2 className="text-xl font-semibold mb-4">{t("Account Settings")}</h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>{t("Current Avatar")}</Label>
                <div className="flex items-center space-x-4">
                  <UserAvatar name={settings.fullName} className="h-20 w-20 text-xl" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("Your avatar shows the initials of your name with an automatic color")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full-name">{t("Full Name")}</Label>
                <Input
                  id="full-name"
                  value={settings.fullName}
                  onChange={(e) => updateSettings({ fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth-date">{t("Date of Birth")}</Label>
                <Input
                  id="birth-date"
                  type="date"
                  value={settings.birthDate ?? ""}
                  onChange={(e) => updateSettings({ birthDate: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  {t("Age")}:{" "}
                  {ageFromBirthDate(settings.birthDate ?? "") !== null
                    ? ageFromBirthDate(settings.birthDate!)
                    : "—"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">{t("Timezone")}</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSettings({ timezone: value })}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder={t("Select Timezone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-12">{t("International Date Line West (UTC-12)")}</SelectItem>
                    <SelectItem value="utc-11">{t("Samoa Standard Time (UTC-11)")}</SelectItem>
                    <SelectItem value="utc-10">{t("Hawaii-Aleutian Standard Time (UTC-10)")}</SelectItem>
                    <SelectItem value="utc-9">{t("Alaska Standard Time (UTC-9)")}</SelectItem>
                    <SelectItem value="utc-8">{t("Pacific Time (UTC-8)")}</SelectItem>
                    <SelectItem value="utc-7">{t("Mountain Time (UTC-7)")}</SelectItem>
                    <SelectItem value="utc-6">{t("Central Time (UTC-6)")}</SelectItem>
                    <SelectItem value="utc-5">{t("Eastern Time (UTC-5)")}</SelectItem>
                    <SelectItem value="utc-4">{t("Atlantic Time (UTC-4)")}</SelectItem>
                    <SelectItem value="utc-3">{t("Argentina Standard Time (UTC-3)")}</SelectItem>
                    <SelectItem value="utc-2">{t("South Georgia Time (UTC-2)")}</SelectItem>
                    <SelectItem value="utc-1">{t("Azores Time (UTC-1)")}</SelectItem>
                    <SelectItem value="utc+0">{t("Greenwich Mean Time (UTC+0)")}</SelectItem>
                    <SelectItem value="utc+1">{t("Central European Time (UTC+1)")}</SelectItem>
                    <SelectItem value="utc+2">{t("Eastern European Time (UTC+2)")}</SelectItem>
                    <SelectItem value="utc+3">{t("Moscow Time (UTC+3)")}</SelectItem>
                    <SelectItem value="utc+4">{t("Gulf Standard Time (UTC+4)")}</SelectItem>
                    <SelectItem value="utc+5">{t("Pakistan Standard Time (UTC+5)")}</SelectItem>
                    <SelectItem value="utc+5.5">{t("Indian Standard Time (UTC+5:30)")}</SelectItem>
                    <SelectItem value="utc+6">{t("Bangladesh Standard Time (UTC+6)")}</SelectItem>
                    <SelectItem value="utc+7">{t("Indochina Time (UTC+7)")}</SelectItem>
                    <SelectItem value="utc+8">{t("China Standard Time (UTC+8)")}</SelectItem>
                    <SelectItem value="utc+9">{t("Japan Standard Time (UTC+9)")}</SelectItem>
                    <SelectItem value="utc+10">{t("Australian Eastern Standard Time (UTC+10)")}</SelectItem>
                    <SelectItem value="utc+11">{t("Solomon Islands Time (UTC+11)")}</SelectItem>
                    <SelectItem value="utc+12">{t("New Zealand Standard Time (UTC+12)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { updateSettings({ avatar: settings.avatar, fullName: settings.fullName, email: settings.email, birthDate: settings.birthDate ?? "", timezone: settings.timezone }); toast.success(t("Account settings saved successfully")) }}>
                {t("Save Account Settings")}
              </Button>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="scroll-mt-24 py-8">
            <h2 className="text-xl font-semibold mb-4">{t("Security Settings")}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t("Current Password")}</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("New Password")}</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("Confirm New Password")}</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" />
                <Label htmlFor="two-factor">{t("Enable Two-Factor Authentication")}</Label>
              </div>
              <Button>{t("Save Security Settings")}</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-6">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{t("Login History")}</h3>
                <p className="text-sm text-muted-foreground">{t("Recent login activities on your account")}</p>
                {sessionsLoading ? (
                  <p className="text-sm text-muted-foreground">{t("Loading session activity")}</p>
                ) : sessionsError ? (
                  <p className="text-sm text-destructive">{t("Unable to load session activity")}</p>
                ) : sessionData?.history.length ? (
                  sessionData.history.map((login) => (
                    <div key={login.id} className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1fr)] gap-2 text-sm">
                      <span>{formatSessionDate(login.createdAt, lang)}</span>
                      <span className="truncate" title={login.ipAddress ?? undefined}>{login.ipAddress ?? "—"}</span>
                      <span className="truncate" title={sessionLocation(login)}>{sessionLocation(login)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("No sign-ins recorded yet")}</p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{t("Active Sessions")}</h3>
                <p className="text-sm text-muted-foreground">{t("Currently active sessions on your account")}</p>
                {sessionsLoading ? (
                  <p className="text-sm text-muted-foreground">{t("Loading session activity")}</p>
                ) : sessionsError ? (
                  <p className="text-sm text-destructive">{t("Unable to load session activity")}</p>
                ) : sessionData?.activeSessions.length ? (
                  sessionData.activeSessions.map((session) => (
                    <div key={session.id} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-2 text-sm">
                      <span className="flex min-w-0 items-center truncate">
                        <SessionIcon session={session} />
                        <span className="truncate">{session.deviceType ?? t("Unknown device")}</span>
                        {session.id === sessionData.currentSessionId && (
                          <span className="ml-2 shrink-0 text-xs text-muted-foreground">{t("This device")}</span>
                        )}
                      </span>
                      <span className="truncate">{session.browserName ?? "—"}</span>
                      <span className="truncate" title={formatSessionDate(session.lastActiveAt, lang)}>
                        {formatSessionDate(session.lastActiveAt, lang)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{t("No active sessions")}</p>
                )}
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section id="notifications" className="scroll-mt-24 py-8">
            <h2 className="text-xl font-semibold mb-4">{t("Notifications")}</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    updateNotificationSettings({ ...settings.notifications, email: !!checked })
                  }
                />
                <Label htmlFor="email-notifications" className="font-medium">{t("Email Notifications")}</Label>
              </div>
              <div className="ml-6 pl-3 border-l-2 border-border space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="account-activity"
                    checked={settings.notifications.accountActivity}
                    disabled={!settings.notifications.email}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ ...settings.notifications, accountActivity: !!checked })
                    }
                  />
                  <Label htmlFor="account-activity" className={!settings.notifications.email ? "opacity-50" : ""}>{t("Account Activity")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-features"
                    checked={settings.notifications.newFeatures}
                    disabled={!settings.notifications.email}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ ...settings.notifications, newFeatures: !!checked })
                    }
                  />
                  <Label htmlFor="new-features" className={!settings.notifications.email ? "opacity-50" : ""}>{t("New Features and Updates")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={settings.notifications.marketing}
                    disabled={!settings.notifications.email}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ ...settings.notifications, marketing: !!checked })
                    }
                  />
                  <Label htmlFor="marketing" className={!settings.notifications.email ? "opacity-50" : ""}>{t("Marketing and Promotions")}</Label>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy" className="scroll-mt-24 py-8 last:pb-0">
            <h2 className="text-xl font-semibold mb-4">{t("Privacy Settings")}</h2>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">{t("Data Sharing")}</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analytics-sharing">{t("Share analytics data")}</Label>
                    <Switch
                      id="analytics-sharing"
                      checked={settings.privacy.analyticsSharing}
                      onCheckedChange={(checked) =>
                        updatePrivacySettings({ ...settings.privacy, analyticsSharing: !!checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="personalized-ads">{t("Allow personalized ads")}</Label>
                    <Switch
                      id="personalized-ads"
                      checked={settings.privacy.personalizedAds}
                      onCheckedChange={(checked) =>
                        updatePrivacySettings({ ...settings.privacy, personalizedAds: !!checked })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">{t("Account Visibility")}</h3>
                  <RadioGroup
                    value={settings.privacy.visibility}
                    onValueChange={(value: "public" | "private") => updatePrivacySettings({ ...settings.privacy, visibility: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="visibility-public" />
                      <Label htmlFor="visibility-public">{t("Public")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="visibility-private" />
                      <Label htmlFor="visibility-private">{t("Private")}</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">{t("Data Retention")}</h3>
                  <Select
                    value={settings.privacy.dataRetention}
                    onValueChange={(value) => updatePrivacySettings({ ...settings.privacy, dataRetention: value as "6-months" | "1-year" | "2-years" | "indefinite" })}
                  >
                    <SelectTrigger id="data-retention">
                      <SelectValue placeholder={t("Select Data Retention Period")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6-months">{t("6 Months")}</SelectItem>
                      <SelectItem value="1-year">{t("1 Year")}</SelectItem>
                      <SelectItem value="2-years">{t("2 Years")}</SelectItem>
                      <SelectItem value="indefinite">{t("Indefinite")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">{t("Third-Party Integrations")}</h3>
                  <p className="text-sm text-muted-foreground">{t("Connected: Google Analytics, Facebook Pixel")}</p>
                  <Button variant="outline">{t("Manage Integrations")}</Button>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline">{t("Download Your Data")}</Button>
                <Button variant="destructive">{t("Delete My Account")}</Button>
              </div>
              <Button onClick={() => { updatePrivacySettings(settings.privacy); toast.success(t("Privacy settings saved successfully")) }}>
                {t("Save Privacy Settings")}
              </Button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
