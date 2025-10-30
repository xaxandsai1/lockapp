"use client"

import { useState, useEffect, ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LockHistoryDialog } from "@/components/lock-history-dialog"
import { Clock, User, Calendar, Lock as LockIcon, Info } from "lucide-react"

interface Lock {
  id: string
  relationship_id: string
  name: string
  description: string | null
  status: "active" | "paused" | "completed" | "cancelled"
  initial_duration_seconds: number
  remaining_seconds: number
  started_at: string
  paused_at: string | null
  completed_at: string | null
  allow_keyholder_add_time: boolean
  allow_keyholder_remove_time: boolean
  allow_sub_request_time: boolean
}

interface Partner {
  id: string
  display_name: string
  avatar_url: string | null
}

export function SubLockView({
  lock,
  keyholder,          // dla SUB: keyholder; dla KEYHOLDER: przekaż tu również partnera (SUB-a), żeby UI był identyczny
  controls,            // opcjonalny panel akcji (dla KEYHOLDER)
  headerRight,         // opcjonalne elementy w prawym górnym rogu (np. Select)
  title = "Twój Lock", // nagłówek sekcji
}: {
  lock: Lock
  keyholder: Partner
  controls?: ReactNode
  headerRight?: ReactNode
  title?: string
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(lock.remaining_seconds)

  useEffect(() => {
    const calculateTime = () => {
      if (lock.status === "completed" || lock.status === "cancelled") {
        setRemainingSeconds(0)
      } else if (lock.status === "paused") {
        setRemainingSeconds(lock.remaining_seconds)
      } else {
        const elapsed = Math.floor((Date.now() - new Date(lock.started_at).getTime()) / 1000)
        setRemainingSeconds(Math.max(0, lock.remaining_seconds - elapsed))
      }
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [lock])

  const formatParts = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return { days, hours, minutes, secs }
  }

  const time = formatParts(remainingSeconds)

  // Progress: allocatedNow = remaining + elapsed (żeby nie schodziło poniżej 0% po dodaniu czasu)
  const nowElapsed = lock.status === "active"
    ? Math.max(0, Math.floor((Date.now() - new Date(lock.started_at).getTime()) / 1000))
    : 0

  const allocatedNow = Math.max(lock.initial_duration_seconds, remainingSeconds + nowElapsed)
  let progress = allocatedNow > 0 ? ((allocatedNow - remainingSeconds) / allocatedNow) * 100 : 0
  if (lock.status === "completed") progress = 100
  if (lock.status === "cancelled") progress = 0
  progress = Math.min(100, Math.max(0, progress))

  const startDate = new Date(lock.started_at).toLocaleDateString("pl-PL", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  })

  return (
    <div className="space-y-6">
      {/* Header (wspólny) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{title}</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Szczegóły blokady</p>
        </div>
        {headerRight}
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge
          variant={lock.status === "active" ? "default" : "secondary"}
          className={`text-base px-6 py-2 ${
            lock.status === "active"
              ? "bg-green-600"
              : lock.status === "paused"
                ? "bg-yellow-600"
                : lock.status === "completed"
                  ? "bg-blue-600"
                  : "bg-slate-700"
          }`}
        >
          {lock.status === "active"
            ? "🔒 Aktywny Lock"
            : lock.status === "paused"
              ? "⏸️ Wstrzymany"
              : lock.status === "completed"
                ? "✅ Zakończony"
                : "❌ Anulowany"}
        </Badge>
      </div>

      {/* Main Timer Card */}
      <Card className="border-slate-800 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
        <CardContent className="p-8 space-y-8">
          {/* Lock Name */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <LockIcon className="h-5 w-5" />
              <span className="text-sm uppercase tracking-wider">Nazwa Locka</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">{lock.name}</h2>
          </div>

          {/* Countdown Timer */}
          {lock.status !== "completed" && lock.status !== "cancelled" && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "DNI", value: time.days },
                  { label: "GODZ", value: time.hours },
                  { label: "MIN", value: time.minutes },
                  { label: "SEK", value: time.secs },
                ].map((b) => (
                  <div key={b.label} className="bg-white/[0.02]rounded-xl p-4 text-center border border-slate-700">
                    <div className="text-4xl md:text-5xl font-bold text-slate-100 font-mono tabular-nums">
                      {String(b.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs md:text-sm text-slate-400 mt-2">{b.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <Progress value={progress} className="h-4" />
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>Postęp</span>
                  <span className="font-semibold text-slate-200">{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          )}

          {lock.status === "completed" && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-2xl font-bold text-slate-100">Lock zakończony!</p>
              <p className="text-slate-400 mt-2">Gratulacje, udało się!</p>
            </div>
          )}

          {/* Panel akcji (opcjonalny) */}
          {controls && <div className="pt-2">{controls}</div>}
        </CardContent>
      </Card>

      {/* Partner Info Card (Keyholder / Sub – ten sam układ) */}
      <Card className="border-slate-800 bg-white/[0.02] backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-slate-700">
              <AvatarImage src={keyholder.avatar_url || undefined} alt={keyholder.display_name} />
              <AvatarFallback className="bg-slate-800 text-slate-200 text-lg">
                {keyholder.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <User className="h-4 w-4" />
                <span>Partner</span>
              </div>
              <p className="text-xl font-semibold text-slate-100">{keyholder.display_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-slate-800 bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-400">Data rozpoczęcia</span>
            </div>
            <p className="text-lg font-semibold text-slate-100">{startDate}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-400">Początkowy czas</span>
            </div>
            <p className="text-lg font-semibold text-slate-100">
              {formatParts(lock.initial_duration_seconds).days}d {formatParts(lock.initial_duration_seconds).hours}h{" "}
              {formatParts(lock.initial_duration_seconds).minutes}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Opis */}
      {lock.description && (
        <Card className="border-slate-800 bg-white/[0.02] backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Info className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-slate-400">Opis</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{lock.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Historia (zawsze dostępna) – zostawiamy też w controls, ale tu może zostać drugi przycisk jeśli chcesz usunąć z controls */}
      {!controls && (
        <div className="flex justify-center">
          <LockHistoryDialog lockId={lock.id} />
        </div>
      )}
    </div>
  )
}
