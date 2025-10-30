"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus } from "lucide-react"

interface Profile {
  id: string
  display_name: string
  role: string
  bio: string | null
  country: string | null
  avatar_url: string | null
}

export function UserSearch({ currentUserId, currentUserRole }: { currentUserId: string; currentUserRole: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendingRequest, setSendingRequest] = useState<string | null>(null)

  // Determine which role to search for
  const targetRole = currentUserRole === "SUB" ? "KEYHOLDER" : "SUB"

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([])
        return
      }

      setIsLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", targetRole)
          .neq("id", currentUserId)
          .or(`display_name.ilike.%${searchQuery}%,country.ilike.%${searchQuery}%`)
          .limit(10)

        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd wyszukiwania")
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, targetRole, currentUserId])

  const sendRelationshipRequest = async (targetUserId: string) => {
    setSendingRequest(targetUserId)
    setError(null)
    const supabase = createClient()

    try {
      // Check if relationship already exists
      const { data: existing } = await supabase
        .from("relationships")
        .select("*")
        .or(
          `and(sub_id.eq.${currentUserRole === "SUB" ? currentUserId : targetUserId},keyholder_id.eq.${currentUserRole === "SUB" ? targetUserId : currentUserId})`,
        )
        .single()

      if (existing) {
        setError("Relacja z tym użytkownikiem już istnieje")
        setSendingRequest(null)
        return
      }

      // Create new relationship request
      const { error: insertError } = await supabase.from("relationships").insert({
        sub_id: currentUserRole === "SUB" ? currentUserId : targetUserId,
        keyholder_id: currentUserRole === "SUB" ? targetUserId : currentUserId,
        status: "pending",
      })

      if (insertError) throw insertError

      // Create notification for the target user
      await supabase.from("notifications").insert({
        user_id: targetUserId,
        type: "relationship_request",
        title: "Nowe zaproszenie do relacji",
        message: "Otrzymałeś nowe zaproszenie do relacji",
        link: "/relacje",
      })

      alert("Zaproszenie wysłane pomyślnie!")
      setUsers(users.filter((u) => u.id !== targetUserId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd wysyłania zaproszenia")
    } finally {
      setSendingRequest(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-100">Szukaj użytkowników</CardTitle>
          <CardDescription className="text-slate-400">
            Znajdź {targetRole === "SUB" ? "SUB" : "KEYHOLDER"} do nawiązania relacji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Wpisz nazwę użytkownika lub kraj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-red-950/30 border border-red-900 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-slate-400">Wyszukiwanie...</p>
        </div>
      )}

      {!isLoading && searchQuery.length >= 2 && users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">Nie znaleziono użytkowników</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {users.map((user) => (
          <Card key={user.id} className="border-slate-800 bg-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-100">{user.display_name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                      {user.role}
                    </Badge>
                    {user.country && (
                      <Badge variant="outline" className="border-slate-700 text-slate-400">
                        {user.country}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {user.bio && <p className="text-sm text-slate-400 mb-4 line-clamp-2">{user.bio}</p>}
              <Button
                onClick={() => sendRelationshipRequest(user.id)}
                disabled={sendingRequest === user.id}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {sendingRequest === user.id ? "Wysyłanie..." : "Wyślij zaproszenie"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
