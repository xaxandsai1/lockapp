"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Ban, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  username: string
  email: string
  role: "SUB" | "KEYHOLDER"
  status: "active" | "suspended" | "banned"
  created_at: string
  last_seen_at: string | null
}

export function UsersManagement() {
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const supabase = createBrowserClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, statusFilter, users])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać użytkowników",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  async function updateUserStatus(userId: string, newStatus: "active" | "suspended" | "banned") {
    try {
      const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", userId)

      if (error) throw error

      toast({
        title: "Sukces",
        description: "Status użytkownika został zaktualizowany",
      })

      fetchUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zaktualizować statusu użytkownika",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="text-white">Ładowanie użytkowników...</div>
  }

  return (
    <Card className="bg-white/[0.02]/50 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="text-white">Zarządzanie Użytkownikami</CardTitle>
        <CardDescription className="text-slate-400">
          Przeglądaj i zarządzaj wszystkimi użytkownikami systemu
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Szukaj użytkownika..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/[0.02] border-white/5-700 text-white"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/[0.02] border-white/5-700 text-white">
              <SelectValue placeholder="Rola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie role</SelectItem>
              <SelectItem value="SUB">SUB</SelectItem>
              <SelectItem value="KEYHOLDER">KEYHOLDER</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-white/[0.02] border-white/5-700 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="active">Aktywny</SelectItem>
              <SelectItem value="suspended">Zawieszony</SelectItem>
              <SelectItem value="banned">Zbanowany</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-800/30 border border-white/5-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{user.username}</span>
                  <Badge variant={user.role === "SUB" ? "default" : "secondary"}>{user.role}</Badge>
                  <Badge
                    variant={
                      user.status === "active" ? "default" : user.status === "suspended" ? "secondary" : "destructive"
                    }
                  >
                    {user.status === "active" ? "Aktywny" : user.status === "suspended" ? "Zawieszony" : "Zbanowany"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Dołączył: {new Date(user.created_at).toLocaleDateString("pl-PL")}
                </p>
              </div>
              <div className="flex gap-2">
                {user.status !== "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateUserStatus(user.id, "active")}
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aktywuj
                  </Button>
                )}
                {user.status !== "suspended" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateUserStatus(user.id, "suspended")}
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Zawieś
                  </Button>
                )}
                {user.status !== "banned" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateUserStatus(user.id, "banned")}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Zbanuj
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && <p className="text-center text-slate-400 py-8">Nie znaleziono użytkowników</p>}
        </div>
      </CardContent>
    </Card>
  )
}
