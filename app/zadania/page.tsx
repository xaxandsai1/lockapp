// app/zadania/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TasksList } from "@/components/tasks-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"

export default async function ZadaniaPage() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect("/auth/logowanie")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/auth/logowanie")

  const { data: asSub } = await supabase
    .from("relationships")
    .select(`*, keyholder:keyholder_id(id, display_name, role, is_verified)`)
    .eq("sub_id", user.id).eq("status", "active")

  const { data: asKey } = await supabase
    .from("relationships")
    .select(`*, sub:sub_id(id, display_name, role, is_verified)`)
    .eq("keyholder_id", user.id).eq("status", "active")

  const relationships = [
    ...(asSub || []).map((r: any) => ({ ...r, userRole: "sub" as const, partner: r.keyholder })),
    ...(asKey || []).map((r: any) => ({ ...r, userRole: "keyholder" as const, partner: r.sub })),
  ]

  const ids = relationships.map((r) => r.id)
  const { data: tasks } = await supabase
    .from("tasks").select("*")
    .in("relationship_id", ids.length ? ids : ["__none__"])
    .order("created_at", { ascending: false })

  const list = tasks || []
  const pending = list.filter((t) => t.status === "pending")
  const submitted = list.filter((t) => t.status === "submitted")
  const approved = list.filter((t) => t.status === "approved")
  const rejected = list.filter((t) => t.status === "rejected")

  return (
    <AppShell
      title="Zadania"
      subtitle="Zarządzaj zadaniami i wyzwaniami"
      user={{ display_name: profile?.display_name || user.email, avatar_url: profile?.avatar_url || null, is_verified: profile?.is_verified || false }}
      isAdmin={profile?.is_admin || false}
    >
      <div className="mb-4 flex justify-end">
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/5 text-slate-200 hover:bg-white/[0.06]">Powrót do panelu</Button>
        </Link>
      </div>

      {relationships.length === 0 ? (
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-10 text-center text-slate-400">
          Musisz mieć aktywną relację, aby zarządzać zadaniami
        </div>
      ) : (
        <section className="space-y-10">
          {profile.role === "KEYHOLDER" && (
            <div>
              <CreateTaskDialog relationships={relationships} />
            </div>
          )}

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Oczekujące</h2>
              <span className="text-xs text-slate-400">{pending.length}</span>
            </div>
            <TasksList tasks={pending} relationships={relationships} currentUserId={user.id} currentUserRole={profile.role} />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Przesłane</h2>
              <span className="text-xs text-slate-400">{submitted.length}</span>
            </div>
            <TasksList tasks={submitted} relationships={relationships} currentUserId={user.id} currentUserRole={profile.role} />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Zatwierdzone</h2>
              <span className="text-xs text-slate-400">{approved.length}</span>
            </div>
            <TasksList tasks={approved} relationships={relationships} currentUserId={user.id} currentUserRole={profile.role} />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Odrzucone</h2>
              <span className="text-xs text-slate-400">{rejected.length}</span>
            </div>
            <TasksList tasks={rejected} relationships={relationships} currentUserId={user.id} currentUserRole={profile.role} />
          </div>
        </section>
      )}
    </AppShell>
  )
}
