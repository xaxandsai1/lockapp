"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Counts = {
  all: number
  pending: number
  submitted: number
  approved: number
  rejected: number
}

export function TaskStatusFilter({
  current,
  counts,
  className,
}: {
  current: "all" | "pending" | "submitted" | "approved" | "rejected"
  counts: Counts
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setStatus = (status: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("status", status)
    router.push(`${pathname}?${params.toString()}`)
  }

  const items = [
    { key: "pending", label: `Oczekujące (${counts.pending})` },
    { key: "submitted", label: `Przesłane (${counts.submitted})` },
    { key: "approved", label: `Zatwierdzone (${counts.approved})` },
    { key: "rejected", label: `Odrzucone (${counts.rejected})` },
    { key: "all", label: `Wszystkie (${counts.all})` },
  ] as const

  return (
    <div className={cn("flex w-full items-center gap-3", className)}>
      {/* Mobile: Select */}
      <div className="flex md:hidden w-full">
        <Select defaultValue={current} onValueChange={setStatus}>
          <SelectTrigger className="w-full bg-slate-900/70 border-slate-800">
            <SelectValue placeholder="Filtruj zadania" />
          </SelectTrigger>
          <SelectContent>
            {items.map((i) => (
              <SelectItem key={i.key} value={i.key}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: proste „pill buttons” w jednej linii */}
      <div className="hidden md:flex flex-wrap items-center gap-2">
        {items.map((i) => (
          <Button
            key={i.key}
            variant={current === i.key ? "default" : "outline"}
            className={
              current === i.key
                ? "bg-slate-800 text-slate-100"
                : "border-slate-700 text-slate-200 hover:bg-slate-800"
            }
            size="sm"
            onClick={() => setStatus(i.key)}
          >
            {i.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
