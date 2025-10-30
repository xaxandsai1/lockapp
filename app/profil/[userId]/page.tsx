import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VerifiedBadge } from "@/components/verified-badge"
import { notFound } from "next/navigation"

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const supabase = await createServerClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect("/auth/logowanie")
  }

  // Fetch current user profile for navigation
  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

  // Fetch the profile being viewed
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", params.userId).single()

  if (error || !profile) {
    notFound()
  }

  return (
    <>
      <Navigation
        isAdmin={currentProfile?.is_admin || false}
        user={{
          display_name: currentProfile?.display_name || currentUser.email || "User",
          avatar_url: currentProfile?.avatar_url || null,
        }}
      />
      <div className="min-h-svh bg-white/[0.02] pt-20 pb-24 md:pb-6">
        <div className="container mx-auto p-6 md:p-10 max-w-3xl">
          <Card className="border-white/5 bg-white/[0.02]/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-100">Profil użytkownika</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Name */}
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar className="h-24 w-24 border-4 border-white/5-700">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name} />
                  <AvatarFallback className="bg-slate-800 text-slate-200 text-2xl">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-100">{profile.display_name}</h2>
                    {profile.is_verified && <VerifiedBadge size="lg" />}
                  </div>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${
                      profile.role === "SUB"
                        ? "border-purple-500/50 text-purple-400"
                        : "border-blue-500/50 text-blue-400"
                    }`}
                  >
                    {profile.role}
                  </Badge>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">O mnie</h3>
                  <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Informacje</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Wiek</span>
                    <span className="text-slate-200">{profile.age} lat</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Kraj</span>
                    <span className="text-slate-200">{profile.country}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Status</span>
                    <span className="text-slate-200">{profile.is_verified ? "Zweryfikowany" : "Niezweryfikowany"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
