"use client"

// Ciculo con las iniciales del usuario: primera letra del nombre y primera
// del apellido, sobre un color de fondo pseudo-aleatorio derivado del nombre
// (distinto para cada persona pero estable entre sesiones)

function hashHue(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
}

export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : ""
  return (first + last).toUpperCase() || "?"
}

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  const hue = hashHue(name.trim().toLowerCase())
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className ?? ""}`}
      style={{ backgroundColor: `hsl(${hue} 55% 45%)` }}
    >
      {initialsOf(name)}
    </div>
  )
}
