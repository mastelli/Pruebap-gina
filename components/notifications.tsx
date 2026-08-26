"use client"

import { useEffect, useState, useCallback } from "react"
import { Bell, X, Users, Check, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/lib/i18n"
import { fetchMyRequests, respondToRequest, type FamilyRequest } from "@/lib/family"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [requests, setRequests] = useState<FamilyRequest[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()
  const { userId } = useAuth()

  const loadRequests = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const data = await fetchMyRequests()
    setRequests(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (isOpen) loadRequests()
  }, [isOpen, loadRequests])

  const handleResponse = async (requestId: string, response: "accepted" | "rejected") => {
    const result = await respondToRequest(requestId, response)
    if (result.ok) {
      toast.success(response === "accepted" ? t("Request accepted") : t("Request rejected"))
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } else {
      toast.error(result.error ?? t("Error"))
    }
  }

  const pendingCount = requests.length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("Notifications")}
      >
        <Bell className="h-5 w-5" />
        {pendingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {pendingCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <Card className="absolute right-0 mt-2 w-96 z-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Notifications")}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label={t("Close notifications")}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t("No pending requests")}</p>
                </div>
              ) : (
                requests.map((request) => (
                  <Card key={request.id} className="mb-3 last:mb-0 border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium">
                            {request.fromUserName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("wants you to join")} <span className="font-medium">{request.familyName}</span>
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-7 px-3"
                              onClick={() => handleResponse(request.id, "accepted")}
                            >
                              <Check className="mr-1 h-3 w-3" /> {t("Accept")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3"
                              onClick={() => handleResponse(request.id, "rejected")}
                            >
                              <XIcon className="mr-1 h-3 w-3" /> {t("Reject")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
