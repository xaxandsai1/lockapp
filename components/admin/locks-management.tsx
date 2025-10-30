"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock } from "lucide-react"

interface LockData {
  id: string
  name: string
  status: string
  created_at: string
  relationship: {
    sub_profile: {
      username: string
    }
    keyholder_profile: {
      username: string
    }
  }
}

export function LocksManagement() {
  const [locks, setLocks] = useState<LockData[]>([])
  const [filteredLocks, setFilteredLocks] = useState<LockData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchLocks()
  }, [])

  useEffect(() => {
    filterLocks()
  }, [statusFilter, locks])

  async function fetchLocks() {
    try {
      const { data, error } = await supabase
        .from("locks")
        .select(`
          *,
          relationship:relationships(
            sub_profile:profiles!relationships_sub_id_fkey(username),
            keyholder_profile:profiles!relationships_keyholder_id_fkey(username)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setLocks(data || [])
    } catch (error) {
      console.error("Error fetching locks:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterLocks() {
    if (statusFilter === "all") {
      setFilteredLocks(locks)
    } else {
      setFilteredLocks(locks.filter((l) => l.status === statusFilter))
    }
  }

  if (loading) {
    return <div className="text-white">Ładowanie locków...</div>
  }

  return (
    <Card className="bg-white/[0.02]/50 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="text-white">Zarządzanie Lockami</CardTitle>
        <CardDescription className="text-slate-400">Przeglądaj wszystkie locki w systemie</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/[0.02] border-white/5-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="active">Aktywne</SelectItem>
            <SelectItem value="paused">Wstrzymane</SelectItem>
            <SelectItem value="completed">Zakończone</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-3">
          {filteredLocks.map((lock) => (
            <div key={lock.id} className="p-4 rounded-lg bg-slate-800/30 border border-white/5-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-pink-400" />
                  <span className="font-medium text-white">{lock.name}</span>
                </div>
                <Badge
                  variant={lock.status === "active" ? "default" : lock.status === "paused" ? "secondary" : "outline"}
                >
                  {lock.status === "active" ? "Aktywny" : lock.status === "paused" ? "Wstrzymany" : "Zakończony"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-slate-500">SUB</p>
                  <p className="text-sm text-white">{lock.relationship.sub_profile.username}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">KEYHOLDER</p>
                  <p className="text-sm text-white">{lock.relationship.keyholder_profile.username}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Utworzony: {new Date(lock.created_at).toLocaleDateString("pl-PL")}
              </p>
            </div>
          ))}
          {filteredLocks.length === 0 && <p className="text-center text-slate-400 py-8">Nie znaleziono locków</p>}
        </div>
      </CardContent>
    </Card>
  )
}
