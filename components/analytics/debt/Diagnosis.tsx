"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DiagnosisFlag } from "./debt-engine"

const SEVERITY_META: Record<DiagnosisFlag["severity"], { label: string; cls: string }> = {
  critical: { label: "Crítico", cls: "border-destructive bg-destructive/5 text-destructive" },
  warning: { label: "Aviso", cls: "border-amber-400 bg-amber-50 text-amber-700" },
  ok: { label: "OK", cls: "border-green-500 bg-green-50 text-green-700" },
}

export function Diagnosis({ flags }: { flags: DiagnosisFlag[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnóstico automático</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {flags.map((f) => {
          const meta = SEVERITY_META[f.severity]
          return (
            <div key={f.key} className={`rounded-lg border p-3 ${meta.cls}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{f.title}</p>
                <Badge variant="outline" className={meta.cls}>
                  {meta.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm">{f.detail}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
