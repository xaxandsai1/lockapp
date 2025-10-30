// components/app-shell.tsx
"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Users,
  Lock,
  CheckSquare,
  Bell,
  Shield,
  LogOut,
} from "lucide-react"

type UserLite = {
  display_name?: string | null
  avatar_url?: string | null
  is_verified?: boolean | null
}

export function AppShell({
  title,
  subtitle,
  children,
  user,
  isAdmin = false,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  user?: UserLite
  isAdmin?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/relacje", label: "Relacje", icon: Users },
    { href: "/locki", label: "Locki", icon: Lock },
    { href: "/zadania", label: "Zadania", icon: CheckSquare },
    { href: "/powiadomienia", label: "Powiad.", icon: Bell },
  ]
  if (isAdmin) nav.push({ href: "/admin", label: "Admin", icon: Shield })

  const onLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/logowanie")
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      {/* SIDEBAR (desktop) */}
      <aside className="hidden lg:flex flex-col gap-4 border-r border-white/5 bg-[#0D1117] px-4 py-6">
        <div className="px-2">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5"></div>
            <span className="text-sm font-semibold tracking-wide text-slate-200">Control&nbsp;Panel</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-white/5 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
            <Avatar className="h-9 w-9 border border-white/10">
              <AvatarImage src={user?.avatar_url || undefined} />
              <AvatarFallback>{(user?.display_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="truncate text-sm text-slate-200">{user?.display_name || "Użytkownik"}</p>
                {user?.is_verified ? (
                  <Badge className="bg-emerald-600/80">verified</Badge>
                ) : null}
              </div>
              <p className="text-xs text-slate-500">Zalogowano</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" /> Wyloguj się
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="relative">
        {/* TOPBAR */}
        <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0B0E12]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0B0E12]/60">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
            <div className="flex h-14 items-center justify-between">
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold text-white">{title}</h1>
                {subtitle ? <p className="truncate text-xs text-slate-400">{subtitle}</p> : null}
              </div>
              <Link
                href="/profil"
                className="group flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10"
              >
                <Avatar className="h-7 w-7 border border-white/10">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback>{(user?.display_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:block">{user?.display_name || "Profil"}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* PAGE BODY */}
        <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-6">
          {children}
        </div>

        {/* MOBILE DOCK */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-[#0B0E12]/95 px-2 py-2 shadow-2xl lg:hidden">
          <div className="mx-auto grid max-w-[700px] grid-cols-5 gap-2">
            {nav.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px]",
                    active ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
