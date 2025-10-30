// app/powiadomienia/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { NotificationsList } from "@/components/notifications-list"

export default async function PowiadomieniaPage() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/logowanie")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/logowanie")

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <AppShell
      title="Powiadomienia"
      subtitle="Wszystkie Twoje powiadomienia"
      user={{ display_name: profile?.display_name || user.email, avatar_url: profile?.avatar_url || null, is_verified: profile?.is_verified || false }}
      isAdmin={profile?.is_admin || false}
    >
      <NotificationsList notifications={(notifications || []) as any} />
    </AppShell>
  )
}
