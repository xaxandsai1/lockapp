"use client"

import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type Size = "sm" | "md"
export function VerifiedBadge({ size = "md", className }: { size?: Size; className?: string }) {
  const dims = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  return (
    <span
      aria-label="Zweryfikowane konto"
      title="Zweryfikowane konto"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-blue-600/90 text-white ring-1 ring-blue-400/50",
        size === "sm" ? "p-0.5" : "p-1",
        className,
      )}
    >
      <ShieldCheck className={dims} />
    </span>
  )
}
