"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  created_at: string
  profile: {
    username: string
  }
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [entityFilter, logs])

  async function fetchLogs() {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          *,
          profile:profiles(username)
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterLogs() {
    if (entityFilter === "all") {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter((l) => l.entity_type === entityFilter))
    }
  }

  if (loading) {
    return <div className="text-white">Ładowanie logów...</div>
  }

  return (
    <Card className="bg-white/[0.02]/50 backdrop-blur-sm border-white/5">
      <CardHeader>
        <CardTitle className="text-white">Logi Audytu</CardTitle>
        <CardDescription className="text-slate-400">
          Przeglądaj historię wszystkich działań w systemie (ostatnie 100)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full md:w-[200px] bg-white/[0.02] border-white/5-700 text-white">
            <SelectValue placeholder="Typ encji" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie typy</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="relationship">Relacje</SelectItem>
            <SelectItem value="lock">Locki</SelectItem>
            <SelectItem value="task">Zadania</SelectItem>
            <SelectItem value="message">Wiadomości</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-lg bg-slate-800/30 border border-white/5-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{log.profile.username}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.entity_type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    {log.details && <p className="text-xs text-slate-400 mt-1">{JSON.stringify(log.details)}</p>}
                  </div>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString("pl-PL")}
                </span>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && <p className="text-center text-slate-400 py-8">Nie znaleziono logów</p>}
        </div>
      </CardContent>
    </Card>
  )
}
