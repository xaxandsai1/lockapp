"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Pause, Play, MessageSquare, Lock } from "lucide-react"

interface Relationship {
  id: string
  status: string
  created_at: string
  started_at: string | null
  ended_at: string | null
  userRole: "sub" | "keyholder"
  partner: {
    id: string
    display_name: string
    role: string
    avatar_url: string | null
    country: string | null
  }
}

export function RelationshipsList({
  relationships,
  currentUserId,
  emptyMessage,
}: {
  relationships: Relationship[]
  currentUserId: string
  emptyMessage: string
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleAccept = async (relationshipId: string, partnerId: string) => {
    setActionLoading(relationshipId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("relationships")
        .update({
          status: "active",
          started_at: new Date().toISOString(),
        })
        .eq("id", relationshipId)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        user_id: partnerId,
        type: "relationship_accepted",
        title: "Zaproszenie zaakceptowane",
        message: "Twoje zaproszenie do relacji zostało zaakceptowane",
        link: "/relacje",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd akceptacji")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (relationshipId: string, partnerId: string) => {
    setActionLoading(relationshipId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("relationships")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", relationshipId)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        user_id: partnerId,
        type: "relationship_ended",
        title: "Zaproszenie odrzucone",
        message: "Twoje zaproszenie do relacji zostało odrzucone",
        link: "/relacje",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd odrzucenia")
    } finally {
      setActionLoading(null)
    }
  }

  const handlePause = async (relationshipId: string, partnerId: string) => {
    setActionLoading(relationshipId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("relationships")
        .update({
          status: "paused",
        })
        .eq("id", relationshipId)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        user_id: partnerId,
        type: "relationship_ended",
        title: "Relacja wstrzymana",
        message: "Relacja została wstrzymana",
        link: "/relacje",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd wstrzymania")
    } finally {
      setActionLoading(null)
    }
  }

  const handleResume = async (relationshipId: string, partnerId: string) => {
    setActionLoading(relationshipId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("relationships")
        .update({
          status: "active",
        })
        .eq("id", relationshipId)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        user_id: partnerId,
        type: "relationship_accepted",
        title: "Relacja wznowiona",
        message: "Relacja została wznowiona",
        link: "/relacje",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd wznawiania")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEnd = async (relationshipId: string, partnerId: string) => {
    if (!confirm("Czy na pewno chcesz zakończyć tę relację?")) return

    setActionLoading(relationshipId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("relationships")
        .update({
          status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", relationshipId)

      if (error) throw error

      // Create notification
      await supabase.from("notifications").insert({
        user_id: partnerId,
        type: "relationship_ended",
        title: "Relacja zakończona",
        message: "Relacja została zakończona",
        link: "/relacje",
      })

      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd zakończenia")
    } finally {
      setActionLoading(null)
    }
  }

  if (relationships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {relationships.map((rel) => (
        <Card key={rel.id} className="border-slate-800 bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-slate-100">{rel.partner.display_name}</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  {rel.userRole === "sub" ? "Twój KEYHOLDER" : "Twój SUB"}
                </CardDescription>
              </div>
              <Badge
                variant={rel.status === "active" ? "default" : "secondary"}
                className={
                  rel.status === "active" ? "bg-green-600" : rel.status === "pending" ? "bg-yellow-600" : "bg-slate-700"
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rel.partner.country && (
                <p className="text-sm text-slate-400">
                  <span className="text-slate-500">Kraj:</span> {rel.partner.country}
                </p>
              )}

              {rel.status === "pending" && (
                <div className="flex gap-2">
                  {rel.userRole === "keyholder" ? (
                    <>
                      <Button
                        onClick={() => handleAccept(rel.id, rel.partner.id)}
                        disabled={actionLoading === rel.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Akceptuj
                      </Button>
                      <Button
                        onClick={() => handleReject(rel.id, rel.partner.id)}
                        disabled={actionLoading === rel.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Odrzuć
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Oczekiwanie na akceptację...</p>
                  )}
                </div>
              )}

              {rel.status === "active" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/locki?relationship=${rel.id}`)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Locki
                  </Button>
                </div>
              )}

              {rel.status === "active" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePause(rel.id, rel.partner.id)}
                    disabled={actionLoading === rel.id}
                    variant="outline"
                    className="flex-1 border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Wstrzymaj
                  </Button>
                  <Button
                    onClick={() => handleEnd(rel.id, rel.partner.id)}
                    disabled={actionLoading === rel.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Zakończ
                  </Button>
                </div>
              )}

              {rel.status === "paused" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleResume(rel.id, rel.partner.id)}
                    disabled={actionLoading === rel.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Wznów
                  </Button>
                  <Button
                    onClick={() => handleEnd(rel.id, rel.partner.id)}
                    disabled={actionLoading === rel.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Zakończ
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
