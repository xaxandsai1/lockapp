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
import { Clock } from "lucide-react"

interface Lock {
  id: string
  name: string
  remaining_seconds: number
  allow_keyholder_add_time: boolean
  allow_keyholder_remove_time: boolean
}

export function LockTimeDialog({ lock, currentUserId }: { lock: Lock; currentUserId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState("0")
  const [hours, setHours] = useState("0")
  const [minutes, setMinutes] = useState("0")
  const [action, setAction] = useState<"add" | "remove">("add")
  const [reason, setReason] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const changeSeconds =
        Number.parseInt(days) * 86400 + Number.parseInt(hours) * 3600 + Number.parseInt(minutes) * 60

      if (changeSeconds === 0) {
        setError("Musisz dodać przynajmniej 1 minutę")
        setIsLoading(false)
        return
      }

      const newRemaining =
        action === "add" ? lock.remaining_seconds + changeSeconds : Math.max(0, lock.remaining_seconds - changeSeconds)

      const { error: updateError } = await supabase
        .from("locks")
        .update({
          remaining_seconds: newRemaining,
        })
        .eq("id", lock.id)

      if (updateError) throw updateError

      // Create lock history entry
      await supabase.from("lock_history").insert({
        lock_id: lock.id,
        action: action === "add" ? "time_added" : "time_removed",
        performed_by: currentUserId,
        time_change_seconds: action === "add" ? changeSeconds : -changeSeconds,
        reason: reason || null,
      })

      // Create notification
      const timeText = `${days !== "0" ? `${days}d ` : ""}${hours !== "0" ? `${hours}h ` : ""}${minutes !== "0" ? `${minutes}m` : ""}`
      await supabase.from("notifications").insert({
        user_id: currentUserId,
        type: "lock_time_changed",
        title: "Czas locka zmieniony",
        message: `Czas locka "${lock.name}" został ${action === "add" ? "zwiększony" : "zmniejszony"} o ${timeText}`,
        link: "/locki",
      })

      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd zmiany czasu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent"
        >
          <Clock className="h-3 w-3 mr-1" />
          Zmień czas
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-[95vw] md:max-w-md">
        <DialogHeader>
          <DialogTitle>Zmień czas locka</DialogTitle>
          <DialogDescription className="text-slate-400">
            Dodaj lub odejmij czas od locka "{lock.name}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>Akcja</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={action === "add" ? "default" : "outline"}
                onClick={() => setAction("add")}
                disabled={!lock.allow_keyholder_add_time}
                className={action === "add" ? "flex-1 bg-green-600 hover:bg-green-700" : "flex-1"}
              >
                Dodaj czas
              </Button>
              <Button
                type="button"
                variant={action === "remove" ? "default" : "outline"}
                onClick={() => setAction("remove")}
                disabled={!lock.allow_keyholder_remove_time}
                className={action === "remove" ? "flex-1 bg-red-600 hover:bg-red-700" : "flex-1"}
              >
                Odejmij czas
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="days" className="text-xs">
                Dni
              </Label>
              <Input
                id="days"
                type="number"
                min="0"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-center"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours" className="text-xs">
                Godziny
              </Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-center"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minutes" className="text-xs">
                Minuty
              </Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-center"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Powód (opcjonalnie)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
              placeholder="Dlaczego zmieniasz czas?"
            />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-md border border-red-900">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Zapisywanie..." : "Zapisz"}
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
