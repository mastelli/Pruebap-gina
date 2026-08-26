"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useLanguage } from "@/lib/i18n"
import {
  addFamilyMember,
  getCurrentFamilyId,
  getCurrentFamily,
  type FamilyMember,
} from "@/lib/family"

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onMemberAdded: (member: FamilyMember) => void
}

export function AddMemberModal({ isOpen, onClose, onMemberAdded }: AddMemberModalProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    status: "found" | "invited" | "self" | "invite_error" | "not_found"
    userId?: string
    name?: string | null
    email?: string
    error?: string
  } | null>(null)

  const handleSearch = async () => {
    if (!email.trim()) return
    setLoading(true)
    setResult(null)

    const familyId = getCurrentFamilyId()
    const family = getCurrentFamily()

    try {
      const res = await fetch("/api/family/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          familyId: familyId ?? "",
          familyName: family?.name ?? "",
        }),
      })
      const data = await res.json()

      setResult(data)

      if (data.status === "found") {
        toast.success(t("User found — click Add to include them"))
      } else if (data.status === "invited") {
        toast.success(t("Invitation sent"))
      } else if (data.status === "self") {
        toast.error(t("Cannot add yourself"))
      } else if (data.status === "invite_error") {
        toast.error(data.error ?? t("Error sending invitation"))
      } else {
        toast.error(t("Could not find user or send invitation"))
      }
    } catch {
      toast.error(t("Error searching for user"))
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    if (!result?.userId || !result.email) return

    const member: FamilyMember = {
      userId: result.userId,
      email: result.email,
      displayName: result.name ?? email.trim().split("@")[0],
      role: "member",
      addedAt: new Date().toISOString(),
    }

    addFamilyMember(member)
    toast.success(t("Member added"))
    onMemberAdded(member)
    setEmail("")
    setResult(null)
    onClose()
  }

  const handleClose = () => {
    setEmail("")
    setResult(null)
    onClose()
  }

  const canAdd = result?.status === "found" && result.userId

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Add Family Member")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder={t("Email address")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={loading}
            />
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={loading || !email.trim()}
            >
              {loading ? t("Searching...") : t("Search")}
            </Button>
          </div>

          {result?.status === "found" && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium">{result.name ?? result.email}</p>
              <p className="text-xs text-muted-foreground">{result.email}</p>
              <p className="text-xs text-green-600 dark:text-green-400">{t("User found in the system")}</p>
            </div>
          )}

          {result?.status === "invited" && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium">{result.email}</p>
              <p className="text-xs text-muted-foreground">{t("Invitation sent — they will receive an email to sign up")}</p>
            </div>
          )}

          {result?.status === "invite_error" && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{result.error ?? t("Error sending invitation")}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("Cancel")}
          </Button>
          {canAdd && (
            <Button onClick={handleAdd}>
              {t("Add Member")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
