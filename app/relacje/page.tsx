// app/relacje/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RelationshipsList } from "@/components/relationships-list"
import { UserSearch } from "@/components/user-search"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Lock, Users } from "lucide-react"

function timeAgo(dateIso?: string | null) {
  if (!dateIso) return ""
  const now = Date.now()
  const then = new Date(dateIso).getTime()
  const diff = Math.max(1, Math.floor((now - then) / 1000))
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800],
    ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1],
  ]
  const rtf = new Intl.RelativeTimeFormat("pl", { numeric: "auto" })
  for (const [unit, sec] of units) if (diff >= sec || unit === "second") return rtf.format(-Math.floor(diff / sec), unit)
  return ""
}

export default async function RelacjePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/logowanie")

  // Profil
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/logowanie")
  const isSub = profile.role === "SUB"

  // Relacje jako SUB (partner = keyholder)
  const { data: asSubRelationships } = await supabase
    .from("relationships")
    .select(`*, keyholder:keyholder_id(id, display_name, role, avatar_url, country)`)
    .eq("sub_id", user.id)
    .order("created_at", { ascending: false })

  // Relacje jako KEYHOLDER (partner = sub)
  const { data: asKeyholderRelationships } = await supabase
    .from("relationships")
    .select(`*, sub:sub_id(id, display_name, role, avatar_url, country)`)
    .eq("keyholder_id", user.id)
    .order("created_at", { ascending: false })

  // Połączony model jak wcześniej
  const allRelationships = [
    ...(asSubRelationships || []).map((r) => ({ ...r, userRole: "sub" as const, partner: r.keyholder })),
    ...(asKeyholderRelationships || []).map((r) => ({ ...r, userRole: "keyholder" as const, partner: r.sub })),
  ]

  const pendingRelationships = allRelationships.filter((r) => r.status === "pending")
  const activeRelationships  = allRelationships.filter((r) => r.status === "active")
  const pausedRelationships  = allRelationships.filter((r) => r.status === "paused")
  const endedRelationships   = allRelationships.filter((r) => r.status === "ended")

  // SUB: aktywna relacja (one-page jeśli istnieje)
  const subActive = isSub
    ? (asSubRelationships || []).find((r) => r.status === "active") || null
    : null

  // Locki dla SUB w aktywnej relacji (do karty one-page)
  let subActiveLocks:
    | Array<{ id: string; name: string; status: string; created_at: string; relationship_id: string }>
    | [] = []
  if (subActive?.id) {
    const { data: locks } = await supabase
      .from("locks")
      .select("id, name, status, created_at, relationship_id")
      .eq("relationship_id", subActive.id)
      .order("created_at", { ascending: false })
      .limit(10)
    subActiveLocks = locks || []
  }

  return (
    <AppShell
      title="Relacje"
      subtitle={isSub ? "Twoje połączenie z Keyholderem" : "Zarządzaj połączeniami (wyszukiwarka + listy)"}
      user={{ display_name: profile.display_name || user.email || "User", avatar_url: profile.avatar_url || null, is_verified: profile.is_verified || false }}
      isAdmin={profile.is_admin || false}
    >
      {/* === SUB: ONE PAGE, jeśli jest aktywna relacja === */}
      {isSub && subActive ? (
        <div className="grid gap-6">
          {/* Karta Keyholdera */}
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={subActive.keyholder?.avatar_url || undefined} />
                  <AvatarFallback>
                    {subActive.keyholder?.display_name?.slice(0, 2)?.toUpperCase() || "KH"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{subActive.keyholder?.display_name}</CardTitle>
                  <CardDescription>
                    Twój Keyholder • od {new Date(subActive.created_at).toLocaleDateString("pl-PL")}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-600/80">Aktywna</Badge>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Kraj</span>
                </div>
                <p className="mt-1">{subActive.keyholder?.country || "—"}</p>
              </div>
              <div className="rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Locki (łącznie)</span>
                </div>
                <p className="mt-1">{subActiveLocks.length}</p>
              </div>
              <div className="rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Status relacji</span>
                </div>
                <p className="mt-1">Aktywna</p>
              </div>
            </CardContent>
          </Card>

          {/* Locki z tej relacji */}
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Twoje locki z Keyholderem</CardTitle>
                <CardDescription>Maks. 3 najnowsze</CardDescription>
              </div>
              <Link href="/locki" className="text-xs text-muted-foreground hover:text-foreground">
                Zobacz locki
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {subActiveLocks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak locków</p>
              ) : (
                subActiveLocks.slice(0, 3).map((lock) => (
                  <div key={lock.id} className="rounded-lg border border-white/5 bg-white/[0.02]/60 px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{lock.name}</span>
                          <Badge
                            className={
                              lock.status === "active"
                                ? "bg-emerald-600/80"
                                : lock.status === "paused"
                                ? "bg-amber-600/80"
                                : lock.status === "completed"
                                ? "bg-blue-600/80"
                                : "bg-slate-700/80"
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
                        <p className="text-xs text-muted-foreground truncate">Utworzony {timeAgo(lock.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/[0.02]">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">
                Jako <span className="font-medium text-foreground">SUB</span> nie możesz wstrzymywać ani kończyć relacji.
                Jeśli Keyholder zakończy relację, wrócisz do widoku wyszukiwania.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* === Wspólny bazowy widok zakładek (KEYHOLDER oraz SUB bez aktywnej relacji) === */
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/[0.02] border border-white/5">
            <TabsTrigger value="search" className="data-[state=active]:bg-white/[0.02]/60">Szukaj</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/[0.02]/60">
              Oczekujące ({pendingRelationships.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white/[0.02]/60">
              Aktywne ({activeRelationships.length})
            </TabsTrigger>
            <TabsTrigger value="paused" className="data-[state=active]:bg-white/[0.02]/60">
              Wstrzymane ({pausedRelationships.length})
            </TabsTrigger>
            <TabsTrigger value="ended" className="data-[state=active]:bg-white/[0.02]/60">
              Zakończone ({endedRelationships.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-6">
            <UserSearch currentUserId={user.id} currentUserRole={profile.role} />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <RelationshipsList
              relationships={pendingRelationships}
              currentUserId={user.id}
              emptyMessage="Brak oczekujących zaproszeń"
            />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <RelationshipsList
              relationships={activeRelationships}
              currentUserId={user.id}
              emptyMessage="Brak aktywnych relacji"
            />
          </TabsContent>

          <TabsContent value="paused" className="mt-6">
            <RelationshipsList
              relationships={pausedRelationships}
              currentUserId={user.id}
              emptyMessage="Brak wstrzymanych relacji"
            />
          </TabsContent>

          <TabsContent value="ended" className="mt-6">
            <RelationshipsList
              relationships={endedRelationships}
              currentUserId={user.id}
              emptyMessage="Brak zakończonych relacji"
            />
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  )
}
