"use client"

import { useState, useEffect, memo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LockTimeDialog } from "@/components/lock-time-dialog"
import { LockHistoryDialog } from "@/components/lock-history-dialog"
import { Pause, Play, CheckCircle } from "lucide-react"

interface Lock {
  id: string
  relationship_id: string
  name: string
  description: string | null
  status: string
  initial_duration_seconds: number
  remaining_seconds: number
  started_at: string
  paused_at: string | null
  completed_at: string | null
  allow_keyholder_add_time: boolean
  allow_keyholder_remove_time: boolean
  allow_sub_request_time: boolean
}

interface Relationship {
  id: string
  userRole: "sub" | "keyholder"
  partner: {
    id: string
    display_name: string
  }
}

const LockCard = memo(function LockCard({
  lock,
  relationship,
  remainingSeconds,
  currentUserId,
  currentUserRole,
  onPause,
  onResume,
  onComplete,
  actionLoading,
}: {
  lock: Lock
  relationship: Relationship | undefined
  remainingSeconds: number
  currentUserId: string
  currentUserRole: string
  onPause: (lockId: string, relationshipId: string) => void
  onResume: (lockId: string) => void
  onComplete: (lockId: string) => void
  actionLoading: string | null
}) {
  const progress = ((lock.initial_duration_seconds - remainingSeconds) / lock.initial_duration_seconds) * 100
  const isKeyholder = currentUserRole === "KEYHOLDER"

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-slate-100 truncate">{lock.name}</CardTitle>
            <CardDescription className="text-slate-400 mt-1 truncate">
              {relationship?.partner.display_name}
            </CardDescription>
          </div>
          <Badge
            variant={lock.status === "active" ? "default" : "secondary"}
            className={
              lock.status === "active"
                ? "bg-green-600 shrink-0"
                : lock.status === "paused"
                  ? "bg-yellow-600 shrink-0"
                  : lock.status === "completed"
                    ? "bg-blue-600 shrink-0"
                    : "bg-slate-700 shrink-0"
            }
          >
            {lock.status === "active"
              ? "Aktywny"
              : lock.status === "paused"
                ? "Wstrzymany"
                : lock.status === "completed"
                  ? "Zakończony"
                  : "Anulowany"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lock.description && <p className="text-sm text-slate-400 leading-relaxed">{lock.description}</p>}

        {lock.status !== "completed" && lock.status !== "cancelled" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Pozostały czas:</span>
              <span className="text-2xl md:text-3xl font-mono font-bold text-slate-100 tabular-nums">
                {formatTime(remainingSeconds)}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Start</span>
              <span>{Math.round(progress)}%</span>
              <span>Koniec</span>
            </div>
          </div>
        )}

        {isKeyholder && (
          <div className="flex flex-wrap gap-2 pt-2">
            {lock.status === "active" && (
              <>
                <Button
                  onClick={() => onPause(lock.id, lock.relationship_id)}
                  disabled={actionLoading === lock.id}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Wstrzymaj
                </Button>
                <LockTimeDialog lock={lock} currentUserId={currentUserId} />
              </>
            )}

            {lock.status === "paused" && (
              <>
                <Button
                  onClick={() => onResume(lock.id)}
                  disabled={actionLoading === lock.id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Wznów
                </Button>
                <LockTimeDialog lock={lock} currentUserId={currentUserId} />
              </>
            )}

            {(lock.status === "active" || lock.status === "paused") && (
              <Button
                onClick={() => onComplete(lock.id)}
                disabled={actionLoading === lock.id}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Zakończ
              </Button>
            )}

            <LockHistoryDialog lockId={lock.id} />
          </div>
        )}

        {!isKeyholder && (
          <div className="pt-2">
            <LockHistoryDialog lockId={lock.id} />
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export function LocksList({
  locks,
  relationships,
  currentUserId,
  currentUserRole,
}: {
  locks: Lock[]
  relationships: Relationship[]
  currentUserId: string
  currentUserRole: string
}) {
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const calculateTimes = () => {
      const times: Record<string, number> = {}
      locks.forEach((lock) => {
        if (lock.status === "completed" || lock.status === "cancelled") {
          times[lock.id] = 0
        } else if (lock.status === "paused") {
          times[lock.id] = lock.remaining_seconds
        } else {
          const elapsed = Math.floor((Date.now() - new Date(lock.started_at).getTime()) / 1000)
          times[lock.id] = Math.max(0, lock.remaining_seconds - elapsed)
        }
      })
      setRemainingTimes(times)
    }

    calculateTimes()
    const interval = setInterval(calculateTimes, 1000)
    return () => clearInterval(interval)
  }, [locks])

  const handlePause = async (lockId: string, relationshipId: string) => {
    setActionLoading(lockId)
    const supabase = createClient()

    try {
      const currentRemaining = remainingTimes[lockId]

      const { error } = await supabase
        .from("locks")
        .update({
          status: "paused",
          paused_at: new Date().toISOString(),
          remaining_seconds: currentRemaining,
        })
        .eq("id", lockId)

      if (error) throw error

      await supabase.from("lock_history").insert({
        lock_id: lockId,
        action: "paused",
        performed_by: currentUserId,
        reason: "Lock wstrzymany",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd wstrzymania")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResume = async (lockId: string) => {
    setActionLoading(lockId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("locks")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
          paused_at: null,
        })
        .eq("id", lockId)

      if (error) throw error

      await supabase.from("lock_history").insert({
        lock_id: lockId,
        action: "resumed",
        performed_by: currentUserId,
        reason: "Lock wznowiony",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd wznawiania")
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async (lockId: string) => {
    if (!confirm("Czy na pewno chcesz zakończyć ten lock?")) return

    setActionLoading(lockId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("locks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          remaining_seconds: 0,
        })
        .eq("id", lockId)

      if (error) throw error

      await supabase.from("lock_history").insert({
        lock_id: lockId,
        action: "completed",
        performed_by: currentUserId,
        reason: "Lock zakończony",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd zakończenia")
    } finally {
      setActionLoading(null)
    }
  }

  if (locks.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-100">Brak locków</CardTitle>
          <CardDescription className="text-slate-400">
            {currentUserRole === "KEYHOLDER"
              ? "Utwórz nowy lock, aby rozpocząć"
              : "Poczekaj, aż KEYHOLDER utworzy lock"}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {locks.map((lock) => {
        const relationship = relationships.find((r) => r.id === lock.relationship_id)
        const remainingSeconds = remainingTimes[lock.id] || 0

        return (
          <LockCard
            key={lock.id}
            lock={lock}
            relationship={relationship}
            remainingSeconds={remainingSeconds}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={handleComplete}
            actionLoading={actionLoading}
          />
        )
      })}
    </div>
  )
}
