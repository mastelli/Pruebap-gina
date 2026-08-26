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
import { addFamilyMember, type FamilyMember } from "@/lib/family"

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
    found: boolean
    userId?: string
    name?: string | null
    email?: string
    reason?: string
  } | null>(null)

  const handleSearch = async () => {
    if (!email.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/family/lookup?email=${encodeURIComponent(email.trim())}`)
      const data = await res.json()
        setResult(data)
      if (!data.found) {
        if (data.reason === "self") {
          toast.error(t("Cannot add yourself"))
        } else if (data.error) {
          toast.error(data.error)
        } else {
          toast.error(t("User not found with that email"))
        }
      }
    } catch {
      toast.error(t("Error searching for user"))
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    if (!result?.found || !result.userId) return

    const member: FamilyMember = {
      userId: result.userId,
      email: result.email ?? email.trim(),
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

          {result?.found && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium">{result.name ?? result.email}</p>
              <p className="text-xs text-muted-foreground">{result.email}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("Cancel")}
          </Button>
          {result?.found && (
            <Button onClick={handleAdd}>
              {t("Add Member")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
