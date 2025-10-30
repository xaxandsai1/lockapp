import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersManagement } from "@/components/admin/users-management"
import { RelationshipsManagement } from "@/components/admin/relationships-management"
import { LocksManagement } from "@/components/admin/locks-management"
import { AuditLogs } from "@/components/admin/audit-logs"
import { AdminStats } from "@/components/admin/admin-stats"

export default async function AdminPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/logowanie")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-white/[0.02]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Panel Administracyjny</h1>
          <p className="text-slate-400">Zarządzanie systemem ChasteGlass</p>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="bg-white/[0.02]/50 backdrop-blur-sm border border-white/5">
            <TabsTrigger value="stats">Statystyki</TabsTrigger>
            <TabsTrigger value="users">Użytkownicy</TabsTrigger>
            <TabsTrigger value="relationships">Relacje</TabsTrigger>
            <TabsTrigger value="locks">Locki</TabsTrigger>
            <TabsTrigger value="audit">Logi Audytu</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="relationships">
            <RelationshipsManagement />
          </TabsContent>

          <TabsContent value="locks">
            <LocksManagement />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
