"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, Trash2 } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export function NotificationsList({
  notifications,
  currentUserId,
}: {
  notifications: Notification[]
  currentUserId: string
}) {
  const router = useRouter()
  const supabase = createClient()

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)

    router.refresh()
  }

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("user_id", currentUserId)
      .eq("is_read", false)

    router.refresh()
  }

  const deleteNotification = async (notificationId: string) => {
    await supabase.from("notifications").delete().eq("id", notificationId)

    router.refresh()
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} min temu`
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} godz. temu`
    }
    return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const getNotificationIcon = (type: string) => {
    return <Bell className="h-5 w-5" />
  }

  if (notifications.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-100">Brak powiadomień</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Nie masz jeszcze żadnych powiadomień</p>
        </CardContent>
      </Card>
    )
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read)

  return (
    <div className="space-y-4">
      {unreadNotifications.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-200 hover:bg-slate-800 bg-transparent"
          >
            <Check className="h-4 w-4 mr-2" />
            Oznacz wszystkie jako przeczytane
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`border-slate-800 backdrop-blur-xl ${
              notification.is_read ? "bg-slate-900/30" : "bg-slate-900/50 border-blue-900"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${notification.is_read ? "bg-slate-800" : "bg-blue-600"}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-slate-100">{notification.title}</h3>
                    {!notification.is_read && (
                      <Badge variant="default" className="bg-blue-600 text-xs">
                        Nowe
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 mb-2">{notification.message}</p>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{formatTime(notification.created_at)}</span>

                    {notification.link && (
                      <Link href={notification.link}>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                        >
                          Zobacz
                        </Button>
                      </Link>
                    )}

                    {!notification.is_read && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-slate-400 hover:text-slate-300 p-0 h-auto"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Oznacz jako przeczytane
                      </Button>
                    )}

                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-400 hover:text-red-300 p-0 h-auto ml-auto"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
