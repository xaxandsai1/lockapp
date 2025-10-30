"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"

interface Relationship {
  id: string
  userRole: "sub" | "keyholder"
  partner: {
    id: string
    display_name: string
  }
}

export function CreateLockDialog({ relationships }: { relationships: Relationship[] }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [relationshipId, setRelationshipId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [durationHours, setDurationHours] = useState("24")
  const [allowKeyholderAddTime, setAllowKeyholderAddTime] = useState(true)
  const [allowKeyholderRemoveTime, setAllowKeyholderRemoveTime] = useState(false)
  const [allowSubRequestTime, setAllowSubRequestTime] = useState(true)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const durationSeconds = Number.parseInt(durationHours) * 3600

      const { data, error: insertError } = await supabase
        .from("locks")
        .insert({
          relationship_id: relationshipId,
          name,
          description: description || null,
          initial_duration_seconds: durationSeconds,
          remaining_seconds: durationSeconds,
          allow_keyholder_add_time: allowKeyholderAddTime,
          allow_keyholder_remove_time: allowKeyholderRemoveTime,
          allow_sub_request_time: allowSubRequestTime,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Create lock history entry
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("lock_history").insert({
          lock_id: data.id,
          action: "created",
          performed_by: user.id,
          reason: "Lock utworzony",
        })
      }

      // Get the SUB user ID from the relationship
      const relationship = relationships.find((r) => r.id === relationshipId)
      if (relationship) {
        const subId = relationship.userRole === "keyholder" ? relationship.partner.id : user?.id

        // Create notification for SUB
        await supabase.from("notifications").insert({
          user_id: subId,
          type: "lock_created",
          title: "Nowy lock utworzony",
          message: `Lock "${name}" został utworzony`,
          link: "/locki",
        })
      }

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd tworzenia locka")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Utwórz nowy lock
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Utwórz nowy lock</DialogTitle>
          <DialogDescription className="text-slate-400">Skonfiguruj parametry nowego locka</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="relationship">Relacja</Label>
            <Select value={relationshipId} onValueChange={setRelationshipId} required>
              <SelectTrigger className="bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Wybierz relację" />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((rel) => (
                  <SelectItem key={rel.id} value={rel.id}>
                    {rel.partner.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Nazwa locka</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-slate-800/50 border-slate-700"
              placeholder="np. Lock weekendowy"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Opis (opcjonalnie)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
              placeholder="Dodatkowe informacje o locku..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="duration">Czas trwania (godziny)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              required
              className="bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h4 className="text-sm font-medium text-slate-200">Ustawienia locka</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="add-time" className="text-sm">
                KEYHOLDER może dodawać czas
              </Label>
              <Switch id="add-time" checked={allowKeyholderAddTime} onCheckedChange={setAllowKeyholderAddTime} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="remove-time" className="text-sm">
                KEYHOLDER może odejmować czas
              </Label>
              <Switch
                id="remove-time"
                checked={allowKeyholderRemoveTime}
                onCheckedChange={setAllowKeyholderRemoveTime}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="request-time" className="text-sm">
                SUB może prosić o zmianę czasu
              </Label>
              <Switch id="request-time" checked={allowSubRequestTime} onCheckedChange={setAllowSubRequestTime} />
            </div>
          </div>

          {error && <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Tworzenie..." : "Utwórz lock"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800"
            >
              Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
