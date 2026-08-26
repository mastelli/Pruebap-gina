"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Users, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/i18n"
import {
  getCurrentFamily,
  createFamily,
  getFamilyMembers,
  removeFamilyMember,
  type FamilyUnit,
  type FamilyMember,
} from "@/lib/family"
import { FamilyMemberCard } from "@/components/family-member-card"
import { AddMemberModal } from "@/components/add-member-modal"

function formatCurrency(value: number): string {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
}

export default function MembersPage() {
  const { t } = useLanguage()
  const [family, setFamily] = useState<FamilyUnit | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [creatingName, setCreatingName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const existing = getCurrentFamily()
    if (existing) {
      setFamily(existing)
      setMembers(getFamilyMembers())
    }
  }, [])

  const handleCreateFamily = () => {
    if (!creatingName.trim()) return
    setIsCreating(true)
    try {
      const newFamily = createFamily(creatingName.trim())
      setFamily(newFamily)
      setMembers(getFamilyMembers())
      setCreatingName("")
      toast.success(t("Family created"))
    } catch {
      toast.error(t("Error creating family"))
    } finally {
      setIsCreating(false)
    }
  }

  const handleMemberAdded = (member: FamilyMember) => {
    setMembers(getFamilyMembers())
  }

  const handleRemoveMember = (userId: string) => {
    removeFamilyMember(userId)
    setMembers(getFamilyMembers())
    toast.success(t("Member removed"))
  }

  if (!family) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("Members")}</h1>
        </div>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("Create Family Unit")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("Create a family unit to share account summaries with your family members.")}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={t("Family name")}
                value={creatingName}
                onChange={(e) => setCreatingName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFamily()}
                disabled={isCreating}
              />
              <Button onClick={handleCreateFamily} disabled={isCreating || !creatingName.trim()}>
                {t("Create")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">{t("Members")}</h1>
            <p className="text-sm text-muted-foreground">{family.name}</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t("Add Member")}
        </Button>
      </div>

      {members.length <= 1 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("No family members yet. Add members to see their account summaries.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members
            .filter((m) => m.userId !== family.createdBy || m.role === "admin")
            .map((member) => (
              <div key={member.userId} className="relative group">
                <FamilyMemberCard member={member} />
                {member.role !== "admin" && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title={t("Remove member")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  )
}
