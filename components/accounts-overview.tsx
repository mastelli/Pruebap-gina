"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Upload, Send, CreditCard, MoreHorizontal } from "lucide-react"
import { SendMoneyModal } from "./send-money-modal"
import { RequestMoneyModal } from "./request-money-modal"
import { useLanguage } from "@/lib/i18n"
import { parseNorma43Expenses } from "@/lib/norma43"

const initialAccounts = [
  { name: "Checking", balance: 7500 },
  { name: "Savings", balance: 560000 },
  { name: "Investment", balance: 5879000 },
]

export function AccountsOverview() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false)
  const [isRequestMoneyModalOpen, setIsRequestMoneyModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const handleSendMoney = (amount, fromAccount) => {
    setAccounts(
      accounts.map((account) =>
        account.name === fromAccount ? { ...account, balance: account.balance - amount } : account,
      ),
    )
  }

  const handleRequestMoney = (amount, contact) => {
    console.log(`Requested $${amount} from ${contact.name}`)
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const expenses = parseNorma43Expenses(content)

      if (expenses.length === 0) {
        toast.error(t("No expenses found in the file"))
        return
      }

      const totalExpenses = Math.abs(expenses.reduce((sum, expense) => sum + expense.amount, 0))

      setAccounts((prev) =>
        prev.map((account) =>
          account.name === "Checking" ? { ...account, balance: account.balance - totalExpenses } : account,
        ),
      )

      toast.success(`${expenses.length} ${t("expenses imported")}`)
    } catch {
      toast.error(t("Error reading the file"))
    } finally {
      event.target.value = ""
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t("Accounts Overview")}</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {accounts.map((account) => (
            <div key={account.name} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t(account.name)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" className="col-span-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" /> {t("Add bank statement")}
          </Button>
          <Button size="sm" onClick={() => setIsSendMoneyModalOpen(true)}>
            <Send className="mr-2 h-4 w-4" /> {t("Send")}
          </Button>
          <Button size="sm" onClick={() => setIsRequestMoneyModalOpen(true)}>
            <CreditCard className="mr-2 h-4 w-4" /> {t("Request")}
          </Button>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="mr-2 h-4 w-4" /> {t("More")}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".43,.txt,text/plain"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardContent>
      <SendMoneyModal
        isOpen={isSendMoneyModalOpen}
        onClose={() => setIsSendMoneyModalOpen(false)}
        onSendMoney={handleSendMoney}
        accounts={accounts}
      />
      <RequestMoneyModal
        isOpen={isRequestMoneyModalOpen}
        onClose={() => setIsRequestMoneyModalOpen(false)}
        onRequestMoney={handleRequestMoney}
      />
    </Card>
  )
}
