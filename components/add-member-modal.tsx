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
import { Copy, ExternalLink } from "lucide-react"
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

type Result =
  | { status: "found"; userId: string; email: string; name: string | null }
  | { status: "self" }
  | { status: "not_found"; email: string; inviteUrl: string | null }
  | { status: "error"; message: string }
  | null

export function AddMemberModal({ isOpen, onClose, onMemberAdded }: AddMemberModalProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [copied, setCopied] = useState(false)

  const handleSearch = async () => {
    if (!email.trim()) return
    setLoading(true)
    setResult(null)
    setCopied(false)

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

      if (data.status === "found") {
        setResult({ status: "found", userId: data.userId, email: data.email, name: data.name })
        toast.success(t("User found"))
      } else if (data.status === "self") {
        setResult({ status: "self" })
        toast.error(t("Cannot add yourself"))
      } else if (data.status === "not_found") {
        setResult({ status: "not_found", email: data.email, inviteUrl: data.inviteUrl ?? null })
      } else {
        setResult({ status: "error", message: data.error ?? t("Unknown error") })
        toast.error(data.error ?? t("Unknown error"))
      }
    } catch {
      setResult({ status: "error", message: t("Error searching for user") })
      toast.error(t("Error searching for user"))
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    if (result?.status !== "found" || !result.userId) return

    const member: FamilyMember = {
      userId: result.userId,
      email: result.email,
      displayName: result.name ?? email.trim().split("@")[0],
      role: "member",
      addedAt: new Date().toISOString(),
      status: "active",
    }

    addFamilyMember(member)
    toast.success(t("Member added"))
    onMemberAdded(member)
    setEmail("")
    setResult(null)
    onClose()
  }

  const handleAddPending = () => {
    if (result?.status !== "not_found") return

    const member: FamilyMember = {
      userId: `pending-${Date.now()}`,
      email: result.email,
      displayName: result.email.split("@")[0],
      role: "member",
      addedAt: new Date().toISOString(),
      status: "pending",
      inviteUrl: result.inviteUrl ?? undefined,
    }

    addFamilyMember(member)
    toast.success(t("Member added as pending"))
    onMemberAdded(member)
    setEmail("")
    setResult(null)
    onClose()
  }

  const handleCopyLink = async () => {
    if (result?.status !== "not_found" || !result.inviteUrl) return
    try {
      await navigator.clipboard.writeText(result.inviteUrl)
      setCopied(true)
      toast.success(t("Link copied"))
    } catch {
      toast.error(t("Error copying link"))
    }
  }

  const handleClose = () => {
    setEmail("")
    setResult(null)
    setCopied(false)
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

          {result?.status === "found" && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
              <p className="text-sm font-medium">{result.name ?? result.email}</p>
              <p className="text-xs text-muted-foreground">{result.email}</p>
            </div>
          )}

          {result?.status === "not_found" && (
            <div className="rounded-lg border bg-muted/50 p-3 space-y-3">
              <p className="text-sm font-medium">{result.email}</p>
              <p className="text-xs text-muted-foreground">
                {t("User not registered yet")}
              </p>
              {result.inviteUrl && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t("Share this invitation link")}
                  </p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={result.inviteUrl}
                      className="text-xs h-8 flex-1 font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      {copied ? "✓" : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {result?.status === "self" && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">{t("Cannot add yourself")}</p>
            </div>
          )}

          {result?.status === "error" && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">{result.message}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            {t("Cancel")}
          </Button>
          {result?.status === "found" && (
            <Button onClick={handleAdd}>{t("Add Member")}</Button>
          )}
          {result?.status === "not_found" && (
            <Button onClick={handleAddPending}>{t("Add as Pending")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
