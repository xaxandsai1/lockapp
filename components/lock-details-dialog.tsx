"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { LockTimeDialog } from "@/components/lock-time-dialog"
import { LockHistoryDialog } from "@/components/lock-history-dialog"
import { Pause, Play, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    avatar_url?: string | null
  }
}

export function LockDetailsDialog({
  open,
  onOpenChange,
  lock,
  relationship,
  remainingSeconds,
  isKeyholder,
  onPause,
  onResume,
  onComplete,
  actionLoading,
  currentUserId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  lock: Lock
  relationship: Relationship | undefined
  remainingSeconds: number
  isKeyholder: boolean
  onPause: (lockId: string, relationshipId: string) => void
  onResume: (lockId: string) => void
  onComplete: (lockId: string) => void
  actionLoading: string | null
  currentUserId: string
}) {
  const progress =
    lock.initial_duration_seconds > 0
      ? ((lock.initial_duration_seconds - remainingSeconds) / lock.initial_duration_seconds) * 100
      : 0

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    return `${minutes}m ${secs}s`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={relationship?.partner.avatar_url || undefined} alt={relationship?.partner.display_name || "Użytkownik"} />
                <AvatarFallback>{relationship?.partner.display_name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{lock.name}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {relationship?.partner.display_name}
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant={lock.status === "active" ? "default" : "secondary"}
              className={
                lock.status === "active"
                  ? "bg-green-600"
                  : lock.status === "paused"
                  ? "bg-yellow-600"
                  : lock.status === "completed"
                  ? "bg-blue-600"
                  : "bg-slate-700"
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
        </DialogHeader>

        {lock.description && <p className="text-sm text-slate-300 leading-relaxed">{lock.description}</p>}

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

        <div className="flex flex-wrap gap-2 pt-2">
          {isKeyholder && lock.status === "active" && (
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
              <LockTimeDialog lock={lock as any} currentUserId={currentUserId} />
            </>
          )}

          {isKeyholder && lock.status === "paused" && (
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
              <LockTimeDialog lock={lock as any} currentUserId={currentUserId} />
            </>
          )}

          {isKeyholder && (lock.status === "active" || lock.status === "paused") && (
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
      </DialogContent>
    </Dialog>
  )
}
