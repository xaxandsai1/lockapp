// app/locki/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { SubLockView } from "@/components/sub-lock-view"
import { RelationshipSwitcher } from "@/components/relationship-switcher"
import { CreateLockDialog } from "@/components/create-lock-dialog"
import { LockControls } from "@/components/lock-controls"

export default async function LockiPage({
  searchParams,
}: {
  searchParams: Promise<{ relationship?: string }>
}) {
  const supabase = await createServerClient()
  const params = await searchParams

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/logowanie")

  // Profil użytkownika
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/logowanie")

  const isSub = profile.role === "SUB"

  // =========================
  // SUB – One Page (bez akcji KH)
  // =========================
  if (isSub) {
    const { data: relationship } = await supabase
      .from("relationships")
      .select(`*, keyholder:keyholder_id(id, display_name, avatar_url)`)
      .eq("sub_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    const { data: lock } = await supabase
      .from("locks")
      .select("*")
      .eq("relationship_id", relationship?.id || "")
      .in("status", ["active", "paused"])
      .maybeSingle()

    return (
      <AppShell
        title="Lock"
        subtitle="Podgląd Twojego ostatniego zamknięcia"
        user={{
          display_name: profile.display_name || user.email || "User",
          avatar_url: profile.avatar_url || null,
          is_verified: profile.is_verified || false,
        }}
        isAdmin={profile.is_admin || false}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {!relationship ? (
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle>Brak aktywnej relacji</CardTitle>
                <CardDescription>Przejdź do relacji, aby nawiązać połączenie</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/relacje">
                  <Button>Relacje</Button>
                </Link>
              </CardContent>
            </Card>
          ) : !lock ? (
            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle>Brak aktywnego locka</CardTitle>
                <CardDescription>Poczekaj na działanie Keyholdera</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard">
                  <Button>Powrót do panelu</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            // One-page SUB-a z Twojego widoku — bez modyfikacji logiki
            <SubLockView lock={lock as any} keyholder={relationship.keyholder as any} title="Twój Lock" />
          )}
        </div>
      </AppShell>
    )
  }

  // =========================
  // KEYHOLDER – One Page + selektor relacji + akcje (działa dodaj/odejmij czasu)
  // =========================
  const { data: asKeyholderRelationships } = await supabase
    .from("relationships")
    .select(`*, sub:sub_id(id, display_name, avatar_url, country)`)
    .eq("keyholder_id", user.id)
    .eq("status", "active")

  const relationships =
    (asKeyholderRelationships || []).map((r) => ({ ...r, userRole: "keyholder" as const, partner: r.sub })) || []

  const selectedFromParam = params.relationship
  const selected = relationships.find((r) => r.id === selectedFromParam) || relationships[0] || null

  if (!selected) {
    return (
      <AppShell
        title="Locki"
        subtitle="Brak aktywnych relacji — przejdź do Relacji"
        user={{
          display_name: profile.display_name || user.email || "User",
          avatar_url: profile.avatar_url || null,
          is_verified: profile.is_verified || false,
        }}
        isAdmin={profile.is_admin || false}
      >
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle>Brak aktywnych relacji</CardTitle>
            <CardDescription>Przejdź do relacji, aby dodać SUB-a</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/relacje">
              <Button>Relacje</Button>
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  // aktywny/paused lock dla wybranego SUB-a
  const { data: lock } = await supabase
    .from("locks")
    .select("*")
    .eq("relationship_id", selected.id)
    .in("status", ["active", "paused"])
    .maybeSingle()

  return (
    <AppShell
      title="Lock SUB-a"
      subtitle="Zarządzaj zamknięciami w relacji"
      user={{
        display_name: profile.display_name || user.email || "User",
        avatar_url: profile.avatar_url || null,
        is_verified: profile.is_verified || false,
      }}
      isAdmin={profile.is_admin || false}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {lock ? (
          <SubLockView
            lock={lock as any}
            keyholder={{
              id: selected.partner?.id,
              display_name: selected.partner?.display_name || "Sub",
              avatar_url: selected.partner?.avatar_url || null,
            } as any}
            title="Lock SUB-a"
            headerRight={
              <div className="flex items-center gap-3">
                <RelationshipSwitcher
                  relationships={relationships.map((r) => ({
                    id: r.id,
                    partner: {
                      display_name: r.partner?.display_name || "Sub",
                      avatar_url: r.partner?.avatar_url || null,
                      country: r.partner?.country || null,
                    },
                  }))}
                  selectedId={selected.id}
                />
                <CreateLockDialog relationships={[selected]} />
              </div>
            }
            // WAŻNE: Kontrolki KH (pauza/wznów/zakończ + *działające* dodaj/odejmij czasu)
            // Sama logika add/remove czasu pozostaje w komponentach klientowych (jak w Twojej działającej wersji)
            controls={<LockControls lock={lock as any} currentUserId={user.id} />}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Lock SUB-a</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">Brak aktywnego locka</p>
              </div>
              <div className="flex items-center gap-3">
                <RelationshipSwitcher
                  relationships={relationships.map((r) => ({
                    id: r.id,
                    partner: {
                      display_name: r.partner?.display_name || "Sub",
                      avatar_url: r.partner?.avatar_url || null,
                      country: r.partner?.country || null,
                    },
                  }))}
                  selectedId={selected.id}
                />
                <CreateLockDialog relationships={[selected]} />
              </div>
            </div>

            <Card className="border-white/5 bg-white/[0.02]">
              <CardHeader>
                <CardTitle>Brak aktywnego locka</CardTitle>
                <CardDescription>Utwórz nowy lock dla tego SUB-a</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateLockDialog relationships={[selected]} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
