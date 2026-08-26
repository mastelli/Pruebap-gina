"use client"

import { storageGetItem, storageSetItem, getAuthUserId, onStorageVersionChange } from "@/lib/auth"
import { getSupabaseClient } from "@/lib/supabase"

const TABLE = "user_data"

export interface FamilyUnit {
  id: string
  name: string
  createdBy: string
  createdAt: string
}

export interface FamilyMember {
  userId: string
  email: string
  displayName: string
  role: "admin" | "member" | "viewer"
  addedAt: string
  status?: "active" | "pending"
  inviteUrl?: string
}

export interface FamilyPermissions {
  viewSummary: boolean
  manageMembers: boolean
}

export interface FamilyMemberWithPermissions extends FamilyMember {
  permissions: FamilyPermissions
}

function familyStorageKey(familyId: string): string {
  return `familyUnit::${familyId}`
}

function familyMembersKey(familyId: string): string {
  return `familyMembers::${familyId}`
}

function familyPermissionsKey(familyId: string, userId: string): string {
  return `familyPerms::${familyId}::${userId}`
}

function userFamilyKey(): string {
  return "userFamilyId"
}

function generateId(): string {
  return `fam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/* ── Current user's family ── */

export function getCurrentFamilyId(): string | null {
  const stored = storageGetItem(userFamilyKey())
  return stored ? JSON.parse(stored) : null
}

export function setCurrentFamilyId(familyId: string | null): void {
  storageSetItem(userFamilyKey(), JSON.stringify(familyId))
}

export function getCurrentFamily(): FamilyUnit | null {
  const familyId = getCurrentFamilyId()
  if (!familyId) return null
  const stored = storageGetItem(familyStorageKey(familyId))
  return stored ? JSON.parse(stored) : null
}

export function setCurrentFamily(family: FamilyUnit): void {
  storageSetItem(familyStorageKey(family.id), JSON.stringify(family))
  setCurrentFamilyId(family.id)
}

export function getFamilyMembers(): FamilyMember[] {
  const familyId = getCurrentFamilyId()
  if (!familyId) return []
  const stored = storageGetItem(familyMembersKey(familyId))
  return stored ? JSON.parse(stored) : []
}

export function setFamilyMembers(members: FamilyMember[]): void {
  const familyId = getCurrentFamilyId()
  if (!familyId) return
  storageSetItem(familyMembersKey(familyId), JSON.stringify(members))
}

export function getMemberPermissions(memberUserId: string): FamilyPermissions {
  const familyId = getCurrentFamilyId()
  if (!familyId) return { viewSummary: true, manageMembers: false }
  const stored = storageGetItem(familyPermissionsKey(familyId, memberUserId))
  return stored ? JSON.parse(stored) : { viewSummary: true, manageMembers: false }
}

export function setMemberPermissions(memberUserId: string, permissions: FamilyPermissions): void {
  const familyId = getCurrentFamilyId()
  if (!familyId) return
  storageSetItem(familyPermissionsKey(familyId, memberUserId), JSON.stringify(permissions))
}

/* ── Actions ── */

export function createFamily(name: string): FamilyUnit {
  const userId = getAuthUserId()
  if (!userId) throw new Error("Not authenticated")

  const family: FamilyUnit = {
    id: generateId(),
    name,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  }

  setCurrentFamily(family)

  const adminMember: FamilyMember = {
    userId,
    email: "",
    displayName: "Admin",
    role: "admin",
    addedAt: new Date().toISOString(),
  }
  setFamilyMembers([adminMember])

  return family
}

export function addFamilyMember(member: Omit<FamilyMember, "addedAt">): FamilyMember[] {
  const members = getFamilyMembers()
  if (members.some((m) => m.userId === member.userId)) return members

  const newMember: FamilyMember = { ...member, addedAt: new Date().toISOString() }
  const updated = [...members, newMember]
  setFamilyMembers(updated)

  setMemberPermissions(member.userId, { viewSummary: true, manageMembers: false })

  return updated
}

export function removeFamilyMember(userId: string): FamilyMember[] {
  const members = getFamilyMembers().filter((m) => m.userId !== userId)
  setFamilyMembers(members)
  return members
}

export function updateMemberRole(userId: string, role: FamilyMember["role"]): FamilyMember[] {
  const members = getFamilyMembers().map((m) => (m.userId === userId ? { ...m, role } : m))
  setFamilyMembers(members)
  return members
}

/* ── Fetch other user's data from Supabase ── */

export async function fetchUserTransactions(userId: string): Promise<{ id: string; name: string; amount: number; date: string }[]> {
  try {
    const db = getSupabaseClient()
    const key = `appTransactions::${userId}`
    const { data, error } = await db
      .from(TABLE)
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle()
    if (error || !data?.value) return []
    const val = data.value
    if (typeof val === "string") return JSON.parse(val)
    if (Array.isArray(val)) return val
    return []
  } catch {
    return []
  }
}

export async function fetchUserBalance(userId: string): Promise<number | null> {
  try {
    const db = getSupabaseClient()
    const key = `appCheckingBalance::${userId}`
    const { data, error } = await db
      .from(TABLE)
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle()
    if (error || !data?.value) return null
    const raw = data.value
    const num = typeof raw === "string" ? Number.parseFloat(raw) : typeof raw === "number" ? raw : null
    return num !== null && !Number.isNaN(num) ? num : null
  } catch {
    return null
  }
}

export interface MemberAccountSummary {
  userId: string
  displayName: string
  email: string
  role: FamilyMember["role"]
  monthlyIncome: number
  monthlyExpenses: number
  checkingBalance: number | null
  yearlyIncome: number
  yearlyExpenses: number
  monthlyIncomeAverage: number
  monthlyExpenseAverage: number
}

export async function fetchMemberAccountSummary(member: FamilyMember): Promise<MemberAccountSummary> {
  const transactions = await fetchUserTransactions(member.userId)
  const balance = await fetchUserBalance(member.userId)

  const now = new Date()
  const currentYear = `${now.getFullYear()}`
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0")
  const monthsElapsed = now.getMonth() + 1

  const monthlyIncome = transactions
    .filter((t) => t.amount > 0 && t.date.startsWith(currentYear) && t.date.slice(5, 7) === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = transactions
    .filter((t) => t.amount < 0 && t.date.startsWith(currentYear) && t.date.slice(5, 7) === currentMonth)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const yearlyIncome = transactions
    .filter((t) => t.amount > 0 && t.date.startsWith(currentYear))
    .reduce((sum, t) => sum + t.amount, 0)

  const yearlyExpenses = transactions
    .filter((t) => t.amount < 0 && t.date.startsWith(currentYear))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return {
    userId: member.userId,
    displayName: member.displayName,
    email: member.email,
    role: member.role,
    monthlyIncome,
    monthlyExpenses,
    checkingBalance: balance,
    yearlyIncome,
    yearlyExpenses,
    monthlyIncomeAverage: monthsElapsed > 0 ? yearlyIncome / monthsElapsed : 0,
    monthlyExpenseAverage: monthsElapsed > 0 ? yearlyExpenses / monthsElapsed : 0,
  }
}
