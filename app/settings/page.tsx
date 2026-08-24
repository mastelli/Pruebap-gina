"use client"

import { useSettings } from "@/contexts/settings-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { UserAvatar } from "@/components/user-avatar"
import { Laptop, Smartphone, Tablet } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useLanguage, type Language } from "@/lib/i18n"

export default function SettingsPage() {
  const { settings, updateSettings, updateNotificationSettings, updatePrivacySettings } = useSettings()
  const { t, lang, setLang } = useLanguage()

  const handleSaveAccount = () => {
    updateSettings({
      avatar: settings.avatar,
      fullName: settings.fullName,
      email: settings.email,
      phone: settings.phone,
      timezone: settings.timezone,
    })
    toast.success(t("Account settings saved successfully"))
  }

  const handleSaveNotifications = () => {
    updateNotificationSettings(settings.notifications)
    toast.success(t("Notification settings saved successfully"))
  }

  const handleSavePrivacy = () => {
    updatePrivacySettings(settings.privacy)
    toast.success(t("Privacy settings saved successfully"))
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t("Settings")}</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">{t("Account")}</TabsTrigger>
          <TabsTrigger value="security">{t("Security")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("Preferences")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("Notifications")}</TabsTrigger>
          <TabsTrigger value="privacy">{t("Privacy")}</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t("Account Settings")}</CardTitle>
              <CardDescription>{t("Manage your account information")}</CardDescription>
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
                <Label htmlFor="phone">{t("Phone Number")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                />
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
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAccount}>{t("Save Account Settings")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t("Security Settings")}</CardTitle>
                <CardDescription>{t("Manage your account's security settings")}</CardDescription>
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
              </CardContent>
              <CardFooter>
                <Button>{t("Save Security Settings")}</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Login History")}</CardTitle>
                <CardDescription>{t("Recent login activities on your account")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { date: "2023-07-20", time: "14:30 UTC", ip: "192.168.1.1", location: "New York, USA" },
                  { date: "2023-07-19", time: "09:15 UTC", ip: "10.0.0.1", location: "London, UK" },
                  { date: "2023-07-18", time: "22:45 UTC", ip: "172.16.0.1", location: "Tokyo, Japan" },
                ].map((login, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>
                      {login.date} {login.time}
                    </span>
                    <span>{login.ip}</span>
                    <span>{t(login.location)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Active Sessions")}</CardTitle>
                <CardDescription>{t("Currently active sessions on your account")}</CardDescription>
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
              <CardFooter>
                <Button variant="outline">{t("Log Out All Other Sessions")}</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{t("Preferences")}</CardTitle>
              <CardDescription>{t("Customize your dashboard experience")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">{t("Language")}</Label>
                  <Select value={lang} onValueChange={(value) => setLang(value as Language)}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder={t("Select Language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Castellano</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("Currency")}</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder={t("Select Currency")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">{t("Date Format")}</Label>
                  <Select defaultValue="mm-dd-yyyy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder={t("Select Date Format")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">{t("Font Size")}</Label>
                  <Slider defaultValue={[16]} max={24} min={12} step={1} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("Theme")}</Label>
                <RadioGroup defaultValue="system">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">{t("Light")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">{t("Dark")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="theme-system" />
                    <Label htmlFor="theme-system">{t("System")}</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>{t("Dashboard Layout")}</Label>
                <RadioGroup defaultValue="default">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="layout-default" />
                    <Label htmlFor="layout-default">{t("Default")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="compact" id="layout-compact" />
                    <Label htmlFor="layout-compact">{t("Compact")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expanded" id="layout-expanded" />
                    <Label htmlFor="layout-expanded">{t("Expanded")}</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button>{t("Save Preferences")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("Notification Settings")}</CardTitle>
              <CardDescription>{t("Manage how you receive notifications")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("Notification Channels")}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-notifications"
                      defaultChecked={settings.notifications.email}
                      onChange={(e) =>
                        updateNotificationSettings({ ...settings.notifications, email: e.target.checked })
                      }
                    />
                    <Label htmlFor="email-notifications">{t("Email Notifications")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="push-notifications"
                      defaultChecked={settings.notifications.push}
                      onChange={(e) =>
                        updateNotificationSettings({ ...settings.notifications, push: e.target.checked })
                      }
                    />
                    <Label htmlFor="push-notifications">{t("Push Notifications")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-notifications"
                      defaultChecked={settings.notifications.sms}
                      onChange={(e) => updateNotificationSettings({ ...settings.notifications, sms: e.target.checked })}
                    />
                    <Label htmlFor="sms-notifications">{t("SMS Notifications")}</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("Notification Types")}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="account-activity"
                      defaultChecked={settings.notifications.accountActivity}
                      onChange={(e) =>
                        updateNotificationSettings({ ...settings.notifications, accountActivity: e.target.checked })
                      }
                    />
                    <Label htmlFor="account-activity">{t("Account Activity")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="new-features"
                      defaultChecked={settings.notifications.newFeatures}
                      onChange={(e) =>
                        updateNotificationSettings({ ...settings.notifications, newFeatures: e.target.checked })
                      }
                    />
                    <Label htmlFor="new-features">{t("New Features and Updates")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      defaultChecked={settings.notifications.marketing}
                      onChange={(e) =>
                        updateNotificationSettings({ ...settings.notifications, marketing: e.target.checked })
                      }
                    />
                    <Label htmlFor="marketing">{t("Marketing and Promotions")}</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-frequency">{t("Notification Frequency")}</Label>
                <Select
                  value={settings.notifications.frequency}
                  onValueChange={(value) => updateNotificationSettings({ ...settings.notifications, frequency: value })}
                >
                  <SelectTrigger id="notification-frequency">
                    <SelectValue placeholder={t("Select Frequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">{t("Real-time")}</SelectItem>
                    <SelectItem value="daily">{t("Daily Digest")}</SelectItem>
                    <SelectItem value="weekly">{t("Weekly Summary")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-hours-start">{t("Quiet Hours")}</Label>
                <div className="flex items-center space-x-2">
                  <Input id="quiet-hours-start" type="time" defaultValue="22:00" />
                  <span>{t("to")}</span>
                  <Input id="quiet-hours-end" type="time" defaultValue="07:00" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>{t("Save Notification Settings")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>{t("Privacy Settings")}</CardTitle>
              <CardDescription>{t("Manage your privacy and data settings")}</CardDescription>
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
                        onChange={(e) =>
                          updatePrivacySettings({ ...settings.privacy, analyticsSharing: e.target.checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="personalized-ads">{t("Allow personalized ads")}</Label>
                      <Switch
                        id="personalized-ads"
                        checked={settings.privacy.personalizedAds}
                        onChange={(e) =>
                          updatePrivacySettings({ ...settings.privacy, personalizedAds: e.target.checked })
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
                      onValueChange={(value) => updatePrivacySettings({ ...settings.privacy, visibility: value })}
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
                      onValueChange={(value) => updatePrivacySettings({ ...settings.privacy, dataRetention: value })}
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
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePrivacy}>{t("Save Privacy Settings")}</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

