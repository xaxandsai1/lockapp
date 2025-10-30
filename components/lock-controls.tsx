"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LockTimeDialog } from "@/components/lock-time-dialog"
import { LockHistoryDialog } from "@/components/lock-history-dialog"
import { Pause, Play, CheckCircle } from "lucide-react"

type Lock = {
  id: string
  relationship_id: string
  status: "active" | "paused" | "completed" | "cancelled"
  remaining_seconds: number
  started_at: string
}

export function LockControls({
  lock,
  currentUserId,
}: {
  lock: Lock
  currentUserId: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const pause = async () => {
    if (loading) return
    setLoading("pause")
    try {
      // wyliczamy aktualny remaining po stronie klienta
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(lock.started_at).getTime()) / 1000))
      const remaining = Math.max(0, lock.remaining_seconds - elapsed)
      const { error } = await supabase
        .from("locks")
        .update({ status: "paused", paused_at: new Date().toISOString(), remaining_seconds: remaining })
        .eq("id", lock.id)
      if (error) throw error
      await supabase.from("lock_history").insert({
        lock_id: lock.id,
        action: "paused",
        performed_by: currentUserId,
        reason: "Lock wstrzymany przez KEYHOLDER",
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const resume = async () => {
    if (loading) return
    setLoading("resume")
    try {
      const { error } = await supabase
        .from("locks")
        .update({ status: "active", started_at: new Date().toISOString(), paused_at: null })
        .eq("id", lock.id)
      if (error) throw error
      await supabase.from("lock_history").insert({
        lock_id: lock.id,
        action: "resumed",
        performed_by: currentUserId,
        reason: "Lock wznowiony przez KEYHOLDER",
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  const complete = async () => {
    if (loading) return
    if (!confirm("Czy na pewno zakończyć lock?")) return
    setLoading("complete")
    try {
      const { error } = await supabase
        .from("locks")
        .update({ status: "completed", completed_at: new Date().toISOString(), remaining_seconds: 0 })
        .eq("id", lock.id)
      if (error) throw error
      await supabase.from("lock_history").insert({
        lock_id: lock.id,
        action: "completed",
        performed_by: currentUserId,
        reason: "Lock zakończony przez KEYHOLDER",
      })
      router.refresh()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {lock.status === "active" && (
        <Button onClick={pause} disabled={loading !== null} variant="outline" size="sm" className="border-slate-700 text-slate-200 hover:bg-slate-800">
          <Pause className="h-3 w-3 mr-1" /> Wstrzymaj
        </Button>
      )}
      {lock.status === "paused" && (
        <Button onClick={resume} disabled={loading !== null} size="sm" className="bg-green-600 hover:bg-green-700">
          <Play className="h-3 w-3 mr-1" /> Wznów
        </Button>
      )}
      {(lock.status === "active" || lock.status === "paused") && (
        <Button onClick={complete} disabled={loading !== null} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <CheckCircle className="h-3 w-3 mr-1" /> Zakończ
        </Button>
      )}
      {/* Zmiana czasu / Historia */}
      <LockTimeDialog lock={lock as any} currentUserId={currentUserId} />
      <LockHistoryDialog lockId={lock.id} />
    </div>
  )
}
