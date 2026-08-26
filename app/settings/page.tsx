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
import { useState } from "react"
import { toast } from "sonner"
import { useLanguage, type Language } from "@/lib/i18n"

const sections = [
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
]

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings()
  const { t, lang, setLang } = useLanguage()
  const [activeSection, setActiveSection] = useState("account")

  const scrollTo = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">{t("Settings")}</h1>
      <div className="flex gap-10">
        {/* Sidebar index */}
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

        {/* Content */}
        <div className="flex-1 space-y-10 min-w-0">

          {/* Account */}
          <section id="account" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>{t("Account Settings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>
          </section>

          {/* Security */}
          <section id="security" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>{t("Security Settings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("Login History")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { date: "2023-07-20", time: "14:30 UTC", ip: "192.168.1.1", location: "New York, USA" },
                    { date: "2023-07-19", time: "09:15 UTC", ip: "10.0.0.1", location: "London, UK" },
                    { date: "2023-07-18", time: "22:45 UTC", ip: "172.16.0.1", location: "Tokyo, Japan" },
                  ].map((login, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{login.date} {login.time}</span>
                      <span>{login.ip}</span>
                      <span>{t(login.location)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("Active Sessions")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { device: "Laptop", browser: "Chrome", os: "Windows 10", icon: Laptop },
                    { device: "Smartphone", browser: "Safari", os: "iOS 15", icon: Smartphone },
                    { device: "Tablet", browser: "Firefox", os: "Android 12", icon: Tablet },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <session.icon className="mr-2 h-4 w-4" />
                        {t(session.device)}
                      </span>
                      <span>{session.browser}</span>
                      <span>{session.os}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Notifications */}
          <section id="notifications" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>{t("Notifications")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          </section>

          {/* Privacy */}
          <section id="privacy" className="scroll-mt-24">
            <Card>
              <CardHeader>
                <CardTitle>{t("Privacy Settings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("Data Sharing")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
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
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("Account Visibility")}</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("Data Retention")}</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{t("Third-Party Integrations")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t("Connected: Google Analytics, Facebook Pixel")}</p>
                      <Button variant="outline">{t("Manage Integrations")}</Button>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline">{t("Download Your Data")}</Button>
                  <Button variant="destructive">{t("Delete My Account")}</Button>
                </div>
                <Button onClick={() => { updatePrivacySettings(settings.privacy); toast.success(t("Privacy settings saved successfully")) }}>
                  {t("Save Privacy Settings")}
                </Button>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  )
}
