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
            <span className="text-sm font-semibold tracking-wide text-slate-200">          <svg xmlns="http://www.w3.org/2000/svg" width="250" height="42" viewBox="0 0 1038 219" fill="none" className="h-10 w-auto">
            <path d="M244.108 80.127H262.02V113.866C262.02 121.291 264.683 124.197 272.024 124.197H289.775C297.116 124.197 299.778 121.291 299.778 113.866V80.127H317.69V117.739C317.69 132.268 310.186 139.209 293.728 139.209H268.071C251.612 139.209 244.108 132.268 244.108 117.739" fill="white"/>
            <path d="M329.796 80.127H357.308L377.559 117.739L397.81 80.127H425.322V138.564H407.895V96.5928H407.733L384.255 138.564H370.862L347.384 96.5928H347.223V138.564H329.796" fill="white"/>
            <path d="M455.34 124.52H487.451C491.324 124.52 493.906 123.631 493.906 120.242C493.906 116.287 491.324 115.399 487.451 115.399H455.34V124.52ZM455.34 103.292H487.047C490.356 103.292 492.292 102.081 492.292 98.7718C492.292 95.3826 490.356 94.1712 487.047 94.1712H455.34V103.292ZM437.429 80.127H488.984C503.265 80.127 510.203 84.0014 510.203 95.4632C510.203 105.472 506.572 107.408 501.57 108.861V109.103C509.397 110.072 512.301 114.269 512.301 123.067C512.301 135.9 504.717 138.564 494.471 138.564H437.429" fill="white"/>
            <path d="M541.027 108.861H570.638C575.477 108.861 577.253 106.925 577.253 102.727V100.79C577.253 95.6241 574.671 94.6559 569.025 94.6559H541.027V108.861ZM523.115 80.127H577.174C590.969 80.127 594.682 86.9877 594.682 97.4809V101.193C594.682 109.022 592.906 113.623 584.674 115.56V115.722C590 116.691 594.436 119.031 594.436 128.635V138.564H576.525V131.542C576.525 125.408 574.749 123.389 569.182 123.389H541.027V138.564H523.115" fill="white"/>
            <path d="M606.785 80.127H670.683V93.6871H624.696V103.05H668.264V115.156H624.696V124.52H671.736V138.564H606.785" fill="white"/>
            <path d="M682.545 80.127H700.461V123.551H740.719V138.564H682.545" fill="white"/>
            <path d="M748.303 80.127H766.219V123.551H806.477V138.564H748.303" fill="white"/>
            <path d="M841.895 115.64H864.813L853.192 93.6866L841.895 115.64ZM841.57 80.127H864.891L897 138.563H877.073L871.506 128.232H835.197L829.96 138.563H809.943" fill="white"/>
            <path d="M109.318 5.8347C91.344 5.8347 68.2755 0.0525501 68.2755 0.0525501C67.3862 -0.171334 66.9442 0.341245 67.2977 1.18907L108.683 101.144C109.036 101.992 109.607 101.992 109.96 101.144L151.345 1.18907C151.699 0.341836 151.257 -0.170175 150.362 0.0531254C150.362 0.0531254 127.299 5.8347 109.318 5.8347Z" fill="#155DFC"/>
            <path d="M109.318 212.9C91.344 212.9 68.2755 218.682 68.2755 218.682C67.3862 218.905 66.9442 218.393 67.2977 217.545L108.683 117.591C109.036 116.742 109.607 116.742 109.96 117.591L151.345 217.544C151.699 218.392 151.257 218.904 150.362 218.681C150.362 218.681 127.299 212.9 109.318 212.9Z" fill="#155DFC"/>
            <path d="M5.83008 109.366C5.83008 127.351 0.052528 150.427 0.052528 150.427C-0.171269 151.317 0.341097 151.758 1.18917 151.407L101.103 110.005C101.951 109.653 101.951 109.078 101.103 108.727L1.18917 67.3251C0.341097 66.9735 -0.171269 67.4147 0.052528 68.3058C0.052528 68.3058 5.83008 91.381 5.83008 109.366Z" fill="#155DFC"/>
            <path d="M212.813 109.366C212.813 127.351 218.591 150.427 218.591 150.427C218.815 151.317 218.302 151.758 217.454 151.407L117.541 110.005C116.692 109.653 116.692 109.078 117.541 108.727L217.454 67.3251C218.302 66.9735 218.815 67.4147 218.591 68.3058C218.591 68.3058 212.813 91.381 212.813 109.366Z" fill="#155DFC"/>
            <path d="M182.5 36.1586C169.784 23.4413 157.564 3.03574 157.564 3.03574C157.093 2.24742 156.415 2.29751 156.068 3.14593L114.683 103.1C114.33 103.949 114.736 104.356 115.584 104.004L215.498 62.6023C216.346 62.2502 216.393 61.5769 215.61 61.1044C215.61 61.1044 195.209 48.876 182.5 36.1586Z" fill="white"/>
            <path d="M36.1424 182.576C23.4272 169.858 3.03225 157.63 3.03225 157.63C2.24307 157.157 2.29604 156.484 3.14411 156.132L103.057 114.73C103.906 114.378 104.312 114.785 103.959 115.634L62.5739 215.587C62.2209 216.436 61.5495 216.486 61.0782 215.698C61.0782 215.698 48.8517 195.293 36.1424 182.576Z" fill="white"/>
            <path d="M36.1424 36.1578C23.4272 48.8752 3.03225 61.1036 3.03225 61.1036C2.24307 61.5762 2.29604 62.2494 3.14411 62.601L103.057 104.003C103.906 104.355 104.312 103.948 103.959 103.099L62.5739 3.14621C62.2209 2.29721 61.5495 2.24772 61.0782 3.03546C61.0782 3.03546 48.8517 23.4404 36.1424 36.1578Z" fill="white"/>
            <path d="M182.5 182.576C169.784 195.293 157.564 215.699 157.564 215.699C157.093 216.487 156.415 216.437 156.068 215.587L114.683 115.633C114.33 114.785 114.736 114.379 115.584 114.73L215.498 156.132C216.346 156.484 216.399 157.157 215.61 157.629C215.61 157.629 195.209 169.858 182.5 182.576Z" fill="white"/>
          </svg></span>
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
                  <Badge className="bg-emerald-600/80"><CheckSquare /></Badge>
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
