"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Link2, Lock, CheckSquare, MessageSquare, Bell } from "lucide-react"

interface Stats {
  totalUsers: number
  activeUsers: number
  totalRelationships: number
  activeRelationships: number
  totalLocks: number
  activeLocks: number
  totalTasks: number
  pendingTasks: number
  totalMessages: number
  totalNotifications: number
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: totalUsers },
          { count: activeUsers },
          { count: totalRelationships },
          { count: activeRelationships },
          { count: totalLocks },
          { count: activeLocks },
          { count: totalTasks },
          { count: pendingTasks },
          { count: totalMessages },
          { count: totalNotifications },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("relationships").select("*", { count: "exact", head: true }),
          supabase.from("relationships").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("locks").select("*", { count: "exact", head: true }),
          supabase.from("locks").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("tasks").select("*", { count: "exact", head: true }),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("messages").select("*", { count: "exact", head: true }),
          supabase.from("notifications").select("*", { count: "exact", head: true }),
        ])

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalRelationships: totalRelationships || 0,
          activeRelationships: activeRelationships || 0,
          totalLocks: totalLocks || 0,
          activeLocks: activeLocks || 0,
          totalTasks: totalTasks || 0,
          pendingTasks: pendingTasks || 0,
          totalMessages: totalMessages || 0,
          totalNotifications: totalNotifications || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <div className="text-white">Ładowanie statystyk...</div>
  }

  if (!stats) {
    return <div className="text-white">Błąd ładowania statystyk</div>
  }

  const statCards = [
    {
      title: "Użytkownicy",
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} aktywnych`,
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Relacje",
      value: stats.totalRelationships,
      subtitle: `${stats.activeRelationships} aktywnych`,
      icon: Link2,
      color: "text-purple-400",
    },
    {
      title: "Locki",
      value: stats.totalLocks,
      subtitle: `${stats.activeLocks} aktywnych`,
      icon: Lock,
      color: "text-pink-400",
    },
    {
      title: "Zadania",
      value: stats.totalTasks,
      subtitle: `${stats.pendingTasks} oczekujących`,
      icon: CheckSquare,
      color: "text-green-400",
    },
    {
      title: "Wiadomości",
      value: stats.totalMessages,
      subtitle: "Wszystkie wiadomości",
      icon: MessageSquare,
      color: "text-cyan-400",
    },
    {
      title: "Powiadomienia",
      value: stats.totalNotifications,
      subtitle: "Wszystkie powiadomienia",
      icon: Bell,
      color: "text-orange-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="bg-white/[0.02]/50 backdrop-blur-sm border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
