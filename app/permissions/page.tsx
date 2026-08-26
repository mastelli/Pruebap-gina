"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Users, Save } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/i18n"
import {
  getCurrentFamily,
  getFamilyMembers,
  getMemberPermissions,
  setMemberPermissions,
  type FamilyUnit,
  type FamilyMember,
  type FamilyPermissions,
} from "@/lib/family"
import { getAuthUserId } from "@/lib/auth"

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-primary" : "bg-input"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export default function PermissionsPage() {
  const { t } = useLanguage()
  const [family, setFamily] = useState<FamilyUnit | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [permissions, setPermissions] = useState<Record<string, FamilyPermissions>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const existing = getCurrentFamily()
    if (existing) {
      setFamily(existing)
      const mems = getFamilyMembers()
      setMembers(mems)
      const perms: Record<string, FamilyPermissions> = {}
      for (const m of mems) {
        perms[m.userId] = getMemberPermissions(m.userId)
      }
      setPermissions(perms)
    }
  }, [])

  const currentUserId = getAuthUserId()
  const isAdmin = family?.createdBy === currentUserId

  const updatePermission = (userId: string, key: keyof FamilyPermissions, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [key]: value },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    for (const [userId, perms] of Object.entries(permissions)) {
      setMemberPermissions(userId, perms)
    }
    setHasChanges(false)
    toast.success(t("Permissions saved"))
  }

  if (!family) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("Permissions")}</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("You need to create a family unit first to manage permissions.")}
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/members"}>
              {t("Go to Members")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("Permissions")}</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("Only the family admin can manage permissions.")}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const otherMembers = members.filter((m) => m.userId !== currentUserId)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">{t("Permissions")}</h1>
            <p className="text-sm text-muted-foreground">{family.name}</p>
          </div>
        </div>
        {hasChanges && (
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> {t("Save")}
          </Button>
        )}
      </div>

      {otherMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("No other family members to set permissions for.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {otherMembers.map((member) => {
            const perms = permissions[member.userId] ?? { viewSummary: true, manageMembers: false }
            return (
              <Card key={member.userId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{member.displayName}</CardTitle>
                      {member.email && (
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{t(member.role)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("View Account Summary")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("Can see income, expenses and balance")}
                      </p>
                    </div>
                    <Toggle
                      checked={perms.viewSummary}
                      onChange={(v) => updatePermission(member.userId, "viewSummary", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("Manage Members")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("Can add and remove family members")}
                      </p>
                    </div>
                    <Toggle
                      checked={perms.manageMembers}
                      onChange={(v) => updatePermission(member.userId, "manageMembers", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
