"use client"

import { useSettings } from "@/contexts/settings-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserAvatar } from "@/components/user-avatar"
import { ageFromBirthDate } from "@/lib/auth"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/i18n"

const sections = [
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "privacy", label: "Privacy" },
]

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings()
  const { t } = useLanguage()
  const { user, isLoaded: isUserLoaded } = useUser()
  const [activeSection, setActiveSection] = useState("account")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const scrollTo = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t("Complete all password fields"))
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("Passwords do not match"))
      return
    }
    if (!user) {
      toast.error(t("Unable to update password"))
      return
    }

    setIsChangingPassword(true)
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success(t("Password updated successfully"))
    } catch {
      toast.error(t("Unable to update password"))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const updateNotifications = (changes: Partial<typeof settings.notifications>) => {
    const nextNotifications = { ...settings.notifications, ...changes }
    updateNotificationSettings(nextNotifications)

    void fetch("/api/notification-preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: nextNotifications.email,
        accountActivity: nextNotifications.accountActivity,
        newFeatures: nextNotifications.newFeatures,
        marketing: nextNotifications.marketing,
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to save notification preferences")
        toast.success(t("Notification preferences saved"))
      })
      .catch(() => toast.error(t("Unable to save notification preferences")))
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
              <Button onClick={() => { updateSettings({ avatar: settings.avatar, fullName: settings.fullName, email: settings.email, birthDate: settings.birthDate ?? "" }); toast.success(t("Account settings saved successfully")) }}>
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
                <Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("New Password")}</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("Confirm New Password")}</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" />
                <Label htmlFor="two-factor">{t("Enable Two-Factor Authentication")}</Label>
              </div>
              <Button onClick={changePassword} disabled={isChangingPassword || !isUserLoaded}>
                {t("Save Security Settings")}
              </Button>
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
                  onCheckedChange={(checked) => updateNotifications({ email: !!checked })}
                />
                <Label htmlFor="email-notifications" className="font-medium">{t("Email Notifications")}</Label>
              </div>
              <div className="ml-6 pl-3 border-l-2 border-border space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="account-activity"
                    checked={settings.notifications.accountActivity}
                    disabled={!settings.notifications.email}
                    onCheckedChange={(checked) => updateNotifications({ accountActivity: !!checked })}
                  />
                  <Label htmlFor="account-activity" className={!settings.notifications.email ? "opacity-50" : ""}>{t("Account Activity")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-features"
                    checked={settings.notifications.newFeatures}
                    disabled={!settings.notifications.email}
                    onCheckedChange={(checked) => updateNotifications({ newFeatures: !!checked })}
                  />
                  <Label htmlFor="new-features" className={!settings.notifications.email ? "opacity-50" : ""}>{t("New Features and Updates")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={settings.notifications.marketing}
                    disabled={!settings.notifications.email}
                    onCheckedChange={(checked) => updateNotifications({ marketing: !!checked })}
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
