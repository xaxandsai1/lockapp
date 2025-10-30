// app/dashboard/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// time ago
function timeAgo(dateIso?: string | null) {
  if (!dateIso) return ""
  const now = Date.now()
  const then = new Date(dateIso).getTime()
  const s = Math.max(1, Math.floor((now - then) / 1000))
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1],
  ]
  const rtf = new Intl.RelativeTimeFormat("pl", { numeric: "auto" })
  for (const [u, sec] of units) if (s >= sec || u === "second") return rtf.format(-Math.floor(s / sec), u)
  return ""
}

// sumy 7/30
function sumLockedSeconds(
  history: Array<{ action: string; created_at: string; lock_id: string }>,
  nowSec = Date.now() / 1000,
  fromSec?: number,
) {
  const per = new Map<string, { action: string; created_at: string }[]>()
  for (const h of history) {
    const ts = new Date(h.created_at).getTime() / 1000
    if (fromSec && ts < fromSec) continue
    if (!per.has(h.lock_id)) per.set(h.lock_id, [])
    per.get(h.lock_id)!.push(h)
  }
  let total = 0
  for (const rows of per.values()) {
    rows.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    let start: number | null = null
    for (const r of rows) {
      const t = new Date(r.created_at).getTime() / 1000
      if (r.action === "created" || r.action === "resumed") start ??= t
      else if (r.action === "paused" || r.action === "completed" || r.action === "cancelled") {
        if (start != null) { total += Math.max(0, Math.floor(t - start)); start = null }
      }
    }
    if (start != null) total += Math.max(0, Math.floor(nowSec - start))
  }
  return total
}
const fmtDH = (sec: number) => {
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600)
  return `${d} d ${h} h`
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/logowanie")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const role = profile?.role

  // notifications (max 3)
  const { data: recentNotifications } = await supabase
    .from("notifications")
    .select("id, title, message, link, is_read, created_at")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(3)

  // relationships view model (jak miałeś)
  let subActiveRelationship: any = null
  let keyholderRecentRelationships: any[] = []
  if (role === "SUB") {
    const { data: rel } = await supabase
      .from("relationships")
      .select(`id, created_at, updated_at, status, keyholder:keyholder_id(id, display_name, avatar_url)`)
      .eq("sub_id", user.id).eq("status", "active").order("updated_at", { ascending: false }).limit(1).maybeSingle()
    subActiveRelationship = rel || null
  } else {
    const { data: rels } = await supabase
      .from("relationships")
      .select(`id, status, updated_at, sub:sub_id(id, display_name, avatar_url)`)
      .eq("keyholder_id", user.id).eq("status", "active").order("updated_at", { ascending: false }).limit(3)
    keyholderRecentRelationships = rels || []
  }

  // recent locks (max 3)
  let recentLocks: Array<{ id: string; name: string; status: string; created_at: string; relationship_id: string }> = []
  if (role === "SUB" && subActiveRelationship?.id) {
    const { data: locks } = await supabase
      .from("locks").select("id, name, status, created_at, relationship_id")
      .eq("relationship_id", subActiveRelationship.id).order("created_at", { ascending: false }).limit(3)
    recentLocks = locks || []
  } else {
    const { data: relIds } = await supabase
      .from("relationships").select("id").eq("keyholder_id", user.id).eq("status", "active").limit(50)
    const ids = (relIds || []).map((r) => r.id)
    if (ids.length) {
      const { data: locks } = await supabase
        .from("locks").select("id, name, status, created_at, relationship_id")
        .in("relationship_id", ids).order("created_at", { ascending: false }).limit(3)
      recentLocks = locks || []
    }
  }

  const partnersByRel: Record<string, { display_name: string; avatar_url: string | null }> = {}
  if (role === "SUB" && subActiveRelationship) {
    partnersByRel[subActiveRelationship.id] = {
      display_name: subActiveRelationship.keyholder.display_name,
      avatar_url: subActiveRelationship.keyholder.avatar_url || null,
    }
  } else if (role === "KEYHOLDER" && keyholderRecentRelationships.length) {
    keyholderRecentRelationships.forEach((r) => {
      partnersByRel[r.id] = { display_name: r.sub.display_name, avatar_url: r.sub.avatar_url || null }
    })
  }

  // DODATEK: statystyki 7/30 + task counts (niczego nie usuwam)
  let relIdsForStats: string[] = []
  if (role === "SUB") {
    if (subActiveRelationship?.id) relIdsForStats = [subActiveRelationship.id]
  } else {
    const { data: relsAll } = await supabase
      .from("relationships").select("id").eq("keyholder_id", user.id).eq("status", "active").limit(200)
    relIdsForStats = (relsAll || []).map((r) => r.id)
  }
  let lockIdsForStats: string[] = []
  if (relIdsForStats.length) {
    const { data: locksAll } = await supabase
      .from("locks").select("id, relationship_id").in("relationship_id", relIdsForStats)
    lockIdsForStats = (locksAll || []).map((l) => l.id)
  }
  let total7 = 0, total30 = 0
  if (lockIdsForStats.length) {
    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    const { data: hist } = await supabase
      .from("lock_history").select("action, created_at, lock_id")
      .in("lock_id", lockIdsForStats).gte("created_at", since30)
    const nowSec = Date.now() / 1000
    total7 = sumLockedSeconds(hist || [], nowSec, nowSec - 7 * 86400)
    total30 = sumLockedSeconds(hist || [], nowSec, nowSec - 30 * 86400)
  }
  let tPending = 0, tSubmitted = 0, tApproved = 0, tRejected = 0
  if (relIdsForStats.length) {
    const { data: tasks } = await supabase
      .from("tasks").select("status, relationship_id").in("relationship_id", relIdsForStats)
    for (const t of tasks || []) {
      if (t.status === "pending") tPending++
      else if (t.status === "submitted") tSubmitted++
      else if (t.status === "approved") tApproved++
      else if (t.status === "rejected") tRejected++
    }
  }

  return (
    <AppShell
      title="Dashboard"
      subtitle="Szybkie podsumowanie i najnowsze aktywności"
      user={{ display_name: profile?.display_name || user.email, avatar_url: profile?.avatar_url || null, is_verified: profile?.is_verified || false }}
      isAdmin={profile?.is_admin || false}
    >
      {/* NOWE KARTY STATYSTYK — dodatek */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Czas w zamknięciu (7 dni)</CardDescription>
            <CardTitle className="text-2xl">{fmtDH(total7)}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-slate-500">Sumaryczny czas z historii locków</p></CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Czas w zamknięciu (30 dni)</CardDescription>
            <CardTitle className="text-2xl">{fmtDH(total30)}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-slate-500">Ostatnie 30 dni</p></CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Zadania oczekujące</CardDescription>
            <CardTitle className="text-2xl">{tPending}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-slate-500">Do zrobienia teraz</p></CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Zadania zatwierdzone</CardDescription>
            <CardTitle className="text-2xl">{tApproved}</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xs text-slate-500">Łącznie w relacjach</p></CardContent>
        </Card>
      </div>

      {/* TWOJE ISTNIEJĄCE SEKCJE — nie usuwam, tylko nowy styling */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* POWIADOMIENIA */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Powiadomienia</CardTitle>
                <CardDescription>Maks. 3 najnowsze</CardDescription>
              </div>
              <Link href="/powiadomienia" className="text-xs text-slate-400 hover:text-slate-200">Zobacz wszystkie</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentNotifications || []).length === 0 ? (
              <p className="text-sm text-slate-400">Brak powiadomień</p>
            ) : (
              (recentNotifications || []).map((n) => (
                <Link key={n.id} href={n.link || "/powiadomienia"} className="block rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 hover:bg-white/[0.06]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        {!n.is_read && <Badge className="bg-blue-600">nowe</Badge>}
                      </div>
                      {n.message && <p className="text-xs text-slate-400 line-clamp-2">{n.message}</p>}
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-500">{timeAgo(n.created_at)}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* LOCKI */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Locki</CardTitle>
                <CardDescription>Maks. 3 najnowsze</CardDescription>
              </div>
              <Link href="/locki" className="text-xs text-slate-400 hover:text-slate-200">Zobacz locki</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLocks.length === 0 ? (
              <p className="text-sm text-slate-400">Brak locków</p>
            ) : (
              recentLocks.map((lock) => {
                const partner = partnersByRel[lock.relationship_id]
                return (
                  <div key={lock.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-white/10">
                        <AvatarImage src={partner?.avatar_url || undefined} />
                        <AvatarFallback>{partner?.display_name?.slice(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{lock.name}</span>
                          <Badge className={
                            lock.status === "active" ? "bg-emerald-600/80" :
                            lock.status === "paused" ? "bg-amber-600/80" :
                            lock.status === "completed" ? "bg-blue-600/80" : "bg-slate-700/80"
                          }>
                            {lock.status === "active" ? "Aktywny" :
                             lock.status === "paused" ? "Wstrzymany" :
                             lock.status === "completed" ? "Zakończony" : "Anulowany"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{partner?.display_name || "Użytkownik"} • {timeAgo(lock.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* RELACJE */}
        <Card className="border-white/5 bg-white/[0.02] backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{role === "SUB" ? "Twój Keyholder" : "Relacje"}</CardTitle>
                <CardDescription>{role === "SUB" ? "Twoja aktywna relacja" : "Maks. 3 ostatnio aktywne"}</CardDescription>
              </div>
              <Link href="/relacje" className="text-xs text-slate-400 hover:text-slate-200">Zobacz relacje</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {role === "SUB" ? (
              !subActiveRelationship ? (
                <p className="text-sm text-slate-400">Brak aktywnej relacji</p>
              ) : (
                <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarImage src={subActiveRelationship.keyholder.avatar_url || undefined} />
                      <AvatarFallback>{subActiveRelationship.keyholder.display_name?.slice(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{subActiveRelationship.keyholder.display_name}</span>
                        <Badge className="bg-emerald-600/80">Aktywna</Badge>
                      </div>
                      <p className="text-xs text-slate-400">Od: {new Date(subActiveRelationship.created_at).toLocaleDateString("pl-PL")}</p>
                    </div>
                  </div>
                </div>
              )
            ) : keyholderRecentRelationships.length === 0 ? (
              <p className="text-sm text-slate-400">Brak aktywnych relacji</p>
            ) : (
              keyholderRecentRelationships.map((rel) => (
                <div key={rel.id} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={rel.sub.avatar_url || undefined} />
                      <AvatarFallback>{rel.sub.display_name?.slice(0, 2)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{rel.sub.display_name}</span>
                        <Badge className="bg-emerald-600/80">Aktywna</Badge>
                      </div>
                      <p className="text-xs text-slate-400">Aktualizacja {timeAgo(rel.updated_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
