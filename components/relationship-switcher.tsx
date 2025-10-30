"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Relationship = {
  id: string
  partner: {
    display_name: string
    avatar_url?: string | null
    country?: string | null
  } | null
}

export function RelationshipSwitcher({
  relationships,
  selectedId,
  className,
}: {
  relationships: Relationship[]
  selectedId?: string
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    params.set("relationship", val)
    router.push(`${pathname}?${params.toString()}`)
  }

  const current = relationships.find((r) => r.id === selectedId) || relationships[0] || null

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={current?.partner?.avatar_url || undefined} />
          <AvatarFallback>
            {current?.partner?.display_name?.slice(0, 2)?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-slate-100 font-medium truncate">
            {current?.partner?.display_name || "Sub"}
          </div>
          <div className="text-slate-400 text-xs truncate">
            {current?.partner?.country || "—"}
          </div>
        </div>
      </div>

      <Select defaultValue={current?.id} onValueChange={handleChange}>
        <SelectTrigger className="w-full md:w-64 bg-slate-900/70 border-slate-800">
          <SelectValue placeholder="Wybierz suba" />
        </SelectTrigger>
        <SelectContent>
          {relationships.map((rel) => (
            <SelectItem key={rel.id} value={rel.id}>
              {rel.partner?.display_name || "Sub"}
              {rel.id === current?.id ? " • bieżący" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
