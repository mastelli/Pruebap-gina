"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Recommendation } from "./debt-engine"

export function Recommendations({ recs }: { recs: Recommendation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recomendaciones personalizadas</CardTitle>
      </CardHeader>
      <CardContent>
        {recs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin recomendaciones con los datos actuales.</p>
        ) : (
          <ol className="space-y-2">
            {recs.map((r, idx) => (
              <li key={idx} className="flex gap-3 rounded-lg border p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {idx + 1}
                </span>
                <p className="text-sm">{r.text}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
