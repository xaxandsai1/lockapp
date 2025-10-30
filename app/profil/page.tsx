// app/profil/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { ProfilForm } from "@/components/profil-form"

export default async function ProfilPage() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/logowanie")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/logowanie")

  return (
    <AppShell
      title="Profil"
      subtitle="Zarządzaj swoim kontem"
      user={{ display_name: profile?.display_name || user.email, avatar_url: profile?.avatar_url || null, is_verified: profile?.is_verified || false }}
      isAdmin={profile?.is_admin || false}
    >
      <ProfilForm profile={profile as any} />
    </AppShell>
  )
}
