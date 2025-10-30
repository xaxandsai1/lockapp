"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Relationship {
  id: string
  status: string
  created_at: string
  sub_profile: {
    username: string
    email: string
  }
  keyholder_profile: {
    username: string
    email: string
  }
}

export function RelationshipsManagement() {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [filteredRelationships, setFilteredRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchRelationships()
  }, [])

  useEffect(() => {
    filterRelationships()
  }, [statusFilter, relationships])

  async function fetchRelationships() {
    try {
      const { data, error } = await supabase
        .from("relationships")
        .select(`
          *,
          sub_profile:profiles!relationships_sub_id_fkey(username, email),
          keyholder_profile:profiles!relationships_keyholder_id_fkey(username, email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setRelationships(data || [])
    } catch (error) {
      console.error("Error fetching relationships:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterRelationships() {
    if (statusFilter === "all") {
      setFilteredRelationships(relationships)
    } else {
      setFilteredRelationships(relationships.filter((r) => r.status === statusFilter))
    }
  }

  if (loading) {
    return <div className="text-white">Ładowanie relacji...</div>
  }

  return (
    <Card className="bg-white/[0.02]/50 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="text-white">Zarządzanie Relacjami</CardTitle>
        <CardDescription className="text-slate-400">Przeglądaj wszystkie relacje w systemie</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/[0.02] border-white/5-700 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            <SelectItem value="pending">Oczekujące</SelectItem>
            <SelectItem value="active">Aktywne</SelectItem>
            <SelectItem value="paused">Wstrzymane</SelectItem>
            <SelectItem value="ended">Zakończone</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-3">
          {filteredRelationships.map((rel) => (
            <div key={rel.id} className="p-4 rounded-lg bg-slate-800/30 border border-white/5-700">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    rel.status === "active"
                      ? "default"
                      : rel.status === "pending"
                        ? "secondary"
                        : rel.status === "paused"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {rel.status === "active"
                    ? "Aktywna"
                    : rel.status === "pending"
                      ? "Oczekująca"
                      : rel.status === "paused"
                        ? "Wstrzymana"
                        : "Zakończona"}
                </Badge>
                <span className="text-xs text-slate-500">{new Date(rel.created_at).toLocaleDateString("pl-PL")}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">SUB</p>
                  <p className="text-white font-medium">{rel.sub_profile.username}</p>
                  <p className="text-sm text-slate-400">{rel.sub_profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">KEYHOLDER</p>
                  <p className="text-white font-medium">{rel.keyholder_profile.username}</p>
                  <p className="text-sm text-slate-400">{rel.keyholder_profile.email}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredRelationships.length === 0 && (
            <p className="text-center text-slate-400 py-8">Nie znaleziono relacji</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
