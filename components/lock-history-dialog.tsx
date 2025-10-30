"use client"

import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"

interface HistoryEntry {
  id: string
  action: string
  performed_by: string
  time_change_seconds: number
  reason: string | null
  created_at: string
  performer: {
    display_name: string
  }
}

export function LockHistoryDialog({ lockId }: { lockId: string }) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadHistory()
    }
  }, [open])

  const loadHistory = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("lock_history")
        .select(
          `
          *,
          performer:performed_by(display_name)
        `,
        )
        .eq("lock_id", lockId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAction = (action: string) => {
    const actions: Record<string, string> = {
      created: "Utworzony",
      time_added: "Dodano czas",
      time_removed: "Odjęto czas",
      paused: "Wstrzymany",
      resumed: "Wznowiony",
      completed: "Zakończony",
      cancelled: "Anulowany",
    }
    return actions[action] || action
  }

  const formatTime = (seconds: number) => {
    const hours = Math.abs(Math.floor(seconds / 3600))
    return `${seconds > 0 ? "+" : "-"}${hours}h`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent"
        >
          <History className="h-3 w-3 mr-1" />
          Historia
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historia locka</DialogTitle>
          <DialogDescription className="text-slate-400">Wszystkie zmiany i akcje</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Ładowanie...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Brak historii</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                      {formatAction(entry.action)}
                    </Badge>
                    {entry.time_change_seconds !== 0 && (
                      <Badge
                        variant="secondary"
                        className={`ml-2 ${entry.time_change_seconds > 0 ? "bg-green-600" : "bg-red-600"}`}
                      >
                        {formatTime(entry.time_change_seconds)}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{new Date(entry.created_at).toLocaleString("pl-PL")}</span>
                </div>
                <p className="text-sm text-slate-300">
                  Wykonane przez: <span className="font-medium">{entry.performer.display_name}</span>
                </p>
                {entry.reason && <p className="text-sm text-slate-400 mt-1 italic">{entry.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
