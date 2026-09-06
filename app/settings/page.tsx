"use client"

import { useSettings } from "@/contexts/settings-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
              <div className="space-y-3">
                <h3 className="text-lg font-medium">{t("Cookie Preferences")}</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("Essential cookies are always active")}</Label>
                    <p className="text-sm text-muted-foreground">{t("They are required for the service to work.")}</p>
                  </div>
                  <Switch checked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics-cookies">{t("Cookie type analytics")}</Label>
                  <Switch
                    id="analytics-cookies"
                    checked={
                      settings.privacy.cookies?.analytics ?? true
                    }
                    onCheckedChange={(checked) =>
                      updatePrivacySettings({ ...settings.privacy, cookies: { ...settings.privacy.cookies, analytics: !!checked } })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-cookies">{t("Cookie type marketing")}</Label>
                  <Switch
                    id="marketing-cookies"
                    checked={
                      settings.privacy.cookies?.marketing ?? false
                    }
                    onCheckedChange={(checked) =>
                      updatePrivacySettings({ ...settings.privacy, cookies: { ...settings.privacy.cookies, marketing: !!checked } })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("You can see more details in our")}{" "}
                  <a className="text-primary underline underline-offset-4 hover:text-primary/80" href="/cookies">
                    {t("Cookie Policy")}
                  </a>
                </p>
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
